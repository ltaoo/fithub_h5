import { For, Show } from "solid-js";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore } from "@/domains/request";
import { ScrollViewCore } from "@/domains/ui";
import {
  refreshWorkoutActionStats,
  refreshWorkoutDays,
  refreshWorkoutStats,
  refreshWorkoutStatsProcess,
} from "@/biz/coach/service";
import { toNumber } from "@/utils/primitive";
import { SetValueView } from "@/components/set-value-view";

function WorkoutReportMonthModel(props: ViewComponentProps) {
  const request = {
    workout: {
      stats: new RequestCore(refreshWorkoutStats, { process: refreshWorkoutStatsProcess, client: props.client }),
    },
    workout_action: {
      stats: new RequestCore(refreshWorkoutActionStats, { client: props.client }),
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
    $view: new ScrollViewCore({}),
    $history: props.history,
  };
  let _state = {
    get title() {
      return props.view.query.title ?? "月度总结";
    },
    get profile() {
      return request.workout.stats.response;
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

  request.workout.stats.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      const start = toNumber(props.view.query.start);
      if (start === null) {
        return;
      }
      const end = toNumber(props.view.query.end);
      if (end === null) {
        return;
      }
      request.workout.stats.run({
        range_of_start: dayjs(start).toDate(),
        range_of_end: dayjs(end).toDate(),
      });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export function WorkoutReportMonthView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutReportMonthModel, [props]);

  return (
    <PageView store={vm}>
      <div class="text-3xl text-w-fg-0">{state().title}</div>
      <Show when={state().profile}>
        <div class="flex items-end text-w-fg-0">
          <div>本月共</div>
          <div class="text-2xl mx-1">{state().profile?.stats.total_workout_days}</div>
          <div>天进行了训练</div>
        </div>
        <div class="flex items-end text-w-fg-0">
          <div>共完成了</div>
          <div class="text-2xl mx-1">{state().profile?.stats.total_workout_times}</div>
          <div>次训练</div>
        </div>
        <div class=" text-w-fg-0">
          <For each={state().profile?.workout_day_group_with_type}>
            {(v) => {
              return (
                <div class="flex items-end">
                  <div>{v.type_text}</div>
                  <div>共</div>
                  <div class="text-2xl">{v.day_count}</div>
                  <div>次</div>
                </div>
              );
            }}
          </For>
        </div>
        <div class="text-w-fg-0 mt-4">
          <div>最早开始的一次训练</div>
          <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1">
            {state().profile?.earliest_start_day.workout_plan.title}
            <div class="text-xl text-w-fg-0">{state().profile?.earliest_start_day.started_at_text}</div>
          </div>
        </div>
        <div class="text-w-fg-0 mt-2">
          <div>最晚结束的一次训练</div>
          <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1">
            {state().profile?.latest_finish_day.workout_plan.title}
            <div class="text-xl text-w-fg-0">{state().profile?.latest_finish_day.finished_at_text}</div>
          </div>
        </div>
        <div class="text-w-fg-0 mt-2">
          <div>容量最大的一次训练</div>
          <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1">
            {state().profile?.max_volume_day.workout_plan.title}
            <div class="text-xl text-w-fg-0">{state().profile?.max_volume_day.total_volume}公斤</div>
          </div>
        </div>
        <div class="text-w-fg-0 mt-2">
          <div>耗时最长的一次训练</div>
          <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1">
            {state().profile?.max_duration_day.workout_plan.title}
            <div class="text-xl text-w-fg-0">{state().profile?.max_duration_day.duration}分钟</div>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-w-fg-0 text-2xl">动作统计</div>
          <div class="grid grid-cols-3 gap-2 w-full overflow-x-auto mt-2">
            <For each={state().profile?.action_stats}>
              {(action) => {
                return (
                  <div class="p-2 border-2 border-w-fg-3 rounded-lg">
                    <div class="text-w-fg-0">{action.action}</div>
                    <div class="flex items-end text-w-fg-0">
                      <div>共</div>
                      <div class="text-lg">{action.records.length}</div>
                      <div>组</div>
                    </div>
                    {/* <div class="flex gap-2">
                      <For each={action.records}>
                        {(v) => {
                          return (
                            <div class="whitespace-nowrap">
                              <SetValueView
                                weight={v.weight}
                                weight_unit={v.weight_unit}
                                reps={v.reps}
                                reps_unit={v.reps_unit}
                              />
                            </div>
                          );
                        }}
                      </For>
                    </div> */}
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </PageView>
  );
}
