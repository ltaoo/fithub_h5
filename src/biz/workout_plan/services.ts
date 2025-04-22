import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { TheResponseOfFetchFunction } from "@/domains/request";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr } from "@/utils";

import { WorkoutPlanStepType, WorkoutPlanSetType } from "./constants";
import { WorkoutPlanStepBody, WorkoutPlanActionPayload, WorkoutPlanPreviewPayload, WorkoutPlanStepResp } from "./types";

export function createWorkoutPlan(body: {
  title: string;
  overview: string;
  tags: string;
  level: number;
  details: string;
  steps: WorkoutPlanStepBody[];
  estimated_duration: number;
  points: string;
  suggestions: string;
  muscle_ids: string;
  equipment_ids: string;
}) {
  return request.post<void>("/api/workout_plan/create", body);
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
export function fetchWorkoutPlanProfileProcess(r: TmpRequestResp<typeof fetchWorkoutPlanProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const plan = r.data;
  return Result.Ok({
    id: plan.id,
    title: plan.title,
    overview: plan.overview,
    tags: plan.tags.split(",").filter(Boolean),
    level: plan.level,
    details: (() => {
      const r = parseJSONStr<WorkoutPlanPreviewPayload>(plan.details);
      if (r.error) {
        return null;
      }
      return r.data;
    })(),
    action_ids: (() => {
      const r = plan.steps.flatMap((a) => {
        return a.actions
          .map((b) => {
            return Number(b.action_id);
          })
          .filter((b) => b !== null);
      });
      return r;
    })(),
    steps: (() => {
      const result: {
        id?: number | string;
        title: string;
        type: WorkoutPlanStepType;
        idx: number;
        set_type: WorkoutPlanSetType;
        set_count: number;
        set_rest_duration: number;
        set_weight: string;
        actions: WorkoutPlanActionPayload[];
        step_note: string;
      }[] = [];
      const steps = plan.steps;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        result.push({
          id: step.id,
          title: step.title,
          type: step.type,
          idx: step.idx,
          set_type: step.set_type,
          set_count: step.set_count,
          set_rest_duration: step.set_rest_duration,
          set_weight: step.set_weight,
          actions: step.actions.map((act) => {
            return {
              set_idx: act.set_idx,
              action: act.action,
              idx: act.idx,
              reps: act.reps,
              reps_unit: act.unit,
              weight: act.weight,
              rest_interval: act.rest_duration,
              note: act.note,
            };
          }),
          step_note: step.note,
        });
      }
      return Object.values(result);
    })(),
    estimated_duration: plan.estimated_duration,
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
    muscles: idsMapValue(plan.muscle_ids),
    equipments: idsMapValue(plan.equipment_ids),
  });
}

export function fetchWorkoutPlanList(params: FetchParams) {
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
  >("/api/workout_plan/list", params);
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

export function fetchMyWorkoutPlanList(params: FetchParams) {
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
  >("/api/workout_plan/mine", params);
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
