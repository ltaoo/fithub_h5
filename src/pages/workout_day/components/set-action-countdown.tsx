/**
 * @file 动作倒计时，用于计数单位是 s 的动作
 */
import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";
import { base, Handler } from "@/domains/base";
import { StopwatchViewModel } from "@/biz/stopwatch";

export function SetActionCountdownViewModel(props: {
  countdown: number;
  rest_duration: number;
  time1?: number;
  time2?: number;
  time3?: number;
  finished: boolean;
  no_rest_countdown?: boolean;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    /** 动作执行倒计时 */
    $countdown1: CountdownViewModel({
      countdown: props.countdown,
      time: props.time1,
      // finished: props.time1 !== undefined && props.time1 < props.workout_duration,
      finished: props.time1 === 0,
    }),
    /** 动作休息倒计时 */
    $countdown2: CountdownViewModel({
      countdown: props.rest_duration,
      time: props.time2,
      // finished: props.time2 !== undefined && props.time2 < props.rest_duration,
      finished: props.time2 === 0,
    }),
    /** 计算休息的超出时间，废弃了 */
    $stopwatch: StopwatchViewModel({ time: props.time3 }),
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
    get show_countdown2() {
      return !props.no_rest_countdown;
    },
  };
  enum Events {
    Start,
    Stop,
    Finished,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Stop]: true;
    [Events.Finished]: void;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$countdown1.onStart(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown1.onStart");
    _running = true;
    bus.emit(Events.Start);
    methods.refresh();
  });
  ui.$countdown2.onStart(() => {
    _running = true;
    methods.refresh();
  });
  ui.$countdown1.onResume(() => {
    _running = true;
    methods.refresh();
  });
  ui.$countdown2.onResume(() => {
    _running = true;
    methods.refresh();
  });
  ui.$countdown1.onFinished(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown1.onFinished");
    if (props.no_rest_countdown) {
      _running = false;
      bus.emit(Events.Finished);
      methods.refresh();
      return;
    }
    ui.$countdown2.start(new Date().valueOf());
  });
  ui.$countdown2.onFinished(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown2.onFinished");
    bus.emit(Events.Finished);
  });

  ui.$countdown1.onStop(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown1.onStop");
    _running = false;
    bus.emit(Events.Stop);
    methods.refresh();
  });
  ui.$countdown2.onStop(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown2.onStop");
    _running = false;
    bus.emit(Events.Stop);
    methods.refresh();
  });
  ui.$countdown2.onCompleted(() => {
    console.log("[BIZ]workout_day/set-action-countdown - countdown2.onCompleted");
    _running = false;
    // bus.emit(Events.Stop);
    methods.refresh();
  });

  return {
    ui,
    state: _state,
    start() {
      console.log(
        "[BIZ]workout_day/set-action-countdown - start",
        ui.$countdown1.state.completed,
        ui.$countdown2.state.completed
      );
      if (ui.$countdown2.state.paused) {
        ui.$countdown2.play();
        return;
      }
      ui.$countdown1.play();
    },
    pause() {
      console.log("[BIZ]workout_day/set-action-countdown - pause");
      if (ui.$countdown2.state.running) {
        ui.$countdown2.pause();
        return;
      }
      if (ui.$countdown1.state.running) {
        ui.$countdown1.pause();
        return;
      }
    },
    get time1() {
      return ui.$countdown1.time;
    },
    get time2() {
      return ui.$countdown2.time;
    },
    get time3() {
      return ui.$stopwatch.time;
    },
    ready() {},
    destroy() {
      ui.$countdown1.destroy();
      ui.$countdown2.destroy();
      ui.$stopwatch.destroy();
    },
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onStop(handler: Handler<TheTypesOfEvents[Events.Stop]>) {
      return bus.on(Events.Stop, handler);
    },
    onFinished(handler: Handler<TheTypesOfEvents[Events.Finished]>) {
      return bus.on(Events.Finished, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SetActionCountdownViewModel = ReturnType<typeof SetActionCountdownViewModel>;

export function SetActionCountdownView(props: {
  store: SetActionCountdownViewModel;
  highlight?: boolean;
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
  const [countdown3, setCountdown3State] = createSignal(props.store.ui.$stopwatch.state);

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
    <div class="set-act-countdown flex items-center gap-4">
      <div
        class="set-countdown-btn overflow-hidden rounded-full relative flex items-center gap-2"
        classList={{
          "bg-w-fg-5": props.highlight,
        }}
      >
        <div
          class=""
          classList={{
            "flex items-center justify-center p-2 rounded-full": true,
          }}
          onClick={(event) => {
            const { x, y } = event;
            // if (props.onClick) {
            //   props.onClick({ x, y, finished: vm.state.running });
            // }
            if (vm.state.running) {
              vm.pause();
              return;
            }
            vm.start();
          }}
        >
          <Show
            when={state().running}
            fallback={
              <div
                classList={{
                  "text-w-fg-0": !!props.highlight,
                  "text-w-fg-1": !props.highlight,
                }}
              >
                <Play class="w-4 h-4" />
              </div>
            }
          >
            <div
              classList={{
                "text-w-fg-0": !!props.highlight,
                "text-w-fg-1": !props.highlight,
              }}
            >
              <Pause class="w-4 h-4" />
            </div>
          </Show>
        </div>
      </div>
      <div>
        <div
          classList={{
            "flex items-center transition-all duration-200": true,
            "text-4xl text-w-fg-0": state().running,
            "text-w-fg-1": !state().running,
          }}
        >
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_minutes1}
          >
            {countdown1().minutes1}
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_minutes2}
          >
            {countdown1().minutes2}
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[12px]": state().running,
              "width-[6px]": !state().running,
            }}
          >
            :
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_seconds1}
          >
            {countdown1().seconds1}
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_seconds2}
          >
            {countdown1().seconds2}
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[12px]": state().running,
              "width-[6px]": !state().running,
            }}
          >
            .
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_ms1}
          >
            {countdown1().ms1}
          </div>
          <div
            classList={{
              "text-center": true,
              "width-[18px]": state().running,
              "width-[10px]": !state().running,
            }}
            ref={$a_ms2}
          >
            {countdown1().ms2}
          </div>
        </div>
        <div class="flex items-center">
          <Show when={countdown1().completed && state().show_countdown2}>
            <div
              classList={{
                "flex items-center text-w-green": true,
                "text-4xl": state().running,
              }}
            >
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_minutes1}
              >
                {countdown2().minutes1}
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_minutes2}
              >
                {countdown2().minutes2}
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[12px]": state().running,
                  "width-[4px]": !state().running,
                }}
              >
                :
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_seconds1}
              >
                {countdown2().seconds1}
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_seconds2}
              >
                {countdown2().seconds2}
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[12px]": state().running,
                  "width-[4px]": !state().running,
                }}
              >
                .
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_ms1}
              >
                {countdown2().ms1}
              </div>
              <div
                classList={{
                  "text-center": true,
                  "width-[18px]": state().running,
                  "width-[10px]": !state().running,
                }}
                ref={$b_ms2}
              >
                {countdown2().ms2}
              </div>
            </div>
          </Show>
        </div>
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
