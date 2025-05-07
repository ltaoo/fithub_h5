import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";
import { base, Handler } from "@/domains/base";

export function SetCountdownViewModel(props: {
  countdown: number;
  remaining: number;
  exceed: number;
  finished: boolean;
}) {
  const ui = {
    $countdown1: CountdownViewModel({ countdown: props.countdown, time: props.remaining, finished: props.finished }),
    $countdown2: CountdownViewModel({ time: props.exceed }),
  };

  let _running = false;
  let _state = {
    get running() {
      return _running;
    },
    get remaining() {
      return ui.$countdown1.time;
    },
    get exceed() {
      return ui.$countdown2.time;
    },
  };
  enum Events {
    Start,
    Stop,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Start]: true;
    [Events.Stop]: true;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$countdown1.onFinish(() => {
    ui.$countdown2.start(new Date().valueOf());
  });
  ui.$countdown1.onStop(() => {
    bus.emit(Events.Stop);
  });
  ui.$countdown2.onStop(() => {
    bus.emit(Events.Stop);
  });

  return {
    ui,
    state: _state,
    start() {
      _running = true;
      bus.emit(Events.Start);
      ui.$countdown1.start(new Date().valueOf());
      bus.emit(Events.StateChange, { ..._state });
    },
    interrupt() {
      _running = false;
      bus.emit(Events.StateChange, { ..._state });
      if (ui.$countdown1.state.is_running) {
        ui.$countdown1.interrupt();
        return;
      }
      ui.$countdown2.interrupt();
    },
    ready() {},
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SetCountdownViewModel = ReturnType<typeof SetCountdownViewModel>;

export function SetCountdownView(props: {
  store: SetCountdownViewModel;
  onStart?: () => void;
  onCompleted?: () => void;
}) {
  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;
  let $sub_minutes1: undefined | HTMLDivElement;
  let $sub_minutes2: undefined | HTMLDivElement;
  let $sub_seconds1: undefined | HTMLDivElement;
  let $sub_seconds2: undefined | HTMLDivElement;

  const [state, vm] = useViewModelStore(props.store);
  const [countdown1, setCountdown1State] = createSignal(props.store.ui.$countdown1.state);
  const [countdown2, setCountdown2State] = createSignal(props.store.ui.$countdown2.state);
  // if (props.onCompleted) {
  //   props.store.ui.$countdown1.onComplete(props.onCompleted);
  // }

  props.store.ui.$countdown1.onStateChange((v) => {
    // console.log("[COMPONENT]set-countdown - update")
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
    setCountdown1State(v);
  });
  props.store.ui.$countdown2.onStateChange((v) => {
    if ($sub_minutes1) {
      $sub_minutes1.innerText = v.minutes1;
    }
    if ($sub_minutes2) {
      $sub_minutes2.innerText = v.minutes2;
    }
    if ($sub_seconds1) {
      $sub_seconds1.innerText = v.seconds1;
    }
    if ($sub_seconds2) {
      $sub_seconds2.innerText = v.seconds2;
    }
    setCountdown2State(v);
  });

  return (
    <div class="flex items-center justify-between">
      <div
        classList={{
          "flex items-center transition-all duration-200": true,
          // "text-xl": state().pending,
          "text-4xl": state().running,
          // "text-gray-100": state().finished,
        }}
      >
        <div
          classList={{
            "text-center": true,
            "w-[12px]": countdown1().pending,
            "w-[20px]": state().running,
          }}
          ref={$minutes1}
        >
          {countdown1().minutes1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$minutes2}
        >
          {countdown1().minutes2}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
        >
          :
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$seconds1}
        >
          {countdown1().seconds1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$seconds2}
        >
          {countdown1().seconds2}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
        >
          .
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$ms1}
        >
          {countdown1().ms1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$ms2}
        >
          {countdown1().ms2}
        </div>
      </div>
      <div class="flex items-center gap-2 px-4">
        <Show when={countdown1().pending}>
          <div
            class="flex items-center justify-center px-4 h-10 rounded-lg border border-gray-300 bg-white text-gray-400"
            onClick={() => {
              if (props.onStart) {
                props.onStart();
              }
              props.store.start();
            }}
          >
            <Play size={16} />
          </div>
        </Show>
        <Show when={state().running}>
          <div
            class="flex items-center justify-center px-4 h-10 rounded-lg border border-gray-300 bg-white text-gray-400"
            onClick={() => {
              props.store.interrupt();
            }}
          >
            <Pause size={16} />
          </div>
        </Show>
        <Show when={countdown1().finished && countdown2().time !== 0}>
          <div
            classList={{
              "flex items-center text-red-500": true,
            }}
          >
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
            >
              +
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_minutes1}
            >
              {countdown2().minutes1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_minutes2}
            >
              {countdown2().minutes2}
            </div>
            <div
              classList={{
                "text-center w-[4px]": true,
              }}
            >
              :
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_seconds1}
            >
              {countdown2().seconds1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_seconds2}
            >
              {countdown2().seconds2}
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
