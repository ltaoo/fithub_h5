/**
 * @file 某次训练的详情
 */
import { For, Show } from "solid-js";
import { ChevronLeft, Loader2, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";
import { SetValueView } from "@/components/set-value-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import { fetchWorkoutDayProfile, fetchWorkoutDayProfileProcess } from "@/biz/workout_day/services";
import {
  fetchWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDayProcess,
} from "@/biz/workout_action/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { toNumber } from "@/utils/primitive";

function WorkoutDayProfileViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      profile: new RequestCore(fetchWorkoutDayProfile, {
        process: fetchWorkoutDayProfileProcess,
        client: props.client,
      }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutDay, {
          process: fetchWorkoutActionHistoryListOfWorkoutDayProcess,
          client: props.client,
        }),
        {
          pageSize: 1000,
        }
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
  };
  const ui = {
    $view: new ScrollViewCore(),
  };
  let _state = {
    get loading() {
      return request.workout_day.profile.loading;
    },
    get profile() {
      return request.workout_day.profile.response;
    },
    get action_histories() {
      return request.workout_action_history.list.response;
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

  request.workout_day.profile.onStateChange((v) => methods.refresh());
  request.workout_action_history.list.onStateChange((v) => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        props.app.tip({
          text: ["参数错误"],
        });
        return;
      }
      const r = await request.workout_day.profile.run({ id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      if (r.data.status !== WorkoutDayStatus.Finished) {
        return;
      }
      request.workout_action_history.list.init({ workout_day_id: id });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayProfileViewModel, [props]);

  return (
    <>
      <PageView store={vm} hide_bottom_bar={props.view.query.hide_bottom === "1"}>
        <Show when={state().loading}>
          <div class="p-4 flex items-center justify-center">
            <Loader2 class="w-8 h-8 text-w-fg-0 animate-spin" />
          </div>
        </Show>
        <Show when={state().profile}>
          <div class="text-w-fg-0">
            <div class="py-2 px-4 ">
              <div class="text-2xl">{state().profile?.title}</div>
              <Show
                when={state().profile!.status === WorkoutDayStatus.Finished}
                fallback={<div class="">开始于 {state().profile!.started_at_text}</div>}
              >
                <div class="flex items-center">
                  <div class="">{state().profile!.started_at_text}</div>
                  <div class="mx-2">-</div>
                  <div class="">{state().profile!.finished_at_text}</div>
                </div>
              </Show>
              <div class="text-w-fg-1">{WorkoutDayStatusTextMap[state().profile!.status]}</div>
            </div>
            <div>
              <Show when={state().profile!.status === WorkoutDayStatus.Finished}>
                <div class="flex items-center gap-2 mt-4">
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0">耗时</div>
                    <div class="flex items-end truncate">
                      <div class="text-3xl">{state().profile!.minutes}</div>
                      <div>分钟</div>
                    </div>
                  </div>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0">总容量</div>
                    <div class="flex items-end truncate">
                      <div class="text-3xl">{state().profile!.total_weight}</div>
                      <div>公斤</div>
                    </div>
                  </div>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0 truncate">总组数</div>
                    <div class="flex items-end truncate">
                      <div class="text-xl">{state().profile!.total_set_count}</div>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </div>
          <Divider />
          <div class="py-2 space-y-2">
            <For each={state().action_histories.dataSource}>
              {(value) => {
                return (
                  <div class="p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0">
                    <div class="">{value.action.zh_name}</div>
                    <div class="mt-2">
                      <SetValueView
                        weight={value.weight}
                        weight_unit={value.weight_unit}
                        reps={value.reps}
                        reps_unit={value.reps_unit}
                      />
                    </div>
                    <div class="mt-2 text-w-fg-1 text-sm">{value.created_at}</div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </PageView>
    </>
  );
}
