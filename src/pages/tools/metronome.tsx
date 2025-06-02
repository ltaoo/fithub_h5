import { createSignal, onCleanup, onMount } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";

function MetronomeToolViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
  };
  let _state = {
    tempo: 120,
    isPlaying: false,
    currentBeat: 0,
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MetronomeToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MetronomeToolViewModel, [props]);
  const [tempo, setTempo] = createSignal(120);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentBeat, setCurrentBeat] = createSignal(0);
  let audioContext: AudioContext | null = null;
  let timerId: number | null = null;

  onCleanup(() => {
    if (timerId) {
      clearInterval(timerId);
    }
    if (audioContext) {
      audioContext.close();
    }
  });

  const playClick = () => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const toggleMetronome = () => {
    if (isPlaying()) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    } else {
      const interval = (60 / tempo()) * 1000;
      timerId = window.setInterval(() => {
        playClick();
        setCurrentBeat((prev) => (prev + 1) % 4);
      }, interval);
    }
    setIsPlaying(!isPlaying());
  };

  const handleTempoChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setTempo(value);
    if (isPlaying()) {
      if (timerId) {
        clearInterval(timerId);
      }
      const interval = (60 / value) * 1000;
      timerId = window.setInterval(() => {
        playClick();
        setCurrentBeat((prev) => (prev + 1) % 4);
      }, interval);
    }
  };

  return (
    <PageView store={vm}>
      <div style={{ padding: "20px", "text-align": "center" }}>
        <div style={{ "margin-bottom": "20px" }}>
          <div style={{ "font-size": "24px", "font-weight": "bold" }}>{tempo()} BPM</div>
        </div>

        <div style={{ "margin-bottom": "20px" }}>
          <input type="range" min="40" max="208" value={tempo()} onInput={handleTempoChange} style={{ width: "80%" }} />
        </div>

        <button
          onClick={toggleMetronome}
          style={{
            padding: "10px 20px",
            "font-size": "16px",
            "background-color": isPlaying() ? "#ff4d4f" : "#1890ff",
            color: "white",
            border: "none",
            "border-radius": "4px",
            cursor: "pointer",
          }}
        >
          {isPlaying() ? "停止" : "开始"}
        </button>

        <div
          style={{
            display: "flex",
            "justify-content": "center",
            gap: "10px",
            "margin-top": "20px",
          }}
        >
          {[0, 1, 2, 3].map((beat) => (
            <div
              style={{
                width: "20px",
                height: "20px",
                "border-radius": "50%",
                "background-color": currentBeat() === beat ? "#1890ff" : "#d9d9d9",
                transition: "background-color 0.1s ease",
              }}
            />
          ))}
        </div>
      </div>
    </PageView>
  );
}
