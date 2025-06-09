import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";

import {
  applyWorkoutSchedule,
  cancelWorkoutSchedule,
  fetchWorkoutScheduleProfile,
  fetchWorkoutScheduleProfileProcess,
} from "./services";
import { WorkoutScheduleDayType, WorkoutScheduleType } from "./constants";
import { CalendarCore } from "@/domains/ui/calendar";
import dayjs from "dayjs";

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
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    fetch(arg: { id: number }) {
      return request.workout_schedule.profile.run(arg);
    },
  };

  let _state = {
    get loading() {
      return request.workout_schedule.profile.loading;
    },
    get profile() {
      return request.workout_schedule.profile.response;
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
    days: {
      day: number;
      weekday: number;
      workout_plan: { id: number; title: string; overview: string; tags: string };
    }[];
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
    const { type, days } = schedules[i];
    if (type === WorkoutScheduleType.Weekly) {
      for (let j = 1; j < 8; j += 1) {
        const dd = days.find((v) => v.weekday === j);
        const day_text = dayjs(day).set("day", j).format("YYYY-MM-DD");
        workout_plans_in_day[day_text] = workout_plans_in_day[day_text] || [];
        if (dd) {
          workout_plans_in_day[day_text].push({
            type: WorkoutScheduleDayType.Workout,
            // day_text,
            workout_plan: {
              id: dd.workout_plan.id,
              title: dd.workout_plan.title,
              overview: dd.workout_plan.overview,
              tags: dd.workout_plan.tags,
            },
          });
        } else {
          workout_plans_in_day[day_text].push({
            type: WorkoutScheduleDayType.Resting,
            // day_text: dayjs(day).set("day", j).format("YYYY-MM-DD"),
            workout_plan: { id: 0, title: "", overview: "", tags: "" },
          });
        }
      }
    }
    if (type === WorkoutScheduleType.Monthly) {
      for (let j = 1; j < 31; j += 1) {
        const dd = days.find((v) => v.day === j);
        const day_text = dayjs(day).set("date", j).format("YYYY-MM-DD");
        workout_plans_in_day[day_text] = workout_plans_in_day[day_text] || [];
        if (dd) {
          workout_plans_in_day[day_text].push({
            type: WorkoutScheduleDayType.Workout,
            // day_text,
            workout_plan: {
              id: dd.workout_plan.id,
              title: dd.workout_plan.title,
              overview: dd.workout_plan.overview,
              tags: dd.workout_plan.tags,
            },
          });
        } else {
          workout_plans_in_day[day_text].push({
            type: WorkoutScheduleDayType.Resting,
            // day_text: dayjs(day).set("date", j).format("YYYY-MM-DD"),
            workout_plan: { id: 0, title: "", overview: "", tags: "" },
          });
        }
      }
    }
  }
  return Object.keys(workout_plans_in_day)
    .map((day_text) => {
      const schedules = workout_plans_in_day[day_text];

      let is_all_resting = true;
      for (let i = 0; i < schedules.length; i += 1) {
        const s = schedules[i];
        if (s.type === WorkoutScheduleDayType.Workout) {
          is_all_resting = false;
        }
      }

      return {
        [day_text]: {
          type: is_all_resting ? WorkoutScheduleDayType.Resting : WorkoutScheduleDayType.Workout,
          workout_plans: schedules
            .filter((v) => {
              return v.type !== WorkoutScheduleDayType.Resting;
            })
            .map((v) => {
              return v.workout_plan;
            }),
        },
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
}
