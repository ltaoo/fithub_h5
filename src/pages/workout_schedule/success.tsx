import { For, Show } from "solid-js";
import { CheckCircle, Coffee, Divide } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { WorkoutScheduleViewModel } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleDayType } from "@/biz/workout_plan/constants";
import { toNumber } from "@/utils/primitive";

function WorkoutScheduleCreateSuccessViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickWorkoutPlan(plan: { id: number }) {
      props.history.push("root.workout_plan_profile", {
        id: String(plan.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $history: props.history,
    $profile: WorkoutScheduleViewModel({ client: props.client }),
  };

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
    ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        props.app.tip({
          text: ["参数异常"],
        });
        return;
      }
      ui.$profile.methods.fetch({ id });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutScheduleCreateSuccessView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleCreateSuccessViewModel, [props]);

  return (
    <PageView store={vm}>
      <div class="space-y-2">
        <div class="flex flex-col items-center py-4">
          <CheckCircle class="w-12 h-12 text-green-500" />
          <div class="mt-2 text-w-fg-0 text-center">创建成功</div>
        </div>
        <Divider />
        <div>
          <Show when={state().profile}>
            <div class="mt-4 text-w-fg-0">
              <div class="text-xl text-center">{state().profile?.title}</div>
              <div>
                <div class="mt-2 text-w-fg-1 text-sm text-center">{state().profile?.overview}</div>
              </div>
            </div>
            {/* <div class="text-w-fg-0">周期安排</div> */}
            <div class="mt-4 space-y-2">
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
        </div>
      </div>
    </PageView>
  );
}
