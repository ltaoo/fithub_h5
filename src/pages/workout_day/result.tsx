/**
 * @file 某次训练的结果
 */
import { For, Show } from "solid-js";
import { ChevronLeft, XCircle, LoaderCircle, MoreHorizontal, X } from "lucide-solid";
import { toPng, toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Dialog, DropdownMenu, ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";
import { SetValueView } from "@/components/set-value-view";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore, DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import {
  createWorkoutDay,
  fetchWorkoutDayProfile,
  fetchWorkoutDayProfileProcess,
  fetchWorkoutDayResult,
  fetchWorkoutDayResultProcess,
  WorkoutDayStepDetailsJSON250629,
} from "@/biz/workout_day/services";
import {
  fetchStudentWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDayProcess,
} from "@/biz/workout_action/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { fetchStudentWorkoutDayProfile } from "@/biz/student/services";
import { getSetValueUnit } from "@/biz/input_set_value";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { toNumber } from "@/utils/primitive";

function WorkoutDayProfileViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      result: new RequestCore(fetchWorkoutDayResult, {
        process: fetchWorkoutDayResultProcess,
        client: props.client,
      }),
      create: new RequestCore(createWorkoutDay, { client: props.client }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutDay, {
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
    async share() {
      const profile = request.workout_day.result.response;
      if (!profile) {
        props.app.tip({
          text: ["请等待页面加载完成"],
        });
        return;
      }
      const $node = document.getElementById("share-card");
      if (!$node) {
        props.app.tip({
          text: ["没有渲染分享内容"],
        });
        return;
      }
      if (props.app.env.wechat) {
        ui.$dialog_share_card.show();
      }
      try {
        if (props.app.env.wechat) {
          const url = await toPng($node);
          const $img = new Image();
          $img.src = url;
          const $container = document.getElementById("dialog-share-card");
          if (!$container) {
            return;
          }
          $container.appendChild($img);
          return;
        }
        const blob = await toBlob($node);
        if (!blob) {
          props.app.tip({
            text: ["生成分享图片失败"],
          });
          return;
        }
        const today = dayjs().format("YYYY-MM-DD");
        const title = [today, profile.title].join("_").replace(" ", "_");
        saveAs(blob, title + ".png");
      } catch (err) {
        const e = err as Error;
        props.app.tip({
          text: ["oops, something went wrong!", e.message],
        });
      }
    },
    async createWorkoutDayWithWorkoutDayResult() {
      const profile = request.workout_day.result.response;
      if (!profile) {
        return;
      }
      const updated_details: WorkoutDayStepDetailsJSON250629 = {
        v: "250629",
        steps: profile.steps.map((step, step_idx) => {
          return {
            uid: step_idx + 1,
            note: "",
            sets: step.sets.map((set, set_idx) => {
              return {
                uid: set_idx + 1,
                type: step.type as WorkoutPlanSetType,
                rest_duration: {
                  num: 90,
                  unit: getSetValueUnit("秒"),
                },
                weight: {
                  num: "6",
                  unit: getSetValueUnit("RPE"),
                },
                actions: set.actions.map((act, act_idx) => {
                  return {
                    uid: act_idx + 1,
                    id: act.action_id,
                    zh_name: act.action_name,
                    reps: {
                      num: act.reps,
                      unit: act.reps_unit,
                    },
                    weight: {
                      num: act.weight,
                      unit: act.weight_unit,
                    },
                    rest_duration: {
                      num: 90,
                      unit: getSetValueUnit("秒"),
                    },
                  };
                }),
              };
            }),
          };
        }),
      };
      const r = await request.workout_day.create.run({
        start_when_create: true,
        student_ids: [],
        title: profile.title,
        type: profile.type,
        details: updated_details,
      });
      if (r.error) {
        return;
      }
      if (r.data.ids.length === 0) {
        props.app.tip({
          text: ["异常返回"],
        });
        return;
      }
      const id = r.data.ids[0];
      props.history.push("root.workout_day_self", {
        id: String(id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $history: props.history,
    $menu: new DropdownMenuCore({
      items: [
        // new MenuItemCore({
        //   label: "分享",
        //   onClick() {
        //     ui.$menu.hide();
        //     methods.share();
        //   },
        // }),
        new MenuItemCore({
          label: "创建相同的计划",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.workout_plan_create", {
              workout_day_id: props.view.query.id,
            });
            // methods.share();
          },
        }),
        new MenuItemCore({
          label: "开始相同的训练",
          onClick() {
            ui.$menu.hide();
            methods.createWorkoutDayWithWorkoutDayResult();
          },
        }),
      ],
    }),
    $dialog_share_card: new DialogCore({}),
  };
  let _state = {
    get loading() {
      return request.workout_day.result.loading;
    },
    get profile() {
      return request.workout_day.result.response;
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

  request.workout_day.result.onStateChange((v) => methods.refresh());
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
      const r = await request.workout_day.result.run({ id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      if (r.data.status !== WorkoutDayStatus.Finished) {
        return;
      }
      request.workout_action_history.list.init({ workout_day_id: id });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayResultView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayProfileViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        home={props.view.query.home === "1"}
        hide_bottom_bar={props.view.query.hide_bottom_bar === "1"}
        operations={
          <Show when={props.view.query.home !== "1"}>
            <Flex justify="between">
              <div></div>
              <IconButton
                onClick={(event) => {
                  const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
                  vm.ui.$menu.toggle({ x, y, width, height });
                }}
              >
                <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
              </IconButton>
            </Flex>
          </Show>
        }
      >
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
              <Show when={state().profile?.remark}>
                <div class="flex gap-2 pb-2">
                  <Show
                    when={state().profile?.workout_plan?.creator}
                    fallback={<div class="w-[32px] h-[32px] rounded-full bg-w-bg-5"></div>}
                  >
                    <div
                      class="w-[32px] h-[32px] rounded-full bg-w-bg-5"
                      style={{
                        "background-image": `url('${state().profile?.workout_plan?.creator.avatar_url}')`,
                        "background-size": "cover",
                        "background-position": "center",
                      }}
                    ></div>
                  </Show>
                  <div class="relative flex-1">
                    <div class="relative inline-block p-2 rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] text-w-fg-1 text-sm bg-w-bg-5">
                      {state().profile!.remark}
                    </div>
                  </div>
                </div>
              </Show>
            </div>
            <div>
              <Show when={state().profile!.status === WorkoutDayStatus.Finished}>
                <div class="flex items-center gap-2 mt-4">
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0 whitespace-nowrap">耗时</div>
                    <div class="flex items-end truncate">
                      <div class="text-3xl">{state().profile!.duration}</div>
                      <div>分钟</div>
                    </div>
                  </div>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0 whitespace-nowrap">总容量</div>
                    <div class="flex items-end truncate">
                      <div class="text-3xl">{state().profile!.total_weight}</div>
                      <div>公斤</div>
                    </div>
                  </div>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0 whitespace-nowrap">总组数</div>
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
      <Dialog store={vm.ui.$dialog_share_card} app={props.app}>
        <div class="w-full flex items-center justify-center bg-w-bg-1 rounded-lg p-12">
          <LoaderCircle class="w-12 h-12 text-w-fg-1 animate-spin" />
        </div>
      </Dialog>
      <Dialog store={vm.ui.$dialog_share_card} app={props.app}>
        <div class="relative">
          <div
            class="absolute right-0 -top-12 w-6 h-6"
            onClick={() => {
              vm.ui.$dialog_share_card.hide();
            }}
          >
            <XCircle class="w-6 h-6" />
          </div>
          <div id="dialog-share-card" class="relative flex justify-center w-[80vw] h-[480px] overflow-y-auto"></div>
          <div class="mt-2 text-center">长按保存</div>
        </div>
      </Dialog>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
