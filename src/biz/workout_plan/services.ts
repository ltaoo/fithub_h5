import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { SetValueUnit } from "@/biz/set_value_input";
import { TheResponseOfFetchFunction } from "@/domains/request";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import { WorkoutScheduleType, WorkoutPlanSetType, WorkoutScheduleDayType } from "./constants";
import { WorkoutPlanStepBody, WorkoutPlanActionPayload, WorkoutPlanPreviewPayload, WorkoutPlanStepResp } from "./types";
import { map_weekday_text } from "./workout_schedule";

export type WorkoutPlanDetailsJSON250424 = {
  v: "250424";
  steps: WorkoutPlanStepJSON250424[];
};
/** 可以理解成训练计划中的「动作组」 */
export type WorkoutPlanStepJSON250424 = {
  /** 组类型 */
  set_type: WorkoutPlanSetType;
  /** 组动作 */
  actions: {
    action_id: number;
    /** 动作 */
    action: {
      id: number;
      zh_name: string;
    };
    /** 计数 */
    reps: number;
    /** 技术单位 */
    reps_unit: SetValueUnit;
    /** 负重 */
    weight: string;
    /** 动作间歇 */
    rest_duration: number;
  }[];
  /** 组数 */
  set_count: number;
  /** 组间歇 */
  set_rest_duration: number;
  /** 组负重，一般都用不上 */
  set_weight: string;
  /** 组说明 */
  set_note: string;
};
type WorkoutPlanStepContent = {
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  set_weight: string;
  set_note: string;
  actions: {
    action: { id: number; zh_name: string };
    reps: number;
    reps_unit: SetValueUnit;
    weight: string;
    rest_duration: number;
  }[];
};

export function createWorkoutPlan(body: {
  title: string;
  overview: string;
  tags: string;
  level: number;
  details: WorkoutPlanDetailsJSON250424;
  estimated_duration: number;
  points: string;
  suggestions: string;
  muscle_ids: string;
  equipment_ids: string;
}) {
  return request.post<{ id: number }>("/api/workout_plan/create", {
    title: body.title,
    overview: body.overview,
    tags: body.tags,
    level: body.level,
    details: JSON.stringify(body.details),
    estimated_duration: body.estimated_duration,
    points: body.points,
    suggestions: body.suggestions,
    muscle_ids: body.muscle_ids,
    equipment_ids: body.equipment_ids,
  });
}

export function updateWorkoutPlan(body: {
  id: number | string;
  title: string;
  overview: string;
  tags: string;
  level: number;
  steps: WorkoutPlanStepBody[];
  estimated_duration: number;
  points: string;
  suggestions: string;
  muscle_ids: string;
  equipment_ids: string;
}) {
  return request.post<void>("/api/workout_plan/update", {
    ...body,
    id: Number(body.id),
  });
}

export function fetchWorkoutPlanProfile(body: { id: number | string }) {
  return request.post<{
    id: number | string;
    title: string;
    overview: string;
    tags: string;
    level: number;
    steps: WorkoutPlanStepResp[];
    details: string;
    estimated_duration: number;
    points: string;
    suggestions: string;
    muscle_ids: string;
    equipment_ids: string;
  }>("/api/workout_plan/profile", { id: Number(body.id) });
}

export function parseWorkoutPlanStepsString(details: string) {
  const r = parseJSONStr<WorkoutPlanDetailsJSON250424>(details);
  if (r.error) {
    return [];
  }
  const data = r.data.steps;
  const result: WorkoutPlanStepContent[] = [];
  const steps = data;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    result.push({
      idx: i,
      set_type: step.set_type as WorkoutPlanSetType,
      set_count: Number(step.set_count),
      set_rest_duration: Number(step.set_rest_duration),
      set_weight: step.set_weight,
      set_note: step.set_note,
      actions: step.actions.map((act) => {
        return {
          action: act.action,
          reps: act.reps,
          reps_unit: act.reps_unit,
          weight: act.weight,
          rest_duration: act.rest_duration,
        };
      }),
    });
  }
  return result;
}
export function fetchWorkoutPlanProfileProcess(r: TmpRequestResp<typeof fetchWorkoutPlanProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const plan = r.data;
  try {
    const steps = parseWorkoutPlanStepsString(plan.details);
    return Result.Ok({
      id: plan.id,
      title: plan.title,
      overview: plan.overview,
      tags: plan.tags.split(",").filter(Boolean),
      level: plan.level,
      steps,
      estimated_duration: plan.estimated_duration,
      estimated_duration_text: seconds_to_hour_with_template(plan.estimated_duration, seconds_to_hour_template1),
      points: (() => {
        const r = parseJSONStr<string[]>(plan.points);
        if (r.error) {
          return [];
        }
        return r.data;
      })(),
      suggestions: (() => {
        const r = parseJSONStr<string[]>(plan.suggestions);
        if (r.error) {
          return [];
        }
        return r.data;
      })(),
      action_ids: (() => {
        const ids: number[] = [];
        for (let a = 0; a < steps.length; a += 1) {
          const step = steps[a];
          for (let b = 0; b < step.actions.length; b += 1) {
            const act = step.actions[b];
            if (!ids.includes(act.action.id)) {
              ids.push(act.action.id);
            }
          }
        }
        return ids;
      })(),
      muscle_ids: plan.muscle_ids.split(",").map((v) => Number(v)),
      equipment_ids: plan.equipment_ids.split(",").map((v) => Number(v)),
    });
  } catch (err) {
    const e = err as Error;
    return Result.Err(e.stack ?? e.message);
  }
}

