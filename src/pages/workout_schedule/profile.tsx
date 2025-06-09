/**
 * @file 周期安排 详情
 */
import { For, Show } from "solid-js";
import { CheckCircle2, Coffee, Divide, Loader2 } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { WorkoutScheduleViewModel } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleDayType } from "@/biz/workout_plan/constants";

function WorkoutScheduleProfileViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async applyWorkoutSchedule() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        return;
      }
      ui.$btn_apply.setLoading(true);
      const r = await ui.$profile.request.workout_schedule.apply.run({ id });
      ui.$btn_apply.setLoading(false);
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
      methods.refresh();
    },
    async cancelWorkoutSchedule() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
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
        methods.applyWorkoutSchedule();
      },
    }),
  };

  let _applied = false;
  let _state = {
    get loading() {
      return ui.$profile.state.loading;
    },
    get profile() {
      return ui.$profile.state.profile;
    },
    get error() {
      return ui.$profile.state.error;
    },
    get applied() {
      return _applied;
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
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutScheduleProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleProfileViewModel, [props]);

  return (
    <PageView
      store={vm}
      operations={
        <div>
          <Button class="w-full" store={vm.ui.$btn_apply}>
            {state().applied ? "取消应用" : "应用"}
          </Button>
        </div>
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
          <For each={state().profile?.schedules}>
            {(schedule) => {
              return (
                <div
                  class="relative p-4 border-2 border-w-fg-3 rounded-lg"
                  onClick={() => {
                    if (schedule.type === WorkoutScheduleDayType.Workout) {
                      vm.methods.handleClickWorkoutPlan(schedule.workout_plan);
                    }
                  }}
                >
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
                      <div class="text-w-fg-0">{schedule.title}</div>
                    </div>
                    <div class="mt-2 text-w-fg-1 text-sm">预计{schedule.estimated_duration_text}</div>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </PageView>
  );
}
