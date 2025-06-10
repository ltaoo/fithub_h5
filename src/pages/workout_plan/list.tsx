/**
 * @file 训练计划列表
 */
import { For, Show } from "solid-js";
import { Clock, MoreHorizontal, Plus, Search } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Input, ListView, ScrollView, Skeleton } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Select } from "@/components/ui/select";

import { base, Handler } from "@/domains/base";
import { ButtonCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import {
  fetchWorkoutScheduleList,
  fetchWorkoutScheduleListProcess,
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
} from "@/biz/workout_plan/services";

enum WorkoutPlanOrScheduleType {
  WorkoutPlan = 1,
  WorkoutSchedule = 2,
}

function WorkoutPlanListPageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client })
      ),
    },
    workout_schedule: {
      list: new ListCore(
        new RequestCore(fetchWorkoutScheduleList, {
          process: fetchWorkoutScheduleListProcess,
          client: props.client,
        })
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
    search() {
      const v = ui.$input_keyword.value;
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutPlan) {
        request.workout_plan.list.search({
          keyword: v,
        });
      }
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutSchedule) {
        request.workout_schedule.list.search({
          keyword: v,
        });
      }
    },
    async handlePullToRefresh() {
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutPlan) {
        await request.workout_plan.list.refresh();
      }
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutSchedule) {
        await request.workout_schedule.list.refresh();
      }
      ui.$view.finishPullToRefresh();
    },
    async handleLoadMore() {
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutPlan) {
        await request.workout_plan.list.loadMore();
      }
      if (_state.tab_id === WorkoutPlanOrScheduleType.WorkoutSchedule) {
        await request.workout_schedule.list.loadMore();
      }
      ui.$view.finishLoadingMore();
    },
    gotoWorkoutPlanCreateView() {
      props.history.push("root.workout_plan_create");
    },
    gotoWorkoutScheduleCreateView() {
      props.history.push("root.workout_schedule_create");
    },
    handleClickWorkoutPlan(plan: { id: number }) {
      props.history.push("root.workout_plan_profile", {
        id: String(plan.id),
      });
    },
    handleClickWorkoutSchedule(schedule: { id: number }) {
      props.history.push("root.workout_schedule_profile", {
        id: String(schedule.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      onPullToRefresh: methods.handlePullToRefresh,
      onReachBottom: methods.handleLoadMore,
    }),
    $btn_back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $input_keyword: new InputCore({ defaultValue: "", placeholder: "请输入关键词" }),
    $input_view_select: new SelectCore({
      defaultValue: WorkoutPlanOrScheduleType.WorkoutPlan,
      options: [
        {
          value: WorkoutPlanOrScheduleType.WorkoutPlan,
          label: "单次训练",
        },
        {
          value: WorkoutPlanOrScheduleType.WorkoutSchedule,
          label: "周期计划",
        },
      ],
      onChange(v) {
        ui.$input_keyword.clear();
        if (v === WorkoutPlanOrScheduleType.WorkoutSchedule) {
          request.workout_schedule.list.refresh();
        }
        if (v === WorkoutPlanOrScheduleType.WorkoutPlan) {
          request.workout_plan.list.refresh();
        }
      },
    }),
    $dropdown_menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "创建训练计划",
          onClick() {
            ui.$dropdown_menu.hide();
            methods.gotoWorkoutPlanCreateView();
          },
        }),
        new MenuItemCore({
          label: "创建周期安排",
          onClick() {
            ui.$dropdown_menu.hide();
            methods.gotoWorkoutScheduleCreateView();
          },
        }),
        // new MenuItemCore({
        //   label: "我创建的计划",
        //   onClick() {
        //     ui.$dropdown_menu.hide();
        //     methods.gotoPlanCreateView();
        //   },
        // }),
      ],
    }),
  };

  let _state = {
    get response_plan() {
      return request.workout_plan.list.response;
    },
    get response_schedule() {
      return request.workout_schedule.list.response;
    },
    get tab_id() {
      return ui.$input_view_select.value ?? WorkoutPlanOrScheduleType.WorkoutPlan;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$input_view_select.onChange(() => methods.refresh());
  request.workout_plan.list.onStateChange(() => methods.refresh());
  request.workout_schedule.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      if (ui.$input_view_select.value === WorkoutPlanOrScheduleType.WorkoutPlan) {
        request.workout_plan.list.init();
      }
      if (ui.$input_view_select.value === WorkoutPlanOrScheduleType.WorkoutSchedule) {
        request.workout_schedule.list.init();
      }
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanListPageViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center gap-2">
            <Select store={vm.ui.$input_view_select}></Select>
            <Input store={vm.ui.$input_keyword} />
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.search();
              }}
            >
              <Search class="w-6 h-6 text-w-fg-0" />
            </div>
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$dropdown_menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </div>
          </div>
        }
      >
        <Show when={state().tab_id === WorkoutPlanOrScheduleType.WorkoutPlan}>
          <ListView
            store={vm.request.workout_plan.list}
            class="space-y-2"
            skeleton={
              <div class="p-4 rounded-lg border-2 border-w-fg-3 text-w-fg-1">
                <Skeleton class="w-[68px] h-[28px]" />
              </div>
            }
          >
            <For each={state().response_plan.dataSource}>
              {(v) => {
                return (
                  <div
                    class="overflow-hidden relative w-full p-4 rounded-lg border-2 border-w-fg-3"
                    onClick={() => {
                      vm.methods.handleClickWorkoutPlan(v);
                    }}
                  >
                    <div class="text-lg text-w-fg-0">{v.title}</div>
                    <div class="mt-2 text-sm  text-w-fg-1">{v.overview}</div>
                    <div class="mt-2">
                      <div class="flex items-center gap-1 text-w-fg-1">
                        <Clock class="w-4 h-4" />
                        <div class="text-sm  text-w-fg-1">{v.estimated_duration_text}</div>
                      </div>
                    </div>
                    <Show when={v.tags.length}>
                      <div class="flex flex-wrap gap-2 mt-4">
                        <For each={v.tags}>
                          {(text) => {
                            return (
                              <div class="px-2 py-1 rounded-lg border border-2 border-w-fg-3 text-sm text-w-fg-1">
                                {text}
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                    <div class="flex items-center justify-between mt-4">
                      <div>
                        <div class="flex items-center gap-2">
                          <Show
                            when={v.creator.avatar_url}
                            fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                          >
                            <div
                              class="w-[24px] h-[24px] rounded-full"
                              style={{
                                "background-image": `url('${v.creator.avatar_url}')`,
                                "background-size": "cover",
                                "background-position": "center",
                              }}
                            ></div>
                          </Show>
                          <div class="text-sm text-w-fg-0">{v.creator.nickname}</div>
                        </div>
                      </div>
                      <div class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-sm text-w-fg-0">
                        详情
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </ListView>
        </Show>
        <Show when={state().tab_id === WorkoutPlanOrScheduleType.WorkoutSchedule}>
          <ListView
            store={vm.request.workout_schedule.list}
            class="space-y-2"
            skeleton={
              <div class="p-4 rounded-lg border-2 border-w-fg-3 text-w-fg-1">
                <Skeleton class="w-[68px] h-[28px]" />
              </div>
            }
          >
            <For each={state().response_schedule.dataSource}>
              {(v) => {
                return (
                  <div
                    class="overflow-hidden relative w-full p-4 rounded-lg border-2 border-w-fg-3"
                    onClick={() => {
                      vm.methods.handleClickWorkoutSchedule(v);
                    }}
                  >
                    <div class="absolute right-4 top-4">
                      <div class="px-2 rounded-full bg-blue-500 text-[12px] text-w-fg-0">{v.type_text}</div>
                    </div>
                    <div class="text-lg text-w-fg-0">{v.title}</div>
                    <div class="text-sm text-w-fg-1">{v.overview}</div>
                    <div class="flex items-center justify-between mt-4">
                      <div>
                        <div class="flex items-center gap-2">
                          <Show
                            when={v.creator.avatar_url}
                            fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                          >
                            <div
                              class="w-[24px] h-[24px] rounded-full"
                              style={{
                                "background-image": `url('${v.creator.avatar_url}')`,
                                "background-size": "cover",
                                "background-position": "center",
                              }}
                            ></div>
                          </Show>
                          <div class="text-sm text-w-fg-0">{v.creator.nickname}</div>
                        </div>
                      </div>
                      <div class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-sm text-w-fg-0">
                        详情
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </ListView>
        </Show>
      </PageView>
      <DropdownMenu store={vm.ui.$dropdown_menu} />
    </>
  );
}
