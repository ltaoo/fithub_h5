/**
 * @file 学员某次训练的详情
 */
import { For, Show } from "solid-js";
import { ChevronLeft, LoaderCircle, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";
import { SetValueView } from "@/components/set-value-view";
import { Flex } from "@/components/flex/flex";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import {
  fetchWorkoutDayProfile,
  fetchWorkoutDayProfileProcess,
  fetchWorkoutDayResult,
  fetchWorkoutDayResultProcess,
} from "@/biz/workout_day/services";
import {
  fetchStudentWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDayProcess,
} from "@/biz/workout_action/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { toNumber } from "@/utils/primitive";
import {
  fetchStudentWorkoutDayProfile,
  fetchStudentWorkoutDayResult,
  fetchStudentWorkoutDayResultProcess,
} from "@/biz/student/services";

function StudentWorkoutDayResultViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      profile: new RequestCore(fetchStudentWorkoutDayResult, {
        process: fetchStudentWorkoutDayResultProcess,
        client: props.client,
      }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchStudentWorkoutActionHistoryListOfWorkoutDay, {
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
    $history: props.history,
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
      const student_id = toNumber(props.view.query.student_id, 0);
      // if (student_id === null) {
      //   props.app.tip({
      //     text: ["参数错误"],
      //   });
      //   return;
      // }
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
      request.workout_action_history.list.init({ workout_day_id: id, student_id });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function StudentWorkoutDayResultView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(StudentWorkoutDayResultViewModel, [props]);

  return (
    <>
      <PageView store={vm} hide_bottom_bar={props.view.query.hide_bottom_bar === "1"}>
        <Show when={state().loading}>
          <div class="p-4 flex items-center justify-center">
            <LoaderCircle class="w-8 h-8 text-w-fg-0 animate-spin" />
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
                      <div class="text-3xl">{state().profile!.duration}</div>
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
                      <div class="text-3xl">{state().profile!.set_count}</div>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </div>
          <Divider />
          <div class="py-2 space-y-2">
            <For each={state().profile?.steps}>
              {(step, idx) => {
                if (step.type === "cardio") {
                  return (
                    <div>
                      <Flex class="">
                        <div class="w-[18px] text-w-fg-0">{idx() + 1}.</div>
                        <Flex class="flex-1">
                          <div class="text-w-fg-0 font-bold">{step.title}</div>
                          <div class="mx-1 text-gray-400">&nbsp;</div>
                          <div class=" text-w-fg-1">{step.duration}分钟</div>
                        </Flex>
                      </Flex>
                    </div>
                  );
                }
                if (step.type === "normal") {
                  return (
                    <div>
                      <Flex class="">
                        <div class="w-[18px] text-w-fg-0">{idx() + 1}.</div>
                        <Flex class="flex-1">
                          <div class="text-w-fg-0 font-bold">{step.title}</div>
                          <div class="mx-1 text-gray-400">x</div>
                          <div class=" text-w-fg-1">{step.sets.length}组</div>
                        </Flex>
                      </Flex>
                      <Flex class="flex-wrap pl-4 text-[12px]">
                        <For each={step.sets}>
                          {(set, set_idx) => {
                            return (
                              <Flex>
                                <div class="flex-1">
                                  <For each={set.texts}>
                                    {(text) => {
                                      return <div>{text}</div>;
                                    }}
                                  </For>
                                </div>
                                <Show when={set_idx() < step.sets.length - 1}>
                                  <div class="">、</div>
                                </Show>
                              </Flex>
                            );
                          }}
                        </For>
                      </Flex>
                      <Show when={idx() < state().profile!.steps.length - 1}>
                        <Divider />
                      </Show>
                    </div>
                  );
                }
                return (
                  <div>
                    <Flex class="">
                      <div class="w-[18px] text-w-fg-0">{idx() + 1}.</div>
                      <Flex class="flex-1 whitespace-nowrap">
                        <div class="text-w-fg-0 font-bold">{step.title}</div>
                        <div class="mx-1 text-gray-400">x</div>
                        <div class=" text-w-fg-1">{step.sets.length}组</div>
                      </Flex>
                    </Flex>
                    <div class="pl-4">
                      <For each={step.sets}>
                        {(set, set_idx) => {
                          return (
                            <Flex class="text-[12px]">
                              <Flex class="flex-1 flex-wrap">
                                <For each={set.texts}>
                                  {(text, text_idx) => {
                                    return (
                                      <Flex class="whitespace-nowrap">
                                        <div>{text}</div>
                                        <Show when={text_idx() < set.texts.length - 1}>
                                          <div class="mx-1">+</div>
                                        </Show>
                                      </Flex>
                                    );
                                  }}
                                </For>
                              </Flex>
                            </Flex>
                          );
                        }}
                      </For>
                    </div>
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
