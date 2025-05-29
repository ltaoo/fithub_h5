/**
 * @file 动作倒计时，用于计数单位是 s 的动作
 */
import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";
import { base, Handler } from "@/domains/base";

export function SetActionCountdownViewModel(props: {
  workout_duration: number;
  rest_duration: number;
  time1?: number;
  time2?: number;
  time3?: number;
  finished: boolean;
}) {
  const ui = {
    $countdown1: CountdownViewModel({
      countdown: props.workout_duration,
      time: props.time1,
      // finished: props.time1 !== undefined && props.time1 < props.workout_duration,
      finished: props.time1 === 0,
    }),
    $countdown2: CountdownViewModel({
      countdown: props.rest_duration,
      time: props.time2,
      // finished: props.time2 !== undefined && props.time2 < props.rest_duration,
      finished: props.time2 === 0,
    }),
    $countdown3: CountdownViewModel({ time: props.time3, finished: props.time3 === 0 }),
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
    Completed,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Stop]: true;
    [Events.Completed]: void;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$countdown1.onCompleted(() => {
    ui.$countdown2.start(new Date().valueOf());
  });
  ui.$countdown2.onCompleted(() => {
    bus.emit(Events.Completed);
    // ui.$countdown3.start(new Date().valueOf());
  });
  ui.$countdown1.onStop(() => {
    bus.emit(Events.Stop);
  });
  ui.$countdown2.onStop(() => {
    bus.emit(Events.Stop);
  });
  ui.$countdown3.onStop(() => {
    bus.emit(Events.Stop);
  });

  return {
    ui,
    state: _state,
    start() {
      _running = true;
      ui.$countdown1.start(new Date().valueOf());
      bus.emit(Events.Start);
      bus.emit(Events.StateChange, { ..._state });
    },
    stop() {
      _running = false;
      bus.emit(Events.StateChange, { ..._state });
      if (ui.$countdown1.state.running) {
        ui.$countdown1.pause();
        return;
      }
      if (ui.$countdown2.state.running) {
        ui.$countdown2.pause();
        return;
      }
      ui.$countdown3.pause();
    },
    get time1() {
      return ui.$countdown1.time;
    },
    get time2() {
      return ui.$countdown2.time;
    },
    get time3() {
      return ui.$countdown3.time;
    },
    ready() {},
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onCompleted(handler: Handler<TheTypesOfEvents[Events.Completed]>) {
      return bus.on(Events.Completed, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SetActionCountdownViewModel = ReturnType<typeof SetActionCountdownViewModel>;

export function SetActionCountdownView(props: {
  store: SetActionCountdownViewModel;
  onStart?: () => void;
  onCompleted?: () => void;
}) {
  let $a_minutes1: undefined | HTMLDivElement;
  let $a_minutes2: undefined | HTMLDivElement;
  let $a_seconds1: undefined | HTMLDivElement;
  let $a_seconds2: undefined | HTMLDivElement;
  let $a_ms1: undefined | HTMLDivElement;
  let $a_ms2: undefined | HTMLDivElement;
  let $b_minutes1: undefined | HTMLDivElement;
  let $b_minutes2: undefined | HTMLDivElement;
  let $b_seconds1: undefined | HTMLDivElement;
  let $b_seconds2: undefined | HTMLDivElement;
  let $b_ms1: undefined | HTMLDivElement;
  let $b_ms2: undefined | HTMLDivElement;
  let $c_minutes1: undefined | HTMLDivElement;
  let $c_minutes2: undefined | HTMLDivElement;
  let $c_seconds1: undefined | HTMLDivElement;
  let $c_seconds2: undefined | HTMLDivElement;
  let $c_ms1: undefined | HTMLDivElement;
  let $c_ms2: undefined | HTMLDivElement;

  const [state, vm] = useViewModelStore(props.store);
  const [countdown1, setCountdown1State] = createSignal(props.store.ui.$countdown1.state);
  const [countdown2, setCountdown2State] = createSignal(props.store.ui.$countdown2.state);
  const [countdown3, setCountdown3State] = createSignal(props.store.ui.$countdown3.state);

  props.store.ui.$countdown1.onStateChange((v) => {
    // console.log("[COMPONENT]set-countdown - update")
    if ($a_minutes1) {
      $a_minutes1.innerText = v.minutes1;
    }
    if ($a_minutes2) {
      $a_minutes2.innerText = v.minutes2;
    }
    if ($a_seconds1) {
      $a_seconds1.innerText = v.seconds1;
    }
    if ($a_seconds2) {
      $a_seconds2.innerText = v.seconds2;
    }
    if ($a_ms1) {
      $a_ms1.innerText = v.ms1;
    }
    if ($a_ms2) {
      $a_ms2.innerText = v.ms2;
    }
    setCountdown1State(v);
  });
  props.store.ui.$countdown2.onStateChange((v) => {
    if ($b_minutes1) {
      $b_minutes1.innerText = v.minutes1;
    }
    if ($b_minutes2) {
      $b_minutes2.innerText = v.minutes2;
    }
    if ($b_seconds1) {
      $b_seconds1.innerText = v.seconds1;
    }
    if ($b_seconds2) {
      $b_seconds2.innerText = v.seconds2;
    }
    setCountdown2State(v);
  });
  // props.store.ui.$countdown3.onStateChange((v) => {
  //   if ($c_minutes1) {
  //     $c_minutes1.innerText = v.minutes1;
  //   }
  //   if ($c_minutes2) {
  //     $c_minutes2.innerText = v.minutes2;
  //   }
  //   if ($c_seconds1) {
  //     $c_seconds1.innerText = v.seconds1;
  //   }
  //   if ($c_seconds2) {
  //     $c_seconds2.innerText = v.seconds2;
  //   }
  //   setCountdown3State(v);
  // });

  return (
    <div class="flex items-center gap-4">
      <div
        classList={{
          "flex items-center transition-all duration-200": true,
        }}
      >
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_minutes1}
        >
          {countdown1().minutes1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_minutes2}
        >
          {countdown1().minutes2}
        </div>
        <div
          classList={{
            "text-center w-[6px]": true,
            "": state().running,
          }}
        >
          :
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_seconds1}
        >
          {countdown1().seconds1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_seconds2}
        >
          {countdown1().seconds2}
        </div>
        <div
          classList={{
            "text-center w-[6px]": true,
          }}
        >
          .
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_ms1}
        >
          {countdown1().ms1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_ms2}
        >
          {countdown1().ms2}
        </div>
      </div>
      <div class="flex items-center">
        <Show when={countdown1().completed}>
          <div
            classList={{
              "flex items-center text-green-500": true,
            }}
          >
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$b_minutes1}
            >
              {countdown2().minutes1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$b_minutes2}
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
              ref={$b_seconds1}
            >
              {countdown2().seconds1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$b_seconds2}
            >
              {countdown2().seconds2}
            </div>
            <div
              classList={{
                "text-center w-[4px]": true,
              }}
            >
              .
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$b_ms1}
            >
              {countdown2().ms1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$b_ms2}
            >
              {countdown2().ms2}
            </div>
          </div>
        </Show>
      </div>
      {/* <div class="flex items-center">
        <Show when={countdown2().finished}>
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
              ref={$c_minutes1}
            >
              {countdown3().minutes1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$c_minutes2}
            >
              {countdown3().minutes2}
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
              ref={$c_seconds1}
            >
              {countdown3().seconds1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$c_seconds2}
            >
              {countdown3().seconds2}
            </div>
            <div
              classList={{
                "text-center w-[4px]": true,
              }}
            >
              .
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$c_ms1}
            >
              {countdown3().ms1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$c_ms2}
            >
              {countdown3().ms2}
            </div>
          </div>
        </Show>
      </div> */}
    </div>
  );
}