export function fetchWorkoutPlanList(params: Partial<FetchParams> & { keyword?: string }) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      title: string;
      overview: string;
      tags: string;
      level: number;
      estimated_duration: number;
      details: string;
      points: string;
      suggestions: string;
      muscle_ids: string;
      equipment_ids: string;
    }>
  >("/api/workout_plan/list", {
    page: params.page,
    page_size: params.pageSize,
    keyword: params.keyword,
  });
}
export function fetchWorkoutPlanListProcess(r: TmpRequestResp<typeof fetchWorkoutPlanList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    list: r.data.list.map((plan) => {
      return {
        id: plan.id,
        title: plan.title,
        overview: plan.overview,
        tags: plan.tags.split(",").filter(Boolean),
        level: plan.level,
        estimated_duration: plan.estimated_duration,
        estimated_duration_text: seconds_to_hour_with_template(plan.estimated_duration, seconds_to_hour_template1),
        details: (() => {
          const r = parseJSONStr<WorkoutPlanPreviewPayload>(plan.details);
          if (r.error) {
            return null;
          }
          return r.data;
        })(),
      };
    }),
    total: r.data.total,
    has_more: r.data.has_more,
  });
}

export function fetchMyWorkoutPlanList(params: Partial<FetchParams> & { title: string }) {
  return request.post<
    ListResponseWithCursor<{
      id: number | string;
      title: string;
      overview: string;
      tags: string;
      level: number;
      estimated_duration: number;
      details: string;
      points: string;
      suggestions: string;
      muscle_ids: string;
      equipment_ids: string;
    }>
  >("/api/workout_plan/mine", {
    page: params.page,
    page_size: params.pageSize,
  });
}
export function fetchMyWorkoutPlanListProcess(r: TmpRequestResp<typeof fetchMyWorkoutPlanList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    list: r.data.list.map((plan) => {
      return {
        id: plan.id,
        title: plan.title,
        overview: plan.overview,
        tags: plan.tags.split(",").filter(Boolean),
        level: plan.level,
        estimated_duration: plan.estimated_duration,
        details: (() => {
          const r = parseJSONStr<WorkoutPlanPreviewPayload>(plan.details);
          if (r.error) {
            return null;
          }
          return r.data;
        })(),
      };
    }),
    total: r.data.total,
    has_more: r.data.has_more,
  });
}

/**
 * 创建周期训练计划
 * @param body
 * @returns
 */
export function createWorkoutSchedule(body: {
  title: string;
  overview: string;
  tags: string;
  level: number;
  type: WorkoutScheduleType;
  // 安排
  workout_plans: {
    weekday: number;
    day: number;
    workout_plan_id: number;
  }[];
}) {
  return request.post<{ id: number }>("/api/workout_schedule/create", body);
}

export function updateWorkoutSchedule(body: {
  id: number;
  title: string;
  overview: string;
  tags: string;
  level: number;
  type: WorkoutScheduleType;
  workout_plans: {
    id: number;
    weekday: number;
    day: number;
    workout_plan_id: number;
  }[];
}) {
  return request.post<{ id: number }>("/api/workout_schedule/update", body);
}

