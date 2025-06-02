import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { SetValueUnit } from "@/biz/set_value_input";
import { TheResponseOfFetchFunction } from "@/domains/request";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import { WorkoutPlanCollectionType, WorkoutPlanSetType } from "./constants";
import { WorkoutPlanStepBody, WorkoutPlanActionPayload, WorkoutPlanPreviewPayload, WorkoutPlanStepResp } from "./types";
import { map_weekday_text } from "./workout_plan_collection";

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
 * 创建训练计划合集
 * @param body
 * @returns
 */
export function createWorkoutPlanCollection(body: {
  title: string;
  overview: string;
  tags: string;
  level: number;
  type: number;
  workout_plans: {
    weekday: number;
    day: number;
    workout_plan_id: number;
  }[];
}) {
  return request.post<{ id: number }>("/api/workout_plan_collection/create", body);
}

export function fetchWorkoutPlanCollectionProfile(body: { id: number | string }) {
  return request.post<{
    title: string;
    overview: string;
    tags: string;
    level: number;
    type: WorkoutPlanCollectionType;
    workout_plans: {
      weekday: number;
      day: number;
      workout_plan: {
        title: string;
        estimated_duration: number;
      };
    }[];
  }>("/api/workout_plan_collection/profile", {
    id: Number(body.id),
  });
}
export function fetchWorkoutPlanCollectionProfileProcess(r: TmpRequestResp<typeof fetchWorkoutPlanCollectionProfile>) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const profile = r.data;
  return Result.Ok({
    title: profile.title,
    overview: profile.overview,
    tags: profile.tags,
    level: profile.level,
    type: profile.type,
    workout_plans: profile.workout_plans.map((plan) => {
      return {
        weekday: plan.weekday,
        weekday_text: map_weekday_text(plan.weekday),
        day: plan.day,
        title: plan.workout_plan.title,
        estimated_duration_text: seconds_to_hour_with_template(
          plan.workout_plan.estimated_duration,
          seconds_to_hour_template1
        ),
      };
    }),
  });
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
    return Result.Err(r.error.message);
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
          const d = parseJSONStr<{ plans: { id: number; title: string; overview: string; tags: string[] }[] }>(
            v.details
          );
          if (d.error) {
            return {
              list: [],
            };
          }
          if (!d.data.plans) {
            return {
              list: [],
            };
          }
          return {
            list: d.data.plans.map((vv) => {
              return {
                id: vv.id,
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
