/**
 * @file 训练周期计划
 */
import { For, Show } from "solid-js";
import dayjs from "dayjs";
import { ChevronDown, Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Calendar } from "@/components/ui/calendar";
import { Button, Dialog, Input, ScrollView, Textarea } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/select";
import { WorkoutPlanSelectView } from "@/components/workout-plan-select";
import { PageView } from "@/components/page-view";
import { Switcher } from "@/components/ui/switch";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { map_weekday_text } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleType } from "@/biz/workout_plan/constants";

import { WorkoutScheduleValuesModel } from "./model";

function WorkoutScheduleCreateViewModel(props: ViewComponentProps) {
  const $model = WorkoutScheduleValuesModel(props);

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickWeekday: $model.methods.handleClickWeekday,
    handleClickDay: $model.methods.handleClickDay,
    addDay: $model.methods.addDay,
    ensureSelectedWorkoutPlan: $model.methods.ensureSelectedWorkoutPlan,
    hideWorkoutPlanSelectDialog: $model.methods.hideWorkoutPlanSelectDialog,
    toBody: $model.methods.toBody,
    createWorkoutSchedule: $model.methods.createWorkoutSchedule,
  };
  const ui = {
    $view: $model.ui.$view,
    $history: props.history,
    $calendar: $model.ui.$calendar,
    $workout_plan_select: $model.ui.$workout_plan_select,
    $form: $model.ui.$form,
    $btn_submit: new ButtonCore({
      async onClick() {
        ui.$btn_submit.setLoading(true);
        await methods.createWorkoutSchedule();
        ui.$btn_submit.setLoading(false);
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
      return $model.state.weekdays;
    },
    get days() {
      return $model.state.days;
    },
    get schedule_type() {
      return $model.state.schedule_type;
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
    destroy() {
      $model.destroy();
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutScheduleCreateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleCreateViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div>
            <Button class="w-full" store={vm.ui.$btn_submit}>
              创建
            </Button>
          </div>
        }
      >
        <div class="space-y-4">
          <div class="flied">
            <div class="flex">
              <div class="label text-sm text-w-fg-0">标题</div>
              <div class="text-red-500">*</div>
            </div>
            <Input store={vm.ui.$form.fields.title.input} />
          </div>
          <div class="flied">
            <div class="label text-sm text-w-fg-0">概要</div>
            <Textarea store={vm.ui.$form.fields.overview.input} />
          </div>
          <div class="flied">
            <div class="label text-sm text-w-fg-0">建议等级</div>
            <Select store={vm.ui.$form.fields.level.input}></Select>
          </div>
          <div class="flied">
            <div class="label text-sm text-w-fg-0">循环类型</div>
            <Select store={vm.ui.$form.fields.type.input}></Select>
          </div>
          <div class="field">
            <div class="label text-sm text-w-fg-0">计划安排</div>
            <div
              class="grid grid-cols-7 gap-2 mt-2"
              classList={{
                hidden: state().schedule_type !== WorkoutScheduleType.Weekly,
              }}
            >
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
                        <div class="absolute left-1/2 bottom-2 flex justify-center w-full -translate-x-1/2">
                          <div class="w-[6px] h-[6px] rounded-full bg-green-500"></div>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
            <div
              class="grid grid-cols-7 gap-2 mt-2"
              classList={{
                hidden: state().schedule_type !== WorkoutScheduleType.Days,
              }}
            >
              <For each={state().days}>
                {(day) => {
                  return (
                    <div class="relative">
                      <div
                        classList={{
                          "flex items-center justify-center py-4 border-2 border-w-fg-3 rounded-full": true,
                        }}
                        onClick={() => {
                          vm.methods.handleClickDay(day);
                        }}
                      >
                        <div class="text-w-fg-0 text-sm">{day.text}</div>
                      </div>
                      <Show when={day.plan_id}>
                        <div class="absolute left-1/2 bottom-2 flex justify-center w-full -translate-x-1/2">
                          <div class="w-[6px] h-[6px] rounded-full bg-green-500"></div>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
              <div
                classList={{
                  "flex items-center justify-center py-4 border-2 border-w-fg-3 rounded-full": true,
                }}
                onClick={() => {
                  vm.methods.addDay();
                }}
              >
                <div class="text-w-fg-0 text-sm">
                  <Plus class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm text-w-fg-0">外部是否可见</div>
            </div>
            <div class="mt-2">
              <Switcher store={vm.ui.$form.fields.status.input} texts={["公开", "仅自己可见"]} />
              {/* <div class="text-sm text-w-fg-1">公开后无法删除，无法再次修改为仅自己可见</div> */}
            </div>
          </div>
        </div>
      </PageView>
      <Sheet ignore_safe_height store={vm.ui.$workout_plan_select.ui.$dialog} app={props.app}>
        <WorkoutPlanSelectView store={vm.ui.$workout_plan_select} />
      </Sheet>
    </>
  );
}
