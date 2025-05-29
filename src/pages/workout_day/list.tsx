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
      <div class="z-0 fixed top-0 left-0 w-full">
        <NavigationBar1 title="训练记录列表" history={props.history} />
      </div>
      <div class="absolute top-[74px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view}>
          <div class="p-4">
            <ListView store={vm.request.workout_day.list} class="space-y-2">
              <For each={state().response.dataSource}>
                {(value) => {
                  return (
                    <div
                      class="border p-4 rounded-md"
                      onClick={() => {
                        vm.methods.gotoWorkoutDayProfileView(value);
                      }}
                    >
                      <div class="text-xl">{value.started_at_text}</div>
                      {/* <Show when={value.finished_at}>
                    <div class="">{value.finished_at}</div>
                  </Show> */}
                      <div class="flex flex-wrap mt-2">
                        <div class="inline-block border px-2 py-1 rounded-full text-sm">
                          {WorkoutDayStatusTextMap[value.status]}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </ListView>
          </div>
        </ScrollView>
      </div>
    </>
  );
}
