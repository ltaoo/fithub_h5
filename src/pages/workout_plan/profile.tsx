/**
 * @file 训练计划详情
 */
import { Show, For, Switch, Match } from "solid-js";
import { BicepsFlexed, ChevronLeft, CircleX, Hourglass, Loader, Loader2, MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ScrollView } from "@/components/ui";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import { WorkoutPlanSetType, WorkoutPlanStepTypeTextMap, WorkoutSetTypeTextMap } from "@/biz/workout_plan/constants";
import { createWorkoutDay } from "@/biz/workout_day/services";
import { fetchMuscleList, fetchMuscleListProcess } from "@/biz/muscle/services";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { WorkoutPlanViewModel } from "@/biz/workout_plan/workout_plan";
import { PageView } from "@/components/page-view";

function HomeWorkoutPlanProfilePageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        loading: true,
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_day: {
      create: new RequestCore(createWorkoutDay, { client: props.client }),
    },
    muscle: {
      list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
    },
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async startWorkoutDay() {
      const id = props.view.query.id;
      if (!id) {
        props.app.tip({
          text: ["数据异常"],
        });
        return;
      }
      ui.$btn_start_workout.setLoading(true);
      const r = await request.workout_day.create.run({
        workout_plan_id: Number(id),
        start_when_create: true,
      });
      ui.$btn_start_workout.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.history.push("root.workout_day", {
        id: String(r.data.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $profile: WorkoutPlanViewModel({ client: props.client }),
    $btn_start_plan: new ButtonCore({
      async onClick() {
        methods.startWorkoutDay();
      },
    }),
    $btn_start_workout: new ButtonCore({
      onClick() {
        methods.startWorkoutDay();
      },
    }),
  };
  let _state = {
    get loading() {
      return ui.$profile.state.loading;
    },
    get error() {
      return ui.$profile.state.error;
    },
    get profile() {
      return ui.$profile.state.profile;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$profile.onStateChange(() => methods.refresh());
  ui.$profile.onError(() => methods.refresh());

  return {
    state: _state,
    request,
    methods,
    ui,
    async ready() {
      const id = Number(props.view.query.id);
      ui.$profile.methods.fetch({ id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export function HomeWorkoutPlanProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanProfilePageViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center gap-2 w-full">
            <Button class="w-full" store={vm.ui.$btn_start_workout}>
              开始训练
            </Button>
            {/* <div class="p-2 rounded-full bg-w-bg-5">
              <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
            </div> */}
          </div>
        }
      >
        <Show when={state().error}>
          <div class="error max-w-[screen] p-4">
            <div class="flex flex-col items-center text-red-500">
              <div>
                <CircleX class="w-12 h-12" />
              </div>
              <div class="mt-2 text-w-fg-0 text-center break-all">{state().error?.message}</div>
            </div>
          </div>
        </Show>
        <Show when={state().loading}>
          <div class="loading flex justify-center items-center p-4">
            <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
          </div>
        </Show>
        <Show when={state().profile}>
          <div class="relative content space-y-4">
            <div class="header p-4 border-2 border-w-bg-5 rounded-lg">
              <div class="text-2xl font-bold text-w-fg-0">{state().profile!.title}</div>
              {/* <div>作者</div> */}
              <div>
                <div class="">{state().profile!.overview}</div>
              </div>
              <div class="tags">
                <For each={state().profile!.tags}>{(tag) => <div class="text-sm text-gray-400">{tag}</div>}</For>
              </div>
              <div class="flex mt-2">
                <div class="duration flex items-center gap-2 px-2 border-2 border-w-bg-5 rounded-full">
                  <div class="text-w-fg-1">
                    <Hourglass class="w-3 h-3 text-w-fg-1" />
                  </div>
                  <div class="text-sm text-w-fg-1">{state().profile!.estimated_duration_text}</div>
                </div>
              </div>
              <div>
                <For each={state().profile!.tags}>
                  {(text) => {
                    return <div>{text}</div>;
                  }}
                </For>
              </div>
            </div>
            <div class="steps border-2 border-w-bg-5 rounded-lg">
              <div class="p-4 border-b-2 border-w-bg-5">
                <div class="text-w-fg-0">内容明细</div>
              </div>
              <div class="p-4 space-y-2">
                <For each={state().profile!.steps}>
                  {(step, index) => (
                    <div class="rounded-xl">
                      <div class="relative">
                        {/* <div class="absolute left-1 -top-2 text-sm">{WorkoutSetTypeTextMap[step.set_type] || ""}</div> */}
                        <Switch>
                          <Match when={[WorkoutPlanSetType.Normal].includes(step.set_type)}>
                            <div class="flex items-center gap-3 p-2 border border-w-bg-5 rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                {index() + 1}
                              </div>
                              <div class="flex-1">
                                <For each={step.actions}>
                                  {(action) => (
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-w-fg-0">{action.action.zh_name}</span>
                                      <span class="flex items-center text-blue-400 font-medium">
                                        <div>{action.reps}</div>
                                        <div class="text-sm">{action.reps_unit}</div>
                                      </span>
                                    </div>
                                  )}
                                </For>
                              </div>
                              <div class="flex items-center text-sm text-w-fg-1">
                                <div>x{step.set_count}</div>
                                <div class="text-sm">组</div>
                              </div>
                            </div>
                          </Match>
                          <Match when={[WorkoutPlanSetType.Super].includes(step.set_type)}>
                            <div class="flex items-center gap-3 p-2 border border-w-bg-5 rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                {index() + 1}
                              </div>
                              <div class="flex-1">
                                <For each={step.actions}>
                                  {(action) => (
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-gray-200">{action.action.zh_name}</span>
                                      <span class="text-blue-400 font-medium">
                                        {action.reps}
                                        {action.reps_unit}
                                      </span>
                                    </div>
                                  )}
                                </For>
                              </div>
                              <div class="flex items-center text-sm text-w-fg-1">
                                <div>x{step.set_count}</div>
                                <div class="text-sm">组</div>
                              </div>
                            </div>
                          </Match>
                          <Match when={[WorkoutPlanSetType.HIIT].includes(step.set_type)}>
                            <div class="flex items-center gap-3 p-2 border border-w-bg-5 rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                {index() + 1}
                              </div>
                              <div class="flex-1">
                                <For each={step.actions}>
                                  {(action) => (
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-w-fg-0">{action.action.zh_name}</span>
                                      <span class="flex items-center text-blue-400 font-medium">
                                        <div>{action.reps}</div>
                                        <div class="text-sm">{action.reps_unit}</div>
                                      </span>
                                    </div>
                                  )}
                                </For>
                              </div>
                              <div class="flex items-center text-sm text-w-fg-1">
                                <div>x{step.set_count}</div>
                                <div class="text-sm">组</div>
                              </div>
                            </div>
                          </Match>
                          <Match
                            when={[WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(
                              step.set_type
                            )}
                          >
                            <div class="flex items-center gap-3 p-2 border border-w-bg-5 rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                {index() + 1}
                              </div>
                              <div class="flex-1">
                                <div class="text-sm">
                                  <span class="text-w-fg-0">{step.actions[0].action.zh_name}</span>
                                </div>
                                <div class="flex gap-2">
                                  <For each={step.actions}>
                                    {(action) => (
                                      <div class="flex items-center gap-2 text-sm">
                                        <span class="flex items-center text-blue-400 font-medium">
                                          <div>{action.reps}</div>
                                          <div class="text-sm">{action.reps_unit}</div>
                                        </span>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </div>
                              <div class="flex items-center text-sm text-w-fg-1">
                                <div>x{step.set_count}</div>
                                <div class="text-sm">组</div>
                              </div>
                            </div>
                          </Match>
                        </Switch>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
            <div class="muscle rounded-lg border-2 border-w-bg-5">
              <div class="p-4 border-b border-w-bg-5">
                <div class="text-w-fg-0">锻炼肌肉</div>
              </div>
              <div class="p-4">
                <BodyMusclePreview highlighted={["gluteus_minimus"]} />
                <div class="">
                  <For each={state().profile!.muscles}>
                    {(muscle) => <div class="text-sm text-w-fg-1">{muscle.zh_name}</div>}
                  </For>
                </div>
              </div>
            </div>
            <div class="equipment rounded-lg border-2 border-w-bg-5">
              <div class="p-4 border-b-2 border-w-bg-5">
                <div class="text-w-fg-0">所需器械</div>
              </div>
              <div class="p-4">
                <For each={state().profile!.equipments}>
                  {(equipment) => <div class="text-sm text-w-fg-1">{equipment.zh_name}</div>}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </PageView>
      {/* <div class="fixed bottom-0 left-0 w-full bg-w-bg-1">
        <div>
          <div class="flex justify-center gap-2 p-2">
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.back();
              }}
            >
              <ChevronLeft class="w-6 h-6 text-w-fg-1" />
            </div>
            <Button class="w-full py-2.5 rounded-md bg-w-bg-5 text-w-fg-1 text-center" store={vm.ui.$btn_start_workout}>
              开始训练
            </Button>
            <div class="p-2 rounded-full bg-w-bg-5">
              <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
            </div>
          </div>
          <div class="safe-height"></div>
        </div>
      </div> */}
    </>
  );
}
