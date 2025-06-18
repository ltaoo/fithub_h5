import { For, Show } from "solid-js";
import { ChevronDown } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Calendar } from "@/components/ui/calendar";
import { Button, Input, ScrollView, Textarea } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutPlanSelectView } from "@/components/workout-plan-select";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { map_weekday_text } from "@/biz/workout_plan/workout_schedule";

import { WorkoutScheduleValuesModel } from "./model";

function WorkoutScheduleUpdateViewModel(props: ViewComponentProps) {
  const $model = WorkoutScheduleValuesModel(props);

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickWeekday: $model.methods.handleClickWeekday,
    ensureSelectedWorkoutPlan: $model.methods.ensureSelectedWorkoutPlan,
    hideWorkoutPlanSelectDialog: $model.methods.hideWorkoutPlanSelectDialog,
    toBody: $model.methods.toBody,
    submit: $model.methods.createWorkoutSchedule,
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $calendar: CalendarCore({
      today: new Date(),
    }),
    $workout_plan_select: $model.ui.$workout_plan_select,
    $values: $model.ui.$form,
    $btn_submit: new ButtonCore({
      onClick() {
        methods.submit();
      },
    }),
    $btn_workout_plan_cancel: new ButtonCore({
      onClick() {
        methods.hideWorkoutPlanSelectDialog();
      },
    }),
    $btn_workout_plan_confirm: new ButtonCore({
      onClick() {
        methods.ensureSelectedWorkoutPlan();
      },
    }),
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

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutScheduleUpdateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleUpdateViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div>
            <Button class="w-full" store={vm.ui.$btn_submit}>
              更新
            </Button>
          </div>
        }
      >
        <div class="space-y-4">
          <div class="flied">
            <div class="label text-w-fg-0">标题</div>
            <Input store={vm.ui.$values.fields.title.input} />
          </div>
          <div class="flied">
            <div class="label text-w-fg-0">概要</div>
            <Textarea store={vm.ui.$values.fields.overview.input} />
          </div>
          <div class="flied">
            <div class="label text-w-fg-0">建议等级</div>
            <Select store={vm.ui.$values.fields.level.input}></Select>
          </div>
          <div class="flied">
            <div class="label text-w-fg-0">循环周期</div>
            <Select store={vm.ui.$values.fields.type.input}></Select>
          </div>
          <div>
            <div class="label text-w-fg-0">计划安排</div>
            <div class="grid grid-cols-7 gap-2 mt-2">
              <For each={state().weekdays}>
                {(day) => {
                  return (
                    <div class="relative">
                      <div
                        classList={{
                          "flex items-center justify-center py-4 border-2 border-w-fg-3 rounded-full": true,
                        }}
                        onClick={() => {
                          vm.methods.handleClickWeekday(day);
                        }}
                      >
                        <div class="text-w-fg-0 text-sm">{day.weekday_text}</div>
                      </div>
                      <Show when={day.plan_id}>
                        <div class="absolute left-1/2 -bottom-2 flex justify-center w-full -translate-x-1/2">
                          <div class="w-[6px] h-[6px] rounded-full bg-green-300"></div>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </PageView>
      <Sheet store={vm.ui.$workout_plan_select.ui.$dialog} app={props.app}>
        <div class="">
          <WorkoutPlanSelectView store={vm.ui.$workout_plan_select} />
          <div class="flex items-center gap-2 p-2">
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.hideWorkoutPlanSelectDialog();
              }}
            >
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </div>
            <Button class="w-full" store={vm.ui.$btn_workout_plan_confirm}>
              选择
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
