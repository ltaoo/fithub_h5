import dayjs, { Dayjs } from "dayjs";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { Result } from "@/domains/result";
import { fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { seconds_to_hour_with_template, seconds_to_hour_template1 } from "@/utils";

import {
  applyWorkoutSchedule,
  cancelWorkoutSchedule,
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
  fetchWorkoutScheduleProfile,
  fetchWorkoutScheduleProfileProcess,
} from "./services";
import { WorkoutScheduleDayType, WorkoutScheduleType } from "./constants";

export function WorkoutScheduleViewModel(props: { client: HttpClientCore }) {
  const request = {
    workout_schedule: {
      profile: new RequestCore(fetchWorkoutScheduleProfile, {
        process: fetchWorkoutScheduleProfileProcess,
        client: props.client,
      }),
      apply: new RequestCore(applyWorkoutSchedule, { client: props.client }),
      cancel: new RequestCore(cancelWorkoutSchedule, { client: props.client }),
    },
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client }),
        {
          pageSize: 100,
        }
      ),
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
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async fetch(arg: { id: number }) {
      const r = await request.workout_schedule.profile.run(arg);
      if (r.error) {
        return Result.Err(r.error);
      }
      const profile = r.data;
      _profile = profile;
      methods.refresh();
      const workout_plan_ids: number[] = [];
      for (let i = 0; i < profile.schedules.length; i += 1) {
        const s = profile.schedules[i];
        const ids = s.workout_plan_ids;
        for (let j = 0; j < ids.length; j += 1) {
          if (!workout_plan_ids.includes(ids[j])) {
            workout_plan_ids.push(ids[j]);
          }
        }
      }
      const r2 = await request.workout_plan.list.search({ ids: workout_plan_ids });
      if (r2.error) {
        return Result.Err(r2.error);
      }
      if (profile.type === WorkoutScheduleType.Weekly) {
        const schedules = [1, 2, 3, 4, 5, 6, 7].map((v) => {
          const has_schedule = profile.schedules.find((p) => p.weekday === v);
          if (has_schedule) {
            return {
              type: WorkoutScheduleDayType.Workout,
              day: v,
              day_text: map_weekday_text(v),
              workout_plans: (() => {
                const result = [];
                for (let i = 0; i < has_schedule.workout_plan_ids.length; i += 1) {
                  const id = has_schedule.workout_plan_ids[i];
                  const matched_plan = r2.data.dataSource.find((v) => v.id === id);
                  if (matched_plan) {
                    result.push({
                      id: matched_plan.id,
                      title: matched_plan.title,
                      estimated_duration_text: seconds_to_hour_with_template(
                        matched_plan.estimated_duration,
                        seconds_to_hour_template1
                      ),
                    });
                  }
                }
                return result;
              })(),
            };
          }
          return {
            type: WorkoutScheduleDayType.Resting,
            day: v,
            day_text: map_weekday_text(v),
            workout_plans: [],
          };
        });
        _schedules = schedules;
      }
      if (profile.type === WorkoutScheduleType.Days) {
        const schedules: typeof _schedules = [];
        for (let i = 0; i < profile.schedules.length; i += 1) {
          const has_schedule = profile.schedules[i];
          if (has_schedule.workout_plan_ids.length) {
            schedules.push({
              type: WorkoutScheduleDayType.Workout,
              day: 0,
              day_text: `第${i + 1}天`,
              workout_plans: (() => {
                const result = [];
                for (let i = 0; i < has_schedule.workout_plan_ids.length; i += 1) {
                  const id = has_schedule.workout_plan_ids[i];
                  const matched_plan = r2.data.dataSource.find((v) => v.id === id);
                  if (matched_plan) {
                    result.push({
                      id: matched_plan.id,
                      title: matched_plan.title,
                      estimated_duration_text: seconds_to_hour_with_template(
                        matched_plan.estimated_duration,
                        seconds_to_hour_template1
                      ),
                    });
                  }
                }
                return result;
              })(),
            });
          } else {
            schedules.push({
              type: WorkoutScheduleDayType.Resting,
              day: 0,
              day_text: `第${i + 1}天`,
              workout_plans: [],
            });
          }
        }
        _schedules = schedules;
      }
      if (profile.type === WorkoutScheduleType.Monthly) {
        // const schedules = [
        //   1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
        // ].map((v) => {
        // });
      }
      methods.refresh();
      return Result.Ok(r.data);
    },
  };

  let _profile: TheResponseOfRequestCore<typeof request.workout_schedule.profile> | null = null;
  let _schedules: {
    type: WorkoutScheduleDayType;
    day: number;
    day_text: string;
    workout_plans: {
      id: number;
      title: string;
      estimated_duration_text: string;
    }[];
  }[] = [];
  let _workout_plans: Record<number, { title: string; estimated_duration_text: string }> = {};
  let _state = {
    get loading() {
      return request.workout_schedule.profile.loading;
    },
    get profile() {
      return _profile;
      // const resp = request.workout_schedule.profile.response;
      // if (!resp) {
      //   return null;
      // }
      // return {
      //   ...resp,
      //   schedules: resp.schedules.map((s) => {
      //     const has_workout_plans = !!s.workout_plan_ids.length;
      //     return {
      //       ...s,
      //       day_text: (() => {
      //         if (resp.type === WorkoutScheduleType.Weekly) {
      //           return
      //         }
      //       })(),
      //       type: has_workout_plans ? WorkoutScheduleDayType.Workout : WorkoutScheduleDayType.Resting,
      //       workout_plans: s.workout_plan_ids.map((v) => {
      //         return _workout_plans[v];
      //       }),
      //     };
      //   }),
      // };
    },
    get schedules() {
      return _schedules;
    },
    get error() {
      return request.workout_schedule.profile.error;
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

  request.workout_schedule.profile.onStateChange(() => methods.refresh());
  request.workout_schedule.profile.onError((e) => {
    bus.emit(Events.Error, e);
  });

  return {
    request,
    methods,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutScheduleViewModel = ReturnType<typeof WorkoutScheduleViewModel>;

const WeekdayTexts = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日", "周日", "周日"];
export function map_weekday_text(d: number) {
  return WeekdayTexts[d];
}

export function buildWorkoutScheduleWithSpecialDay(
  schedules: {
    type: WorkoutScheduleType;
    start_date: Dayjs;
    days: {
      idx: number;
      day: number;
      weekday: number;
      workout_plans: { id: number; title: string }[];
    }[];
    // days: {
    //   day: number;
    //   weekday: number;
    //   workout_plan: { id: number; title: string; overview: string; tags: string };
    // }[];
  }[],
  day: Date
) {
  const workout_plans_in_day: Record<
    string,
    {
      type: WorkoutScheduleDayType;
      // day_text: string;
      workout_plan: { id: number; title: string; overview: string; tags: string };
    }[]
  > = {};
  for (let i = 0; i < schedules.length; i += 1) {
    const { type, days, start_date } = schedules[i];
    // console.log("[BIZ]workout_plan/workout_schedule - schedule", type, days, start_date);
    const monday = dayjs(day).startOf("week");
    // console.log("[]buildWorkoutScheduleWithSpecialDay", monday.format("YYYY-MM-DD"));
    if (type === WorkoutScheduleType.Days && days.length) {
      for (let j = 1; j < 8; j += 1) {
        // const weekday = dayjs(day).set("day", j);
        const weekday = monday.clone().set("day", j);
        const weekday_text = weekday.format("YYYY-MM-DD");
        workout_plans_in_day[weekday_text] = workout_plans_in_day[weekday_text] || [];
        (() => {
          // console.log("weekday.isBefore(start_date)", weekday_text, start_date.format("YYYY-MM-DD"));
          if (weekday.isBefore(start_date.startOf("date"))) {
            workout_plans_in_day[weekday_text].push({
              type: WorkoutScheduleDayType.Empty,
              // day_text: dayjs(day).set("day", j).format("YYYY-MM-DD"),
              workout_plan: { id: 0, title: "", overview: "", tags: "" },
            });
            return;
          }
          const diff = weekday.diff(start_date, "d") % days.length;
          const dd = days[diff];
          // const day_text = start_date.add(dd.idx, "d").format("YYYY-MM-DD");k
          // console.log(start_date.format("YYYY-MM-DD"), weekday_text, diff, days);
          // workout_plans_in_day[day_text] = workout_plans_in_day[day_text] || [];
          if (dd && dd.workout_plans.length) {
            for (let a = 0; a < dd.workout_plans.length; a += 1) {
              const pp = dd.workout_plans[a];
              workout_plans_in_day[weekday_text].push({
                type: WorkoutScheduleDayType.Workout,
                // day_text,
                workout_plan: {
                  id: pp.id,
                  title: pp.title,
                  overview: "",
                  tags: "",
                },
              });
            }
            return;
          }
          workout_plans_in_day[weekday_text].push({
            type: WorkoutScheduleDayType.Resting,
            // day_text: dayjs(day).set("day", j).format("YYYY-MM-DD"),
            workout_plan: { id: 0, title: "", overview: "", tags: "" },
          });
        })();
      }
    }
    if (type === WorkoutScheduleType.Weekly) {
      for (let j = 1; j < 8; j += 1) {
        const weekday = monday.set("day", j);
        const weekday_text = weekday.format("YYYY-MM-DD");
        workout_plans_in_day[weekday_text] = workout_plans_in_day[weekday_text] || [];
        (() => {
          // console.log("weekday.isBefore(start_date)", weekday_text, start_date.format("YYYY-MM-DD"));
          if (weekday.isBefore(start_date.startOf("date"))) {
            workout_plans_in_day[weekday_text].push({
              type: WorkoutScheduleDayType.Empty,
              // day_text: dayjs(day).set("day", j).format("YYYY-MM-DD"),
              workout_plan: { id: 0, title: "", overview: "", tags: "" },
            });
            return;
          }
          const dd = days.find((v) => v.weekday === j);
          if (dd) {
            for (let a = 0; a < dd.workout_plans.length; a += 1) {
              const pp = dd.workout_plans[a];
              workout_plans_in_day[weekday_text].push({
                type: WorkoutScheduleDayType.Workout,
                // day_text,
                workout_plan: {
                  id: pp.id,
                  title: pp.title,
                  overview: "",
                  tags: "",
                },
              });
            }
          } else {
            workout_plans_in_day[weekday_text].push({
              type: WorkoutScheduleDayType.Resting,
              // day_text: dayjs(day).set("day", j).format("YYYY-MM-DD"),
              workout_plan: { id: 0, title: "", overview: "", tags: "" },
            });
          }
        })();
      }
    }
    if (type === WorkoutScheduleType.Monthly) {
      // for (let j = 1; j < 31; j += 1) {
      //   const dd = days.find((v) => v.day === j);
      //   const day_text = dayjs(day).set("date", j).format("YYYY-MM-DD");
      //   workout_plans_in_day[day_text] = workout_plans_in_day[day_text] || [];
      //   if (dd) {
      //     workout_plans_in_day[day_text].push({
      //       type: WorkoutScheduleDayType.Workout,
      //       // day_text,
      //       workout_plan: {
      //         id: dd.workout_plan.id,
      //         title: dd.workout_plan.title,
      //         overview: dd.workout_plan.overview,
      //         tags: dd.workout_plan.tags,
      //       },
      //     });
      //   } else {
      //     workout_plans_in_day[day_text].push({
      //       type: WorkoutScheduleDayType.Resting,
      //       // day_text: dayjs(day).set("date", j).format("YYYY-MM-DD"),
      //       workout_plan: { id: 0, title: "", overview: "", tags: "" },
      //     });
      //   }
      // }
    }
  }
  // console.log("[BIZ]workout_plan/workout_schedule - schedule", workout_plans_in_day);
  return Object.keys(workout_plans_in_day)
    .map((day_text) => {
      const schedules = workout_plans_in_day[day_text];
      // 这里是处理应用了多个 周期计划 的情况，如果一个在 周一训练，一个在周一休息，就还是算训练日，只有两个都休息，才算休息日
      // let has_workout = true;
      const workout_plans = [];
      let is_all_empty = true;
      for (let i = 0; i < schedules.length; i += 1) {
        const s = schedules[i];
        if (s.type === WorkoutScheduleDayType.Workout) {
          is_all_empty = false;
        }
        if (s.type === WorkoutScheduleDayType.Resting) {
          is_all_empty = false;
        }
        if (s.workout_plan.id) {
          workout_plans.push(s.workout_plan);
        }
      }
      // console.log(day_text, workout_plans);
      // for ()
      // : schedules
      //             .filter((v) => {
      //               return v.type !== WorkoutScheduleDayType.Resting;
      //             })
      //             .map((v) => {
      //               return v.workout_plan;
      //             })
      return {
        [day_text]: {
          type: (() => {
            if (workout_plans.length) {
              return WorkoutScheduleDayType.Workout;
            }
            if (is_all_empty) {
              return WorkoutScheduleDayType.Empty;
            }
            return WorkoutScheduleDayType.Resting;
          })(),
          workout_plans,
        },
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
}
