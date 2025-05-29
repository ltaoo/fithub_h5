/**
 * @file 组间歇 倒计时
 */
import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";

import { base, Handler } from "@/domains/base";
import { CountdownViewModel } from "@/biz/countdown";
import { StopwatchViewModel } from "@/biz/stopwatch";

export function SetCountdownViewModel(props: {
  countdown: number;
  remaining: number;
  exceed: number;
  finished: boolean;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $countdown: CountdownViewModel({ countdown: props.countdown, time: props.remaining, finished: props.finished }),
    $stopwatch: StopwatchViewModel({ time: props.exceed }),
  };

  let _running = false;
  let _paused = false;
  let _state = {
    get running() {
      return _running;
    },
    get paused() {
      return _paused;
    },
    get remaining() {
      return ui.$countdown.time;
    },
    get exceed() {
      return ui.$stopwatch.time;
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

  ui.$countdown.onStart(() => {
      console.log("[BIZ]workout_day/SetCountdown - countdown.onStart", _running, _paused);
    _running = true;
    _paused = false;
    bus.emit(Events.Start);
    methods.refresh();
  });
  ui.$countdown.onFinished(() => {
    console.log("[BIZ]workout_day/SetCountdown - countdown1.onFinished");
    ui.$stopwatch.start(new Date().valueOf());
  });
  ui.$countdown.onStop(() => {
    _running = false;
    _paused = true;
    bus.emit(Events.Stop);
    methods.refresh();
  });
  ui.$stopwatch.onStop(() => {
    _running = false;
    _paused = true;
    bus.emit(Events.Stop);
    methods.refresh();
  });

  return {
    ui,
    state: _state,
    start() {
      console.log("[BIZ]workout_day/SetCountdown - start", _running, _paused);
      ui.$countdown.start(new Date().valueOf());
      bus.emit(Events.StateChange, { ..._state });
    },
    pause() {
      console.log("[BIZ]workout_day/SetCountdown - pause", _paused);
      if (ui.$countdown.state.running) {
        ui.$countdown.pause();
        return;
      }
      ui.$stopwatch.pause();
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
  const [countdown1, setCountdown1State] = createSignal(props.store.ui.$countdown.state);
  const [countdown2, setCountdown2State] = createSignal(props.store.ui.$stopwatch.state);
  // if (props.onCompleted) {
  //   props.store.ui.$countdown1.onComplete(props.onCompleted);
  // }

  props.store.ui.$countdown.onStateChange((v) => {
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
  props.store.ui.$stopwatch.onStateChange((v) => {
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
          "flex items-center text-w-fg-1 transition-all duration-200": true,
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
            classList={{
              "flex items-center justify-center p-2 rounded-full bg-white": true,
            }}
          >
            <div
              class="text-gray-400"
              onClick={() => {
                if (props.onStart) {
                  props.onStart();
                }
                props.store.start();
              }}
            >
              <Play class="w-4 h-4" />
            </div>
          </div>
        </Show>
        <Show when={state().running}>
          <div
            classList={{
              "flex items-center justify-center p-2 rounded-full bg-white": true,
            }}
          >
            <div
              class="text-gray-400"
              onClick={() => {
                props.store.pause();
              }}
            >
              <Pause class="w-4 h-4" />
            </div>
          </div>
        </Show>
        <Show when={countdown1().completed && countdown2().time !== 0}>
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
