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
        action_id?: number | string;
        action: { id: number | string; zh_name: string };
        reps: number;
        unit: string;
        weight: string;
        note: string;
        actions: WorkoutPlanActionPayload[];
        sets3: {
          actions: WorkoutPlanActionPayload[];
          set_rest_interval: number;
          note: string;
        }[];
        step_note: string;
      }[] = [];
      const steps = plan.steps;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.set_type === WorkoutPlanSetType.Normal) {
          const act = step.actions[step.actions.length - 1];
          result.push({
            id: step.id,
            title: step.title,
            type: step.type,
            idx: step.idx,
            set_type: step.set_type,
            set_count: step.set_count,
            set_rest_duration: step.set_rest_duration,
            action_id: act.id,
            action: { id: Number(act.action_id), zh_name: act.action.zh_name },
            reps: act.reps,
            unit: act.unit,
            weight: act.weight,
            note: act.note,
            actions: [],
            sets3: [],
            step_note: step.note,
          });
        }
        if (step.set_type === WorkoutPlanSetType.Combo) {
          result.push({
            id: step.id,
            title: step.title,
            type: step.type,
            idx: step.idx,
            set_type: step.set_type,
            set_count: step.set_count,
            set_rest_duration: step.set_rest_duration,
            action_id: step.actions[0].action_id,
            action: { id: Number(step.actions[0].action_id), zh_name: step.actions[0].action.zh_name },
            reps: step.actions[0].reps,
            unit: step.actions[0].unit,
            weight: step.actions[0].weight,
            note: step.actions[0].note,
            actions: step.actions.map((action) => {
              return {
                id: action.id,
                action: { id: Number(action.action_id), zh_name: action.action.zh_name },
                idx: action.idx,
                weight: action.weight,
                reps: action.reps,
                unit: action.unit,
                rest_interval: action.rest_duration,
                note: action.note,
              };
            }),
            sets3: [],
            step_note: step.note,
          });
        }
        if (step.set_type === WorkoutPlanSetType.Free) {
          result.push({
            id: step.id,
            title: step.title,
            type: step.type,
            idx: step.idx,
            set_type: step.set_type,
            set_count: step.set_count,
            set_rest_duration: step.set_rest_duration,
            action: { id: 0, zh_name: "" },
            reps: 12,
            unit: "次",
            weight: "12RM",
            note: "",
            actions: [],
            sets3: (() => {
              const sets: Record<
                number,
                {
                  actions: {
                    id?: number | string;
                    action_id: number | string;
                    action: { id: number | string; zh_name: string };
                    idx: number;
                    set_idx: number;
                    weight: string;
                    reps: number;
                    unit: string;
                    rest_duration: number;
                    note: string;
                  }[];
                }
              > = {};
              for (let i = 0; i < step.actions.length; i += 1) {
                const action = step.actions[i];
                sets[action.set_idx] = sets[action.set_idx] || {
                  actions: [],
                };
                sets[action.set_idx].actions.push({
                  id: action.id,
                  action_id: action.action_id,
                  action: { id: Number(action.action_id), zh_name: action.action.zh_name },
                  idx: action.idx,
                  set_idx: action.set_idx,
                  weight: action.weight,
                  reps: action.reps,
                  unit: action.unit,
                  rest_duration: action.rest_duration,
                  note: action.note,
                });
              }
              return Object.values(sets).map((set) => {
                return {
                  actions: set.actions.map((action) => {
                    return {
                      id: action.id,
                      action: { id: Number(action.action_id), zh_name: action.action.zh_name },
                      idx: action.idx,
                      weight: action.weight,
                      reps: action.reps,
                      unit: action.unit,
                      rest_interval: action.rest_duration,
                      note: action.note,
                    };
                  }),
                  set_rest_interval: 0,
                  note: "",
                };
              });
            })(),
            step_note: step.note,
          });
        }
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