export function fetchWorkoutScheduleProfile(body: { id: number | string }) {
  return request.post<{
    id: number;
    title: string;
    overview: string;
    // tags: string;
    level: number;
    type: WorkoutScheduleType;
    schedules: {
      weekday: number;
      day: number;
      workout_plan: {
        title: string;
        estimated_duration: number;
      };
    }[];
    /** 是否应用 */
    applied: number;
    applied_in_interval: number;
  }>("/api/workout_schedule/profile", {
    id: Number(body.id),
  });
}
export function fetchWorkoutScheduleProfileProcess(r: TmpRequestResp<typeof fetchWorkoutScheduleProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const profile = r.data;
  return Result.Ok({
    id: profile.id,
    title: profile.title,
    overview: profile.overview,
    // tags: profile.tags,
    level: profile.level,
    type: profile.type,
    applied: profile.applied === 1,
    applied_in_interval: profile.applied_in_interval === 1,
    schedules: (() => {
      if (profile.type === WorkoutScheduleType.Weekly) {
        return [1, 2, 3, 4, 5, 6, 7].map((v) => {
          const has_plan = profile.schedules.find((p) => p.weekday === v);
          if (has_plan) {
            return {
              type: WorkoutScheduleDayType.Workout,
              day: v,
              day_text: map_weekday_text(v),
              title: has_plan.workout_plan.title,
              estimated_duration_text: seconds_to_hour_with_template(
                has_plan.workout_plan.estimated_duration,
                seconds_to_hour_template1
              ),
            };
          }
          return {
            type: WorkoutScheduleDayType.Resting,
            day: v,
            day_text: map_weekday_text(v),
            title: "",
            estimated_duration_text: "",
          };
        });
      }

      return [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      ].map((v) => {
        const has_plan = profile.schedules.find((p) => p.day === v);
        if (has_plan) {
          return {
            type: WorkoutScheduleDayType.Workout,
            day: v,
            day_text: `${v}号`,
            // workout_plan: has_plan.workout_plan,
            title: has_plan.workout_plan.title,
            estimated_duration_text: seconds_to_hour_with_template(
              has_plan.workout_plan.estimated_duration,
              seconds_to_hour_template1
            ),
          };
        }
        return {
          type: WorkoutScheduleDayType.Resting,
          day: v,
          day_text: `${v}号`,
          title: "",
          estimated_duration_text: "",
        };
      });
    })(),
  });
}

export function applyWorkoutSchedule(body: { id: number }) {
  return request.post<void>("/api/workout_schedule/apply", body);
}
export function cancelWorkoutSchedule(body: { id: number }) {
  return request.post<void>("/api/workout_schedule/cancel", body);
}

export function fetchWorkoutScheduleList(body: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      overview: string;
      level: number;
      type: WorkoutScheduleType;
      workout_plans: {
        day: number;
        weekday: number;
        workout_plan_id: number;
      }[];
    }>
  >("/api/workout_schedule/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}
export function fetchWorkoutScheduleListProcess(r: TmpRequestResp<typeof fetchWorkoutScheduleList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    ...resp,
    list: resp.list.map((v) => {
      return {
        id: v.id,
        title: v.title,
        overview: v.overview,
        level: v.level,
        type: v.type,
        type_text: (() => {
          if (v.type === WorkoutScheduleType.Weekly) {
            return "周计划";
          }
          return "月计划";
        })(),
        schedules: (() => {
          return [];
        })(),
        schedule_text: (() => {
          return "";
        })(),
      };
    }),
  });
}

export function fetchMyWorkoutScheduleList() {
  return request.post<{
    list: {
      level: number;
      overview: string;
      schedules: {
        day: number;
        tags: string;
        title: string;
        weekday: number;
        workout_plan_id: number;
      }[];
      status: number;
      title: string;
      type: number;
      workout_schedule_id: number;
    }[];
  }>("/api/workout_schedule/enabled", {});
}

export function fetchWorkoutPlanSetList() {
  return request.post<{
    list: {
      id: number;
      title: string;
      overview: string;
      idx: number;
      details: string;
    }[];
  }>("/api/workout_plan_set/list", {});
}

export function fetchWorkoutPlanSetListProcess(r: TmpRequestResp<typeof fetchWorkoutPlanSetList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const { list } = r.data;
  return Result.Ok({
    list: list.map((v) => {
      return {
        id: v.id,
        title: v.title,
        overview: v.overview,
        idx: v.idx,
        ...(() => {
          const d = parseJSONStr<{ id: number; type: string; title: string; overview: string; tags: string[] }[]>(
            v.details
          );
          if (d.error) {
            return {
              list: [],
            };
          }
          return {
            list: d.data.map((vv) => {
              return {
                id: vv.id,
                type: vv.type,
                type_text: (() => {
                  if (vv.type === "workout_plan") {
                    return "训练计划";
                  }
                  return "周期计划";
                })(),
                title: vv.title,
                overview: vv.overview,
                tags: vv.tags,
              };
            }),
          };
        })(),
      };
    }),
  });
}
