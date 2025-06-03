import { createSignal, onCleanup, onMount } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { StopwatchViewModel } from "@/biz/stopwatch";

function MetronomeToolViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    playTick() {
      if (!_audio_context) {
        _audio_context = new AudioContext();
      }
      const oscillator = _audio_context.createOscillator();
      const gainNode = _audio_context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(_audio_context.destination);

      // 第四个节拍使用不同的音高和音量
      if (_cur_beat === _beat_num - 1) {
        oscillator.frequency.value = 1500; // 更高的音高
        gainNode.gain.value = 0.2; // 更大的音量
      } else {
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.1;
      }
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, _audio_context.currentTime + 0.1);
      oscillator.stop(_audio_context.currentTime + 0.1);
    },
    toggle() {
      if (_is_playing) {
        methods.pause();
        return;
      }
      methods.play(_tempo);
    },
    pause() {
      _is_playing = false;
      methods.refresh();
      ui.$stopwatch.pause();
      if (_timer_id) {
        clearInterval(_timer_id);
        _timer_id = null;
      }
    },
    play(tempo: number) {
      _is_playing = true;
      methods.refresh();
      const interval = (60 / tempo) * 1000;
      ui.$stopwatch.play();
      _timer_id = window.setInterval(() => {
        methods.playTick();
        _cur_beat = (_cur_beat + 1) % _beat_num;
        methods.refresh();
      }, interval);
    },
    handleTempoChange(value: number) {
      _tempo = value;
      if (_is_playing) {
        methods.pause();
        methods.play(value);
      }
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $stopwatch: StopwatchViewModel({}),
  };

  let _audio_context: AudioContext | null = null;
  let _timer_id: number | null = null;
  let _is_playing = false;
  let _cur_beat = 0;
  let _beat_num = 4;
  let _tempo = 120;

  let _state = {
    get tempo() {
      return _tempo;
    },
    get is_playing() {
      return _is_playing;
    },
    get cur_beat() {
      return _cur_beat;
    },
    get stopwatch() {
      return ui.$stopwatch.state;
    },
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
    destroy() {
      if (_timer_id) {
        clearInterval(_timer_id);
      }
      if (_audio_context) {
        _audio_context.close();
      }
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MetronomeToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MetronomeToolViewModel, [props]);

  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;

  vm.ui.$stopwatch.onStateChange((v) => {
    if ($minutes1) {
      $minutes1.innerText = v.minutes1;
    }
    if ($minutes2) {
      $minutes2.innerText = v.minutes2;
    }
    if ($seconds1) {
      $seconds1.innerText = v.seconds1;
    }
    if ($seconds2) {
      $seconds2.innerText = v.seconds2;
    }
    if ($ms1) {
      $ms1.innerText = v.ms1;
    }
    if ($ms2) {
      $ms2.innerText = v.ms2;
    }
  });

  return (
    <PageView store={vm}>
      <div style={{ padding: "20px", "text-align": "center" }}>
        <div style={{ "margin-bottom": "20px" }}>
          <div style={{ "font-size": "24px", "font-weight": "bold" }}>{state().tempo} BPM</div>
        </div>
        <div style={{ "margin-bottom": "20px" }}>
          <input
            type="range"
            min="40"
            max="208"
            value={state().tempo}
            style={{ width: "80%" }}
            onInput={(event) => {
              const v = Number(event.currentTarget.value);
              vm.methods.handleTempoChange(v);
            }}
          />
        </div>
        <button
          style={{
            padding: "10px 20px",
            "font-size": "16px",
            "background-color": state().is_playing ? "#ff4d4f" : "#1890ff",
            color: "white",
            border: "none",
            "border-radius": "4px",
          }}
          onClick={() => {
            vm.methods.toggle();
          }}
        >
          {state().is_playing ? "停止" : "开始"}
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
                "background-color": state().cur_beat === beat ? "#1890ff" : "#d9d9d9",
                transition: "background-color 0.1s ease",
              }}
            />
          ))}
        </div>
      </div>
      <div class="flex justify-center">
        <div
          classList={{
            "time-text flex items-center transition-all duration-200": true,
            "text-4xl": true,
          }}
        >
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$minutes1}
          >
            {state().stopwatch.minutes1}
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$minutes2}
          >
            {state().stopwatch.minutes2}
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
          >
            :
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$seconds1}
          >
            {state().stopwatch.seconds1}
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$seconds2}
          >
            {state().stopwatch.seconds2}
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
          >
            .
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$ms1}
          >
            {state().stopwatch.ms1}
          </div>
          <div
            classList={{
              "text-center": true,
              "w-[20px]": true,
            }}
            ref={$ms2}
          >
            {state().stopwatch.ms2}
          </div>
        </div>
      </div>
    </PageView>
  );
}
