import { For, Show } from "solid-js";

import { useViewModel } from "@/hooks";
import { ViewComponentProps } from "@/store/types";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { ScrollView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { StopwatchViewModel } from "@/biz/stopwatch";
import { CountdownViewModel } from "@/biz/countdown";

function CountdownToolViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    reset() {
      ui.$countdown.reset();
    },
    toggle() {
      ui.$countdown.toggle();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $countdown: CountdownViewModel({ countdown: 5 }),
  };
  let _state = {
    get stopwatch() {
      return ui.$countdown.state;
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

  ui.$countdown.onStateChange(() => methods.refresh());
  ui.$countdown.onStart(() => {
    console.log("start");
  });
  ui.$countdown.onStop(() => {
    console.log("stop");
  });
  ui.$countdown.onResume(() => {
    console.log("resume");
  });
  ui.$countdown.onFinished(() => {
    console.log("completed");
  });

  return {
    methods,
    ui,
    state: _state,
    ready() {
      // ui.$countdown.setStartedAt(new Date("2025/05/29 18:00").valueOf());
    },
    destroy() {
      ui.$view.destroy();
      ui.$countdown.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function CountdownToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(CountdownToolViewModel, [props]);

  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;

  vm.ui.$countdown.onStateChange((v) => {
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
    <>
      <div class="z-0 fixed top-0 left-0 w-full">
        <NavigationBar1 title="倒计时" history={props.history} />
      </div>
      <div class="absolute top-[74px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view}>
          <div class="p-4">
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
          <div class="flex items-center justify-between p-4">
            {/* <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                if (state().stopwatch.running) {
                  vm.methods.segment();
                  return;
                }
                vm.methods.reset();
              }}
            >
              <Show when={state().stopwatch.running} fallback={<div>复位</div>}>
                <div>分段</div>
              </Show>
            </div>
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                vm.methods.toggle();
              }}
            >
              <Show when={state().stopwatch.running} fallback={<div>开始</div>}>
                <div>暂停</div>
              </Show>
            </div> */}
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                vm.ui.$countdown.play();
              }}
            >
              <div>开始</div>
            </div>
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                vm.ui.$countdown.pause();
              }}
            >
              <div>暂停</div>
            </div>
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                vm.ui.$countdown.reset();
              }}
            >
              <div>重新开始</div>
            </div>
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100"
              onClick={() => {
                vm.ui.$countdown.finish();
              }}
            >
              <div>提前完成</div>
            </div>
          </div>
        </ScrollView>
      </div>
    </>
  );
}
