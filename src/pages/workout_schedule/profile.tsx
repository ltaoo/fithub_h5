/**
 * @file 周期安排 详情
 */
import { For, sharedConfig, Show } from "solid-js";
import { CheckCircle2, ChevronDown, ChevronLeft, Coffee, Divide, Loader2 } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { WorkoutScheduleViewModel } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleDayType, WorkoutScheduleType } from "@/biz/workout_plan/constants";
import { CalendarCore } from "@/domains/ui/calendar";
import { toNumber } from "@/utils/primitive";

function WorkoutScheduleProfileViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async applyWorkoutSchedule() {
      const profile = ui.$profile.state.profile;
      if (!profile) {
        return;
      }
      ui.$btn_apply.setLoading(true);
      ui.$btn_apply_confirm.setLoading(true);
      const r = await ui.$profile.request.workout_schedule.apply.run({
        id: profile.id,
        start_date: profile.type === WorkoutScheduleType.Days ? dayjs(_selected_date).toDate() : undefined,
      });
      ui.$btn_apply.setLoading(false);
      ui.$btn_apply_confirm.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["应用成功"],
      });
      _applied = true;
      ui.$dialog_start_day.hide();
      methods.refresh();
    },
    async cancelWorkoutSchedule() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        return;
      }
      ui.$btn_apply.setLoading(true);
      const r = await ui.$profile.request.workout_schedule.cancel.run({ id });
      ui.$btn_apply.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["取消成功"],
      });
      _applied = false;
      methods.refresh();
    },
    handleClickWorkoutPlan(plan: { id: number }) {
      props.history.push("root.workout_plan_profile", {
        id: String(plan.id),
      });
    },
    handleClickDate(date: { yyyy: string }) {
      _selected_date = date.yyyy;
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $profile: WorkoutScheduleViewModel({ client: props.client }),
    $btn_apply: new ButtonCore({
      onClick() {
        if (_applied) {
          methods.cancelWorkoutSchedule();
          return;
        }
        if (ui.$profile.state.profile?.type === WorkoutScheduleType.Days) {
          ui.$dialog_start_day.show();
          return;
        }
        methods.applyWorkoutSchedule();
      },
    }),
    $dialog_start_day: new DialogCore({}),
    $btn_apply_confirm: new ButtonCore({
      onClick() {
        methods.applyWorkoutSchedule();
      },
    }),
    $calendar: CalendarCore({
      today: new Date(),
    }),
  };

  let _applied = false;
  let _selected_date = dayjs().format("YYYY-MM-DD");
  let _state = {
    get loading() {
      return ui.$profile.state.loading;
    },
    get profile() {
      return ui.$profile.state.profile;
    },
    get schedules() {
      return ui.$profile.state.schedules;
    },
    get error() {
      return ui.$profile.state.error;
    },
    get applied() {
      return _applied;
    },
    get calendar() {
      return {
        weeks: ui.$calendar.state.weeks.map((v) => {
          return {
            ...v,
            dates: v.dates.map((vv) => {
              return {
                ...vv,
                selected: _selected_date === vv.yyyy,
              };
            }),
          };
        }),
      };
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

  ui.$profile.onStateChange(() => methods.refresh());

  return {
    ui,
    methods,
    state: _state,
    async ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        props.app.tip({
          text: ["参数异常"],
        });
        return;
      }
      const r = await ui.$profile.methods.fetch({ id });
      if (r.error) {
        return;
      }
      _applied = r.data.applied;
      methods.refresh();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutScheduleProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleProfileViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Button class="w-full" store={vm.ui.$btn_apply}>
            {state().applied ? "取消应用" : "应用"}
          </Button>
        }
      >
        <Show when={state().loading}>
          <div class="flex justify-center p-4">
            <Loader2 class="w-8 h-8 text-w-fg-0 animate-spin" />
          </div>
        </Show>
        <Show when={state().profile}>
          <div class="p-4 text-w-fg-0">
            <div class="text-2xl font-bold text-w-fg-0">{state().profile!.title}</div>
            <div class="text-w-fg-0">{state().profile!.overview}</div>
            <div class="flex items-center justify-between mt-2">
              <div class="text-w-fg-1 text-[12px]">{state().profile!.created_at}创建</div>
            </div>
            <div class="flex items-center gap-2 mt-4">
              <Show
                when={state().profile!.creator.avatar_url}
                fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
              >
                <div
                  class="w-[24px] h-[24px] rounded-full"
                  style={{
                    "background-image": `url('${state().profile!.creator.avatar_url}')`,
                    "background-size": "cover",
                    "background-position": "center",
                  }}
                ></div>
              </Show>
              <div class="text-sm text-w-fg-0">{state().profile!.creator.nickname}</div>
            </div>
          </div>
          <div class="mt-2 space-y-2">
            <For each={state().schedules}>
              {(schedule) => {
                return (
                  <div class="relative p-4 border-2 border-w-fg-3 rounded-lg">
                    <Show
                      when={schedule.type === WorkoutScheduleDayType.Workout}
                      fallback={
                        <div class="flex flex-col items-center gap-2">
                          <Coffee class="w-6 h-6 text-w-fg-1" />
                          <div class="text-w-fg-1 text-sm">{schedule.day_text}休息</div>
                        </div>
                      }
                    >
                      <div class="flex items-center gap-2">
                        <div class="rounded-full px-2 bg-blue-500 text-sm text-white">{schedule.day_text}</div>
                        <div class="space-y-2">
                          <For each={schedule.workout_plans}>
                            {(plan) => {
                              return (
                                <div
                                  onClick={() => {
                                    if (schedule.type === WorkoutScheduleDayType.Workout) {
                                      vm.methods.handleClickWorkoutPlan(plan);
                                    }
                                  }}
                                >
                                  <div class="text-w-fg-0">{plan.title}</div>
                                  <div class="text-w-fg-1 text-sm">预计{plan.estimated_duration_text}</div>
                                </div>
                              );
                            }}
                          </For>
                        </div>
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </PageView>
      <Sheet store={vm.ui.$dialog_start_day} app={props.app}>
        <div class="p-4">
          <div class="text-w-fg-1 text-center">请选择计划开始的日期</div>
          <div class="grid grid-cols-7 gap-2 mt-4">
            <For each={["周一", "周二", "周三", "周四", "周五", "周六", "周日"]}>
              {(t) => {
                return <div class="text-center text-sm text-w-fg-1">{t}</div>;
              }}
            </For>
          </div>
          <For each={state().calendar.weeks}>
            {(week) => {
              return (
                <div class="grid grid-cols-7 gap-2">
                  <For each={week.dates}>
                    {(date) => {
                      return (
                        <div
                          classList={{
                            "relative p-2 rounded-md": true,
                            "opacity-40": date.is_next_month || date.is_prev_month,
                            "bg-w-bg-5": date.selected,
                          }}
                          onClick={() => {
                            vm.methods.handleClickDate(date);
                          }}
                        >
                          <div class="text-center text-sm text-w-fg-0">{date.text}</div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              );
            }}
          </For>
        </div>
        <div class="relative p-2">
          <div class="flex items-center justify-between gap-2">
            <IconButton>
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </IconButton>
            <Button class="w-full" store={vm.ui.$btn_apply_confirm}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
