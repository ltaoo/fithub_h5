import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { ListView, ScrollView } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { useViewModel } from "@/hooks";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { continueWorkoutDay, fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";

function WorkoutDayListViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
      continue: new RequestCore(continueWorkoutDay, { client: props.client }),
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
    async handleContinueWorkout(v: { id: number }) {
      props.app.tip({
        icon: "loading",
        text: ["操作中..."],
      });
      const r = await request.workout_day.continue.run({ id: v.id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.history.push("root.workout_day_self", {
        id: String(v.id),
        multiple: "0",
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
                <div class="border-2 border-w-fg-3 p-4 rounded-lg">
                  <div class="text-w-fg-0">{value.workout_plan.title}</div>
                  <div class="text-w-fg-1">{value.started_at_text}</div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm text-w-fg-1">{WorkoutDayStatusTextMap[value.status]}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Show when={[WorkoutDayStatus.Finished, WorkoutDayStatus.GiveUp].includes(value.status)}>
                        <div
                          class="px-4 py-1 border-2 border-w-fg-3 text-w-fg-0 bg-w-bg-5 rounded-full text-sm"
                          onClick={() => {
                            vm.methods.handleContinueWorkout(value);
                          }}
                        >
                          继续
                        </div>
                      </Show>
                      <div
                        class="px-4 py-1 border-2 border-w-fg-3 text-w-fg-0 bg-w-bg-5 rounded-full text-sm"
                        onClick={() => {
                          vm.methods.gotoWorkoutDayProfileView(value);
                        }}
                      >
                        详情
                      </div>
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
