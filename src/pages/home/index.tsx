/**
 * @file 首页
 */
import { For, Show } from "solid-js";
import { BicepsFlexed, Check, Coffee } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { Button, ScrollView, Skeleton } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { TopSheet } from "@/components/top-sheet";

import { RequestCore } from "@/domains/request";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { ListCore } from "@/domains/list";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { Result } from "@/domains/result";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import {
  fetchMyWorkoutScheduleList,
  fetchMyWorkoutScheduleListProcess,
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
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
        }),
        {
          search: {
            status: WorkoutDayStatus.Finished,
          },
        }
      ),
      has_started: new RequestCore(checkHasStartedWorkoutDay, {
        client: props.client,
        onFailed(error) {
          // ...
        },
      }),
    },
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client }),
        { pageSize: 100 }
      ),
    },
    workout_schedule: {
      enabled: new RequestCore(fetchMyWorkoutScheduleList, {
        process: fetchMyWorkoutScheduleListProcess,
        client: props.client,
      }),
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
      const v = dayjs(day.value).startOf("d");
      const the_date_text = v.format("YYYY-MM-DD");
      const today_text = dayjs().format("YYYY-MM-DD");
      const completed_plans_in_the_day = request.workout_day.list.response.dataSource.filter((v) => {
        return v.status === WorkoutDayStatus.Finished && v.day === the_date_text;
      });
      const completed_plan_ids_in_the_day = completed_plans_in_the_day.map((v) => v.workout_plan.id);
      // console.log("[PAGE]home/index - handleClickDay - before completed_plan_ids = ", completed_plan_ids);
      const schedule_of_the_day = _schedules[the_date_text];
      /** 指定天内完成的 不属于计划中的训练 */
      const extra_workout_days: { id: number; workout_plan_id: number; title: string; finished_at_text: string }[] = [];
      if (schedule_of_the_day) {
        const plan_ids_today_need_to_do = schedule_of_the_day.workout_plans.map((v) => v.id);
        console.log(
          "[PAGE]home/index - handleClickDay - plan_ids_today_need_to_do",
          plan_ids_today_need_to_do,
          completed_plan_ids_in_the_day
        );
        for (let i = 0; i < completed_plans_in_the_day.length; i += 1) {
          const vv = completed_plans_in_the_day[i];
          if (!plan_ids_today_need_to_do.includes(vv.workout_plan.id)) {
            extra_workout_days.push({
              id: vv.id,
              workout_plan_id: vv.workout_plan.id,
              title: vv.workout_plan.title,
              finished_at_text: vv.finished_at_text,
            });
          }
        }
      }
      // console.log("[]before _cur_day_profile = ", dayjs(v).isBefore(dayjs(), "d"), dayjs(v).format("YYYY-MM-DD"));
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
        is_today: the_date_text === today_text,
        is_pass_day: dayjs(v).isBefore(dayjs(), "d"),
        workout_day: null,
        schedule: (() => {
          if (!schedule_of_the_day) {
            return {
              type: WorkoutScheduleDayType.NoSchedule,
              workout_plans: [],
            };
          }
          return {
            ...schedule_of_the_day,
            workout_plans: schedule_of_the_day.workout_plans.map((v) => {
              return {
                ...v,
                ...(() => {
                  const idx = completed_plans_in_the_day.findIndex((vv) => vv.workout_plan.id === v.id);
                  console.log("find idx", idx, v.id);
                  if (idx === -1) {
                    return {
                      completed: false,
                      finished_at_text: "",
                    };
                  }
                  return {
                    finished_at_text: completed_plans_in_the_day[idx].finished_at_text,
                    completed: true,
                  };
                })(),
              };
            }),
          };
        })(),
        extra_completed_workout_days: extra_workout_days,
      };
      const matched = request.workout_day.list.response.dataSource.find((v) => {
        return dayjs(day.value).isSame(v.day, "date");
      });
      if (matched) {
        _cur_day_profile.workout_day = {
          status: matched.status,
        };
      }
      console.log("[PAGE]home/index - cur_day_profile", _cur_day_profile);
      methods.refresh();
      if (ui.$dialog_calendar.state.open) {
        return;
      }
      ui.$dialog_calendar.show();
    },
    checkShouldShowWorkoutTipDialog() {
      const today = dayjs().format("YYYY-MM-DD");
      const today_schedule = _schedules[today];
      if (!today_schedule) {
        return false;
      }
      if (today_schedule.type !== WorkoutScheduleDayType.Workout) {
        return false;
      }
      const today_workout_plans = today_schedule.workout_plans;
      if (today_workout_plans.length === 0) {
        return false;
      }
      const today_workout_days = request.workout_day.list.response.dataSource.filter((v) => {
        return v.day === today;
      });
      if (today_workout_days.length === 0) {
        return true;
      }
      // console.log('today_workout_days', today_workout_days);
      const completed_plan_ids_in_today = today_workout_days.map((d) => {
        return d.workout_plan.id;
      });
      for (let i = 0; i < today_workout_plans.length; i += 1) {
        const target_plan = today_workout_plans[i];
        if (!completed_plan_ids_in_today.includes(target_plan.id)) {
          return true;
        }
      }
      return false;
    },
    async ready() {
      request.workout_day.has_started.run();
      await request.workout_day.list.init();
      (async () => {
        const r = await request.workout_schedule.enabled.run();
        if (r.error) {
          return;
        }
        const { list } = r.data;
        const workout_plan_ids: number[] = [];
        for (let a = 0; a < list.length; a += 1) {
          const schedule = list[a];
          for (let b = 0; b < schedule.schedules.length; b += 1) {
            const ids = schedule.schedules[b].workout_plan_ids;
            for (let c = 0; c < ids.length; c += 1) {
              if (!workout_plan_ids.includes(ids[c])) {
                workout_plan_ids.push(ids[c]);
              }
            }
          }
        }
        const r2 = await request.workout_plan.list.search({ ids: workout_plan_ids });
        if (r2.error) {
          return;
        }
        const schedules = buildWorkoutScheduleWithSpecialDay(
          list.map((v) => {
            // console.log(v.schedules);
            return {
              type: v.type,
              start_date: v.start_date,
              days: v.schedules.map((vv) => {
                return {
                  idx: vv.idx,
                  day: vv.day,
                  weekday: vv.weekday,
                  workout_plans: (() => {
                    const result: TheItemTypeFromListCore<typeof request.workout_plan.list>[] = [];
                    for (let i = 0; i < vv.workout_plan_ids.length; i += 1) {
                      const plan_id = vv.workout_plan_ids[i];
                      const m = r2.data.dataSource.find((plan) => plan.id === plan_id);
                      if (m) {
                        result.push(m);
                      }
                    }
                    return result;
                  })(),
                };
              }),
              // days: v.schedules.map((vv) => {
              //   return {
              //     day: vv.day,
              //     weekday: vv.weekday,
              //     workout_plan: {
              //       id: vv.workout_plan_id,
              //       title: vv.title,
              //       overview: vv.overview,
              //       tags: vv.tags,
              //     },
              //   };
              // }),
            };
          }),
          new Date()
        );
        _schedules = schedules;
        const shouldTip = methods.checkShouldShowWorkoutTipDialog();
        // if (shouldTip) {
        //   alert(1);
        // }
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
    $dialog_workout_tip: new DialogCore({}),
    $btn_goto_workout_schedule: new ButtonCore({
      onClick() {
        ui.$dialog_calendar.hide();
        props.history.push("root.workout_plan_list", {
          schedule: "1",
        });
      },
    }),
  };

  type TheDay = { id: number; value: Date };
  let _cur_day: TheDay | null = null;
  let _cur_day_profile: {
    month_text: string;
    day_text: string;
    weekday_text: string;
    is_today: boolean;
    is_pass_day: boolean;
    workout_day: {
      status: WorkoutDayStatus;
    } | null;
    schedule: {
      type: WorkoutScheduleDayType;
      workout_plans: {
        id: number;
        title: string;
        overview: string;
        tags: string;
        completed: boolean;
        finished_at_text: string;
      }[];
    };
    extra_completed_workout_days: { id: number; workout_plan_id: number; title: string; finished_at_text: string }[];
  } | null = null;
  let _schedules: Record<
    string,
    {
      type: WorkoutScheduleDayType;
      workout_plans: { id: number; title: string; overview: string; tags: string }[];
    }
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
                status: WorkoutScheduleDayType.NoSchedule,
                r,
              };
            }
            if (m.type === WorkoutScheduleDayType.Resting) {
              return {
                status: m.type,
                r,
              };
            }
            if (m.type === WorkoutScheduleDayType.Empty) {
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
    get workout_plans_need_to_do() {
      return [];
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

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const r = await methods.ready();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
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

export const HomeIndexPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(HomeIndexPageViewModel, [props]);

  return (
    <>
      <div
        class="z-0 fixed top-0 left-1/2 -translate-x-1/2 bg-w-bg-0"
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
      <div class="absolute top-[134px] bottom-0 left-0 w-full bg-w-bg-0">
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
                          class="relative p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0 bg-w-bg-0"
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
                            <div class="flex items-center gap-2 mt-2">
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
                          <div class="flex items-center justify-between mt-2">
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
      <TopSheet top={92} store={vm.ui.$dialog_calendar} app={props.app}>
        <div class="bg-w-bg-0 p-4 border-b border-w-fg-3">
          <Show when={state().day}>
            <div class="flex items-center text-w-fg-0">
              <div class="text-2xl">
                {state().day?.month_text}
                {state().day?.day_text}
              </div>
            </div>
            <div class="text-w-fg-0">{state().day?.weekday_text}</div>
            <Show when={state().day?.schedule.type === WorkoutScheduleDayType.NoSchedule}>
              <div class="pt-4">
                <div class="text-w-fg-1 text-center">暂无周期计划</div>
                <div class="mt-2">
                  <Button class="w-full" store={vm.ui.$btn_goto_workout_schedule}>
                    前往添加
                  </Button>
                </div>
              </div>
            </Show>
            <Show when={state().day?.schedule.type === WorkoutScheduleDayType.Resting}>
              <div class="pt-4">
                <div class="flex flex-col items-center gap-2">
                  <Coffee class="w-6 h-6 text-w-fg-0" />
                  <div class="text-w-fg-1">休息日</div>
                </div>
              </div>
            </Show>
            <div class="pt-4 space-y-2">
              <Show when={state().day?.schedule.type === WorkoutScheduleDayType.Workout}>
                <For each={state().day?.schedule.workout_plans}>
                  {(v) => {
                    return (
                      <div
                        class="p-2 border-2 border-w-fg-3 rounded-lg"
                        onClick={() => {
                          vm.ui.$dialog_calendar.hide();
                          props.history.push("root.workout_plan_profile", {
                            id: String(v.id),
                          });
                        }}
                      >
                        <div class="text-w-fg-0">{v.title}</div>
                        <div class="text-w-fg-1 text-sm">{v.overview}</div>
                        <div class="flex items-center justify-between">
                          <div>
                            <Show when={v.completed}>
                              <div class="text-sm text-w-fg-1">完成于{v.finished_at_text}</div>
                            </Show>
                          </div>
                          <div>
                            <Show
                              when={!v.completed}
                              fallback={
                                <div>
                                  <Check class="w-6 h-6 text-green-500" />
                                </div>
                              }
                            >
                              <Show
                                when={state().day?.is_today}
                                fallback={
                                  <Show when={state().day?.is_pass_day}>
                                    <div>
                                      <div class="text-sm text-w-fg-1">未完成</div>
                                    </div>
                                  </Show>
                                }
                              >
                                <div class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-w-fg-0">
                                  <div class="text-sm">开始训练</div>
                                </div>
                              </Show>
                            </Show>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </Show>
              <For each={state().day?.extra_completed_workout_days}>
                {(v) => {
                  return (
                    <div
                      class="p-2 border-2 border-w-fg-3 rounded-lg"
                      onClick={() => {
                        vm.ui.$dialog_calendar.hide();
                        props.history.push("root.workout_day_profile", {
                          id: String(v.id),
                        });
                      }}
                    >
                      <div class="text-w-fg-0">{v.title}</div>
                      {/* <div class="text-w-fg-1 text-sm">{v.overview}</div> */}
                      <div class="flex items-center justify-between">
                        <div class="text-sm text-w-fg-1">完成于{v.finished_at_text}</div>
                        <div>
                          <div>
                            <Check class="w-6 h-6 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </TopSheet>
      <Sheet store={vm.ui.$dialog_workout_tip} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-w-fg-0 text-center">提示</div>
          <div class="text-sm text-w-fg-1 text-center">存在健身计划待执行</div>
        </div>
      </Sheet>
    </>
  );
};
