/**
 * @file 首页
 */
import { For, Show } from "solid-js";
import { BicepsFlexed, Check, Coffee } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { ScrollView, Skeleton } from "@/components/ui";

import { RequestCore } from "@/domains/request";
import { base, Handler } from "@/domains/base";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { ListCore } from "@/domains/list";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { Result } from "@/domains/result";
import {
  fetchMyWorkoutScheduleList,
  fetchWorkoutPlanSetList,
  fetchWorkoutPlanSetListProcess,
} from "@/biz/workout_plan/services";
import {
  checkHasStartedWorkoutDay,
  fetchStartedWorkoutDayList,
  fetchStartedWorkoutDayListProcess,
  fetchWorkoutDayList,
  fetchWorkoutDayListProcess,
} from "@/biz/workout_day/services";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { buildWorkoutScheduleWithSpecialDay } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleDayType } from "@/biz/workout_plan/constants";
import { sleep } from "@/utils";

import { HomeViewTabHeader } from "./components/tabs";
import { CalendarSheet } from "./components/calendar_sheet";

const WeekdayChineseTextArr = ["一", "二", "三", "四", "五", "六", "日"];

function HomeIndexPageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan_set: {
      list: new RequestCore(fetchWorkoutPlanSetList, { process: fetchWorkoutPlanSetListProcess, client: props.client }),
    },
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
      has_started: new RequestCore(checkHasStartedWorkoutDay, {
        client: props.client,
        onFailed(error) {
          // ...
        },
      }),
    },
    workout_schedule: {
      enabled: new RequestCore(fetchMyWorkoutScheduleList, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickSet(v: { id: number; type: number }) {
      if (v.type === 1) {
        props.history.push("root.workout_plan_profile", {
          id: String(v.id),
        });
        return;
      }
      if (v.type === 2) {
        props.history.push("root.workout_schedule_profile", {
          id: String(v.id),
        });
        return;
      }
      props.app.tip({
        text: ["异常数据"],
      });
    },
    gotoWorkoutPlanListView() {
      props.history.push("root.workout_plan_list");
    },
    gotoWorkoutDayPrepareView() {
      props.history.push("root.workout_day_prepare");
    },
    gotoWorkoutDayView() {
      props.history.push("root.workout_day");
    },
    handleClickDay(day: TheDay) {
      if (_cur_day?.id === day.id) {
        ui.$dialog_calendar.hide();
        return;
      }
      _cur_day = day;
      const v = dayjs(day.value);
      _cur_day_profile = {
        month_text: `${v.month() + 1}月`,
        day_text: `${v.date()}日`,
        weekday_text: `星期${
          WeekdayChineseTextArr[
            (() => {
              const n = v.day();
              if (n === 0) {
                return 6;
              }
              return n - 1;
            })()
          ]
        }`,
        workout_day: null,
        schedule: (() => {
          const m = _schedules[v.format("YYYY-MM-DD")];
          if (!m) {
            return {
              type: WorkoutScheduleDayType.Empty,
              workout_plans: [],
            };
          }
          return {
            ...m,
            workout_plans: m.workout_plans.map((v) => {
              return {
                ...v,
                completed: request.workout_day.list.response.dataSource
                  .map((v) => {
                    return v.workout_plan.id;
                  })
                  .includes(v.id),
              };
            }),
          };
        })(),
      };
      const matched = request.workout_day.list.response.dataSource.find((v) => {
        return dayjs(day.value).isSame(v.day, "date");
      });
      if (matched) {
        _cur_day_profile.workout_day = {
          status: matched.status,
        };
      }
      methods.refresh();
      if (ui.$dialog_calendar.state.open) {
        return;
      }
      ui.$dialog_calendar.show();
    },
    async ready() {
      request.workout_day.list.init();
      request.workout_day.has_started.run();
      (async () => {
        const r = await request.workout_schedule.enabled.run();
        if (r.error) {
          return;
        }
        const { list } = r.data;
        const schedules = buildWorkoutScheduleWithSpecialDay(
          list.map((v) => {
            return {
              type: v.type,
              days: v.schedules.map((vv) => {
                return {
                  day: vv.day,
                  weekday: vv.weekday,
                  workout_plan: {
                    id: vv.workout_plan_id,
                    title: vv.title,
                    tags: vv.tags,
                  },
                };
              }),
            };
          }),
          new Date()
        );
        _schedules = schedules;
        methods.refresh();
        // console.log(schedules);
      })();
      const r = await request.workout_plan_set.list.run();
      if (r.error) {
        return Result.Err(r.error);
      }
      const { list } = r.data;
      ui.$tab.setTabs(
        list.map((v) => {
          return {
            id: v.id,
            text: v.title,
          };
        })
      );
      // if (list.length) {
      //   ui.$tab.selectById(list[0].id);
      // }
      methods.refresh();
      return Result.Ok(null);
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await methods.ready();
        props.app.tip({
          text: ["刷新成功"],
        });
        ui.$view.finishPullToRefresh();
      },
    }),
    $tab: new TabHeaderCore({
      options: [
        {
          id: 1,
          text: "推荐",
        },
        {
          id: 2,
          text: "HIIT",
        },
        {
          id: 3,
          text: "五分化",
        },
      ] as { id: number; text: string }[],
      // onMounted() {
      //   ui.$tab.selectById(1);
      // },
      onChange(value) {
        // props.history.push(value.id);
        methods.refresh();
      },
    }),
    $calendar: CalendarCore({
      today: new Date(),
    }),
    $dialog_calendar: new DialogCore({
      onCancel() {
        _cur_day = null;
        methods.refresh();
      },
    }),
  };

  type TheDay = { id: number; value: Date };
  let _cur_day: TheDay | null = null;
  let _cur_day_profile: {
    month_text: string;
    day_text: string;
    weekday_text: string;
    workout_day: {
      status: WorkoutDayStatus;
    } | null;
    schedule: {
      type: WorkoutScheduleDayType;
      workout_plans: { id: number; completed: boolean; title: string; tags: string }[];
    };
  } | null = null;
  let _schedules: Record<
    string,
    { type: WorkoutScheduleDayType; workout_plans: { id: number; title: string; tags: string }[] }
  > = {};
  const _state = {
    get weekdays() {
      const today_text = new Date().getDate();
      return ui.$calendar.state.weekdays.map((day, idx) => {
        return {
          ...day,
          week_text: WeekdayChineseTextArr[idx],
          is_pass: day.value.getDate() < today_text,
          selected: (() => {
            if (!_cur_day) {
              return day.is_today;
            }
            return _cur_day.id === day.id;
          })(),
          has_workout_day: request.workout_day.list.response.dataSource.find((v) => {
            // console.log("workout_day day", v.day);
            return dayjs(day.value).isSame(v.day, "date");
          }),
          schedule: (() => {
            const r: { id: number; title: string; tags: string }[] = [];
            const m = _schedules[day.yyyy];
            if (!m) {
              return {
                status: WorkoutScheduleDayType.Empty,
                r,
              };
            }
            if (m.type === WorkoutScheduleDayType.Resting) {
              return {
                status: m.type,
                r,
              };
            }
            if (m) {
              r.push(
                ...m.workout_plans.map((plan) => {
                  return {
                    ...plan,
                  };
                })
              );
            }
            return {
              status: m.type,
              r,
            };
          })(),
        };
      });
    },
    get cur_tab() {
      return ui.$tab.state.curId;
    },
    get initial() {
      return request.workout_plan_set.list.initial;
    },
    get loading() {
      return request.workout_plan_set.list.loading;
    },
    get dataSource() {
      const resp = request.workout_plan_set.list.response;
      if (!resp) {
        return [];
      }
      if (resp.list.length === 0) {
        return [];
      }
      const cur_id = ui.$tab.state.curId ?? resp.list[0].id;
      if (!cur_id) {
        return [];
      }
      const matched = resp.list.find((vv) => vv.id === Number(cur_id));
      if (!matched) {
        return [];
      }
      return matched.list;
    },
    get day() {
      return _cur_day_profile;
    },
    get has_workout_day() {
      return !!request.workout_day.has_started.response?.list.length;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.workout_day.list.onStateChange(() => methods.refresh());
  request.workout_day.has_started.onStateChange(() => methods.refresh());
  props.history.onRouteChange(() => {
    ui.$dialog_calendar.hide();
  });

  return {
    methods,
    ui,
    state: _state,
    ready() {
      methods.ready();
    },
    destroy() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeIndexPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(HomeIndexPageViewModel, [props]);

  return (
    <>
      <div
        class="z-0 fixed top-0 left-1/2 -translate-x-1/2"
        classList={{
          "w-[375px] mx-auto": props.app.env.pc,
          "w-full": !props.app.env.pc,
        }}
      >
        <div class="">
          <div class="grid grid-cols-7 gap-2 p-2">
            <For each={state().weekdays}>
              {(day) => {
                return (
                  <div
                    class="relative"
                    onClick={() => {
                      vm.methods.handleClickDay(day);
                    }}
                  >
                    <Show when={day.is_pass}>
                      <div class="absolute inset-0 bg-w-bg-0 opacity-50 pointer-events-none"></div>
                    </Show>
                    <div
                      class="relative py-2 px-2 rounded-full border-2"
                      classList={{
                        "border-green-500 text-w-fg-0 ": day.selected,
                        " border-w-fg-3 text-w-fg-1 ": !day.selected,
                        "": day.is_pass,
                      }}
                    >
                      <div class="text-center">{day.week_text}</div>
                      <div class="flex items-center justify-center h-[32px]">
                        <Show
                          when={day.has_workout_day}
                          fallback={
                            <Show when={!day.is_pass}>
                              <Show
                                when={day.schedule.status === WorkoutScheduleDayType.Workout}
                                fallback={
                                  <Show
                                    when={day.schedule.status === WorkoutScheduleDayType.Resting}
                                    fallback={
                                      <Show when={day.is_today}>
                                        <div class="flex items-center justify-center w-[24px] h-[24px] border-w-fg-2 rounded-full">
                                          <div class="text-w-fg-1 text-[12px]">今</div>
                                        </div>
                                      </Show>
                                    }
                                  >
                                    <Coffee class="w-4 h-4 text-w-fg-1" />
                                  </Show>
                                }
                              >
                                <BicepsFlexed class="w-4 h-4 text-w-fg-1" />
                              </Show>
                            </Show>
                          }
                        >
                          <Check class="w-4 h-4 text-green-500" />
                        </Show>
                      </div>
                      {/* <div class="text-w-fg-0 text-sm text-center">{day.week_text}</div> */}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="border-b-2 border-w-fg-3">
            <HomeViewTabHeader
              store={vm.ui.$tab}
              onMoreClick={() => {
                vm.methods.gotoWorkoutPlanListView();
              }}
            />
          </div>
        </div>
      </div>
      <div class="absolute top-[134px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view} class="scroll--hidden">
          <div class="p-2 pb-8 relative whitespace-nowrap">
            <Show
              when={!state().initial}
              fallback={
                <div class="p-4 h-[160px] rounded-xl border-2 border-w-fg-3">
                  <Skeleton class="w-[120px] h-[32px]" />
                </div>
              }
            >
              <Show
                when={state().dataSource.length}
                fallback={
                  <Show when={!state().loading}>
                    <div class="flex justify-center p-4">
                      <div class="text-sm text-w-fg-1">没有数据了</div>
                    </div>
                  </Show>
                }
              >
                <div class="space-y-2">
                  <For each={state().dataSource}>
                    {(vv) => {
                      return (
                        <div
                          class="relative p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0"
                          onClick={() => {
                            vm.methods.handleClickSet(vv);
                          }}
                        >
                          {/* <div class="absolute right-4 top-4">
                            <div class="px-2 rounded-full bg-blue-500 text-white text-sm">{vv.type_text}</div>
                          </div> */}
                          <div class="text-xl">{vv.title}</div>
                          <div class="flex mt-1">
                            <div
                              class="px-2 rounded-full text-white text-sm"
                              classList={{
                                "bg-blue-500 ": vv.type === 1,
                                "bg-green-500 ": vv.type === 2,
                              }}
                            >
                              {vv.type_text}
                            </div>
                          </div>
                          <Show when={vv.overview}>
                            <div class="text-w-fg-1 mt-4">{vv.overview}</div>
                          </Show>
                          <Show when={vv.tags.length}>
                            <div class="flex items-center gap-2">
                              <For each={vv.tags}>
                                {(tag) => {
                                  return (
                                    <div class="px-2 rounded-full border-2 border-w-fg-3">
                                      <div class="text-sm text-w-fg-0">{tag}</div>
                                    </div>
                                  );
                                }}
                              </For>
                            </div>
                          </Show>
                          <div class="flex items-center justify-between mt-4">
                            <div class="flex items-center gap-2">
                              <Show
                                when={vv.creator.avatar_url}
                                fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                              >
                                <div
                                  class="w-[24px] h-[24px] rounded-full"
                                  style={{
                                    "background-image": `url('${vv.creator.avatar_url}')`,
                                    "background-size": "cover",
                                    "background-position": "center",
                                  }}
                                ></div>
                              </Show>
                              <div class="text-sm text-w-fg-0">{vv.creator.nickname}</div>
                            </div>
                            <div class="px-4 py-2 border-2 border-w-fg-3 bg-w-bg-5 rounded-full">
                              <div class="text-w-fg-0 text-sm">详情</div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </ScrollView>
      </div>
      <Show when={state().has_workout_day}>
        <div class="absolute right-2 bottom-16">
          <div
            class="p-4 rounded-full bg-w-bg-5"
            onClick={() => {
              vm.methods.gotoWorkoutDayView();
            }}
          >
            <div class="text-white text-sm text-w-fg-1">进行中的训练</div>
          </div>
        </div>
      </Show>
      <CalendarSheet store={vm.ui.$dialog_calendar} app={props.app}>
        <div class="bg-w-bg-0 p-4 border-b border-w-fg-3">
          <Show when={state().day}>
            <div class="flex items-center text-w-fg-0">
              <div class="text-2xl">
                {state().day?.month_text}
                {state().day?.day_text}
              </div>
            </div>
            <div class="text-w-fg-0">{state().day?.weekday_text}</div>
            <Show when={state().day?.schedule.type === WorkoutScheduleDayType.Resting}>
              <div class="py-4">
                <div class="flex flex-col items-center gap-2">
                  <Coffee class="w-6 h-6 text-w-fg-0" />
                  <div class="text-w-f-g0">休息日</div>
                </div>
              </div>
            </Show>
            <Show when={state().day?.schedule.type === WorkoutScheduleDayType.Workout}>
              <div class="py-4 space-y-2">
                <For each={state().day?.schedule.workout_plans}>
                  {(v) => {
                    return (
                      <div class="p-2 border-2 border-w-fg-3 rounded-lg">
                        <div class="text-w-fg-0">{v.title}</div>
                        <div class="text-sm text-w-fg-1">{v.tags}</div>
                        <div class="flex items-center justify-between">
                          <div></div>
                          <div>
                            <Show
                              when={!v.completed}
                              fallback={
                                <div>
                                  <Check class="w-6 h-6 text-green-500" />
                                </div>
                              }
                            >
                              <div
                                class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-w-fg-0"
                                onClick={() => {
                                  vm.ui.$dialog_calendar.hide();
                                  props.history.push("root.workout_plan_profile", {
                                    id: String(v.id),
                                  });
                                }}
                              >
                                <div class="text-sm">fight!</div>
                              </div>
                            </Show>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </CalendarSheet>
    </>
  );
};
