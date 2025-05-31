import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { ListView, ScrollView } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { useViewModel } from "@/hooks";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { PageView } from "@/components/page-view";

function WorkoutDayListViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    gotoWorkoutDayProfileView(v: { id: number }) {
      props.history.push("root.workout_day_profile", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.workout_day.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.workout_day.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };
  let _state = {
    get response() {
      return request.workout_day.list.response;
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

  request.workout_day.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.workout_day.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayListViewModel, [props]);
  return (
    <>
      <PageView store={vm}>
        <ListView store={vm.request.workout_day.list} class="space-y-2">
          <For each={state().response.dataSource}>
            {(value) => {
              return (
                <div
                  class="border-2 border-w-bg-5 p-4 rounded-lg"
                  onClick={() => {
                    vm.methods.gotoWorkoutDayProfileView(value);
                  }}
                >
                  <div class="text-w-fg-1">{value.started_at_text}</div>
                  {/* <Show when={value.finished_at}>
                    <div class="">{value.finished_at}</div>
                  </Show> */}
                  <div class="flex flex-wrap mt-2">
                    <div class="px-2 py-1 rounded-xl border-2 border-w-bg-5 text-sm text-w-fg-1">
                      {WorkoutDayStatusTextMap[value.status]}
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
    </>
  );
}
