/**
 * @file 训练计划详情
 */
import { Show, For, Switch, Match } from "solid-js";
import { Loader } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { createWorkoutDay } from "@/biz/workout_day/services";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { Button, ScrollView } from "@/components/ui";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";

function HomeWorkoutPlanProfilePageViewModel(props: ViewComponentProps) {
  const methods = {};
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
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $btn_start_plan: new ButtonCore({
      async onClick() {
        const id = props.view.query.id;
        if (!id) {
          props.app.tip({
            text: ["数据异常"],
          });
          return;
        }
        const r = await request.workout_day.create.run({
          workout_plan_id: Number(id),
          start_when_create: true,
        });
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
    }),
  };
  let _state = {
    get loading() {
      return request.workout_plan.profile.loading;
    },
    get profile() {
      return request.workout_plan.profile.response;
    },
    get preview() {
      return this.profile?.details;
    },
    get error() {
      return request.workout_plan.profile.error;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.workout_plan.profile.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    state: _state,
    request,
    methods,
    ui,
    ready() {
      const id = Number(props.view.query.id);
      request.workout_plan.profile.run({ id });
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
      <ScrollView store={vm.ui.$view} class="w-full h-full p-4">
        <Show when={state().error}>
          <div class="error">
            <div>加载失败</div>
          </div>
        </Show>
        <Show when={state().loading}>
          <div class="loading flex justify-center items-center h-full">
            <Loader class="animate-spin" />
          </div>
        </Show>
        <Show when={state().profile}>
          <div class="content">
            <div class="header">
              <div class="text-2xl font-bold">{state().profile!.title}</div>
              <div>作者</div>
              <div>
                <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                  {state().profile!.overview}
                </div>
              </div>
              <div class="tags">
                <For each={state().profile!.tags}>{(tag) => <div class="text-sm text-gray-400">{tag}</div>}</For>
              </div>
              <div class="duration">
                <div>预计耗时</div>
                <div>{state().profile!.estimated_duration}</div>
              </div>
            </div>
            <Show when={state().preview}>
              <div class="steps py-4 space-y-2.5">
                <For each={state().preview?.timeline}>
                  {(line) => (
                    <div class="space-y-2.5">
                      <Show when={state().preview!.timeline.length > 1}>
                        <div class="text-sm font-medium text-gray-300 pl-2">{line.text}</div>
                      </Show>
                      <For each={line.steps}>
                        {(step, index) => (
                          <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                            <div class="p-3">
                              <Switch>
                                <Match when={[WorkoutPlanSetType.Normal].includes(step.set_type)}>
                                  <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0 w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-medium text-sm">
                                      {index() + 1}
                                    </div>
                                    <div class="flex-1">
                                      <For each={step.actions}>
                                        {(action) => (
                                          <div class="flex items-center gap-2 text-sm">
                                            <span class="text-gray-200">{action.action_name}</span>
                                            <span class="text-blue-400 font-medium">{action.reps}</span>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                    <div class="flex-shrink-0 text-sm text-gray-400">x{step.sets_count}</div>
                                  </div>
                                </Match>
                                <Match when={[WorkoutPlanSetType.Combo].includes(step.set_type)}>
                                  <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0 w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-medium text-sm">
                                      {index() + 1}
                                    </div>
                                    <div class="flex-1">
                                      <For each={step.actions}>
                                        {(action) => (
                                          <div class="flex items-center gap-2 text-sm">
                                            <span class="text-gray-200">{action.action_name}</span>
                                            <span class="text-blue-400 font-medium">{action.reps}</span>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                    <div class="flex-shrink-0 text-sm text-gray-400">x{step.sets_count}</div>
                                  </div>
                                </Match>
                                <Match when={[WorkoutPlanSetType.Free].includes(step.set_type)}>
                                  <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0 w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-medium text-sm">
                                      {index() + 1}
                                    </div>
                                    <div class="flex-1">
                                      <div class="flex items-center gap-2">
                                        <span class="text-gray-200">{step.title}</span>
                                      </div>
                                      <For each={step.sets}>
                                        {(set, idx) => (
                                          <div class="flex items-center gap-2 text-sm">
                                            <span class="text-gray-200">{idx() + 1}组</span>
                                            <For each={set.actions}>
                                              {(action) => (
                                                <div class="flex items-center gap-2">
                                                  <span class="text-gray-200">{action.action_name}</span>
                                                  <span class="text-blue-400 font-medium">{action.reps}</span>
                                                </div>
                                              )}
                                            </For>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  </div>
                                </Match>
                              </Switch>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </Show>
            <div class="muscle">
              <div class="">锻炼肌肉</div>
              <div class="">
                <For each={state().profile!.muscles}>
                  {(muscle) => <div class="text-sm text-gray-400">{muscle.id}</div>}
                </For>
              </div>
            </div>
            <div class="equipment">
              <div class="">所需器械</div>
              <div class="">
                <For each={state().profile!.equipments}>
                  {(equipment) => <div class="text-sm text-gray-400">{equipment.id}</div>}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </ScrollView>
      <div class="fixed bottom-0 left-0 right-0 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
        <div class="p-3">
          <Button store={vm.ui.$btn_start_plan}>开始</Button>
        </div>
      </div>
    </>
  );
}
