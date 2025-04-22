import dayjs from "dayjs";

import { request } from "@/biz/requests";
import { WorkoutPlanActionPayload, WorkoutPlanStepResp } from "@/biz/workout_plan/types";
import { WorkoutPlanStepType, WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { parseJSONStr } from "@/utils";
import { SetValueUnit } from "@/biz/set_value_input";

import { WorkoutDayStatus } from "./constants";

/**
 * 创建训练日
 * @param body
 * @returns
 */
export function createWorkoutDay(body: { workout_plan_id?: number; start_when_create: boolean }) {
  return request.post<{ id: number }>("/api/workout_day/create", body);
}

export type WorkoutDayUpdateBody = {
  id: number | string;
  step_idx: number;
  set_idx: number;
  data: {
    step_idx: number;
    set_idx: number;
    act_idx: number;
    action_id: number | string;
    /** 计数数量 */
    reps: number;
    /** 计数单位 */
    reps_unit: string;
    /** 重量数值 */
    weight: number;
    /** 重量单位 */
    weight_unit: string;
    /** 是否完成 */
    completed: boolean;
    /** 完成时间 */
    completed_at: number;
    /** 休息时间没用完 */
    remaining_time: number;
    /** 休息时间超出多少 */
    exceed_time: number;
    /** 备注 */
    remark?: string;
  }[];
};
/**
 * 更新训练日内容
 * @param body
 * @returns
 */
export function updateWorkoutDay(body: WorkoutDayUpdateBody) {
  return request.post("/api/workout_day/update_steps", {
    id: Number(body.id),
    data: JSON.stringify({
      step_idx: body.step_idx,
      set_idx: body.set_idx,
      data: body.data,
    }),
  });
}

/**
 * 完成训练日计划
 * @param body
 * @returns
 */
export function completeWorkoutDay(body: { id: string }) {
  return request.post("/api/workout_day/finish", {
    id: Number(body.id),
    // data: JSON.stringify({
    //   step_idx: body.step_idx,
    //   set_idx: body.set_idx,
    //   data: body.data,
    // }),
  });
}

/**
 * 放弃训练日计划
 * @param body
 * @returns
 */
export function giveUpHWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/give_up", body);
}

/**
 * 删除训练日
 * @param body
 * @returns
 */
export function deleteWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/delete", body);
}

/**
 * 获取训练日详情
 * @param body
 * @returns
 */
export function fetchWorkoutDayProfile(body: { id: number }) {
  return request.post<{
    id: number;
    status: WorkoutDayStatus;
    started_at: number;
    finished_at: number;
    pending_steps: string;
    steps: WorkoutPlanStepResp[];
  }>("/api/workout_day/profile", body);
}

export function fetchWorkoutDayProfileProcess(r: TmpRequestResp<typeof fetchWorkoutDayProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const workout_day = r.data;
  return Result.Ok({
    id: workout_day.id,
    status: workout_day.status,
    started_at: dayjs(workout_day.started_at),
    pending_steps: (() => {
      const r = parseJSONStr<{
        step_idx: number;
        set_idx: number;
        data: {
          step_idx: number;
          set_idx: number;
          act_idx: number;
          action_id: number;
          reps: number;
          reps_unit: SetValueUnit;
          weight: number;
          weight_unit: SetValueUnit;
          completed: boolean;
          completed_at: number;
          remark: string;
          remaining_time: number;
          exceed_time: number;
        }[];
      }>(workout_day.pending_steps);
      if (r.error) {
        return {
          step_idx: 0,
          set_idx: 0,
          data: [],
        };
      }
      return {
        step_idx: r.data.step_idx,
        set_idx: r.data.set_idx,
        data: r.data.data || [],
      };
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
      const steps = workout_day.steps;
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
        if (step.set_type === WorkoutPlanSetType.Super) {
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
                reps_unit: action.unit,
                rest_interval: action.rest_duration,
                note: action.note,
              };
            }),
            sets3: [],
            step_note: step.note,
          });
        }
      }
      return Object.values(result);
    })(),
  });
}

/**
 * 获取训练日当前进度
 * @param body
 * @returns
 */
export function fetchWorkoutDayCurStep(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
  }>("/api/workout_day/cur_step", body);
}

/**
 * 获取训练日列表
 * @param body
 * @returns
 */
export function fetchWorkoutDayList(body: { page: number; page_size: number }) {
  return request.post("/api/workout_day/list", body);
}
