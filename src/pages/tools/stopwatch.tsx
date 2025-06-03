import { ViewComponentProps } from "@/store/types";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { ScrollView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { useViewModel } from "@/hooks";
import { ScrollViewCore } from "@/domains/ui";
import { StopwatchViewModel } from "@/biz/stopwatch";
import { For, Show } from "solid-js";
import { PageView } from "@/components/page-view";

function StopwatchToolViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    segment() {
      ui.$stopwatch.segment();
    },
    reset() {
      ui.$stopwatch.reset();
    },
    toggle() {
      ui.$stopwatch.toggle();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $stopwatch: StopwatchViewModel({}),
  };
  let _state = {
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

  ui.$stopwatch.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      //       ui.$stopwatch.setStartedAt(new Date("2025/05/29 18:00").valueOf());
      // ui.$stopwatch.setStartedAt(new Date("2025-05-29 18:05").valueOf());
    },
    destroy() {
      ui.$stopwatch.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function StopwatchToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(StopwatchToolViewModel, [props]);

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
    <>
      <PageView store={vm}>
        <div class="flex justify-center">
          <div
            classList={{
              "time-text flex items-center text-w-fg-0 transition-all duration-200": true,
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
          <div
            class="flex items-center justify-center w-16 h-16 rounded-full bg-w-bg-5 text-w-fg-0"
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
            class="flex items-center justify-center w-16 h-16 rounded-full bg-w-bg-5 text-w-fg-0"
            onClick={() => {
              vm.methods.toggle();
            }}
          >
            <Show when={state().stopwatch.running} fallback={<div>开始</div>}>
              <div>暂停</div>
            </Show>
          </div>
        </div>
        <div class="p-4 space-y-4">
          <For each={state().stopwatch.segments}>
            {(seg) => {
              return (
                <div class="flex items-center justify-between text-w-fg-0">
                  <div>分段{seg.idx}</div>
                  <div>{seg.text}</div>
                </div>
              );
            }}
          </For>
        </div>
      </PageView>
    </>
  );
}
