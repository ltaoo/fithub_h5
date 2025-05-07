import { For, Show } from "solid-js";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, Input, ScrollView, Textarea } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/select";
import { WorkoutPlanSelectView } from "@/components/workout-plan-select";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";

import { WorkoutPlanCollectionValuesModel } from "./model";
import { map_weekday_text } from "@/biz/workout_plan/workout_plan_collection";

function WorkoutPlanCollectionCreateViewModel(props: ViewComponentProps) {
  const $model = WorkoutPlanCollectionValuesModel(props);

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickWeekday: $model.methods.handleClickWeekday,
    ensureSelectedWorkoutPlan: $model.methods.ensureSelectedWorkoutPlan,
    hideWorkoutPlanSelectDialog: $model.methods.hideWorkoutPlanSelectDialog,
    toBody: $model.methods.toBody,
    submit: $model.methods.submit,
  };
  const ui = {
    $view: $model.ui.$view,
    $calendar: $model.ui.$calendar,
    $workout_plan_select: $model.ui.$workout_plan_select,
    $values: $model.ui.$values,
  };

  let _state = {
    get weekdays() {
      return ui.$calendar.state.weekdays.map((weekday) => {
        return {
          ...weekday,
          weekday_text: map_weekday_text(dayjs(weekday.value).day()),
          plan_id: $model.state.selected_plan_map[weekday.id] ?? null,
        };
      });
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
  $model.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      $model.ready();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanCollectionCreateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanCollectionCreateViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view}>
        <div class="p-4">
          <div class="space-y-4">
            <div class="flied">
              <div class="label">标题</div>
              <Input store={vm.ui.$values.fields.title.input} />
            </div>
            <div class="flied">
              <div class="label">概要</div>
              <Textarea store={vm.ui.$values.fields.overview.input} />
            </div>
            <div class="flied">
              <div class="label">建议等级</div>
              <Select store={vm.ui.$values.fields.level.input}></Select>
            </div>
            <div class="flied">
              <div class="label">循环周期</div>
              <Select store={vm.ui.$values.fields.type.input}></Select>
            </div>
            <div>
              <div class="label">计划安排</div>
              <div class="flex items-center gap-2">
                <For each={state().weekdays}>
                  {(day) => {
                    return (
                      <div class="basis-1/3 relative">
                        <div
                          classList={{
                            "flex items-center justify-center py-2 border rounded-full": true,
                            "border-green-500": day.is_today,
                          }}
                          onClick={() => {
                            vm.methods.handleClickWeekday(day);
                          }}
                        >
                          <div>{day.weekday_text}</div>
                        </div>
                        <Show when={day.plan_id}>
                          <div class="absolute left-1/2 -bottom-2 flex justify-center w-full -translate-x-1/2">
                            <div class="w-[6px] h-[6px] rounded-full bg-red-300"></div>
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
          <div></div>
          <div class="fixed bottom-0 left-0 w-full p-4">
            <div
              class="flex items-center justify-center w-full py-3 rounded-md bg-green-500"
              onClick={() => {
                vm.methods.submit();
              }}
            >
              <div class="text-white">提交</div>
            </div>
          </div>
        </div>
      </ScrollView>
      <Sheet store={vm.ui.$workout_plan_select.ui.$dialog} position="bottom" size="lg">
        <div class="w-screen bg-white">
          <WorkoutPlanSelectView store={vm.ui.$workout_plan_select} />
          <div class="flex">
            <div
              class="flex-1 flex justify-center py-2 "
              onClick={() => {
                vm.methods.hideWorkoutPlanSelectDialog();
              }}
            >
              <div>取消</div>
            </div>
            <div
              class="flex-1  flex justify-center py-2"
              onClick={() => {
                vm.methods.ensureSelectedWorkoutPlan();
              }}
            >
              <div>确认</div>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
