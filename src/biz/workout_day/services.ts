import dayjs from "dayjs";

import { request } from "@/biz/requests";
import { WorkoutPlanActionPayload, WorkoutPlanStepResp } from "@/biz/workout_plan/types";
import { WorkoutPlanStepType, WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { ListResponseWithCursor } from "@/biz/requests/types";
import {
  parseWorkoutPlanStepsString,
  WorkoutPlanDetailsJSON250424,
  WorkoutPlanStepJSON250424,
} from "@/biz/workout_plan/services";
import { SetValueUnit } from "@/biz/set_value_input";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { parseJSONStr, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import { WorkoutDayStatus } from "./constants";

/**
 * 创建训练日
 * @param body
 * @returns
 */
export function createWorkoutDay(body: { workout_plan_id?: number; start_when_create: boolean }) {
  return request.post<{ id: number }>("/api/workout_day/create", body);
}

export function fetchStartedWorkoutDayList() {
  return request.post<{
    list: {
      id: number;
      started_at: string;
    }[];
  }>("/api/workout_day/fetch_started", {});
}
export function fetchStartedWorkoutDayListProcess(r: TmpRequestResp<typeof fetchStartedWorkoutDayList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    list: r.data.list.map((v) => {
      return {
        id: v.id,
        started_at: dayjs(v.started_at).format("HH:mm"),
      };
    }),
  });
}

export type WorkoutDayStepProgressJSON250424 = {
  v: "250424";
  /** 当前做到第几个动作了 */
  step_idx: number;
  /** 当前做到动作的第几组了 */
  set_idx: number;
  /** 当前做到动作的组中第几个动作了 */
  act_idx: number;
  touched_set_idx: string[];
  /** 动作/组  */
  sets: {
    step_idx: number;
    idx: number;
    actions: {
      idx: number;
      /** 动作id，用于后面记录该记录动作执行历史，获取最大重量、最大次数等统计参考数据 */
      action_id: number | string;
      /** 计数数量 */
      reps: number;
      /** 计数单位 */
      reps_unit: SetValueUnit;
      /** 重量数值 */
      weight: number;
      /** 重量单位 */
      weight_unit: SetValueUnit;
      /** 是否完成 */
      completed: boolean;
      /** 完成时间 */
      completed_at: number;
      /** 如果该动作是计时，还剩多久 */
      time1: number;
      /** 如果该动作是计时，休息时间还剩多久 */
      time2: number;
      /** 如果该动作是计时，休息已过去多久 */
      time3: number;
    }[];
    /** 休息时间还剩多久 */
    remaining_time: number;
    /** 休息时间已过去多久 */
    exceed_time: number;
    /** 备注 */
    remark: string;
  }[];
};

export type WorkoutDayStepProgressJSON250531 = {
  v: "250531";
  /** 当前做到第几个动作了 */
  step_idx: number;
  /** 当前做到动作的第几组了 */
  set_idx: number;
  /** 当前做到动作的组中第几个动作了 */
  act_idx: number;
  /** 作用暂定吧 */
  touched_set_idx: string[];
  /** 动作/组  */
  sets: {
    step_idx: number;
    idx: number;
    actions: {
      idx: number;
      /** 动作id，用于后面记录该记录动作执行历史，获取最大重量、最大次数等统计参考数据 */
      action_id: number | string;
      /** 计数数量 */
      reps: number;
      /** 计数单位 */
      reps_unit: SetValueUnit;
      /** 重量数值 */
      weight: number;
      /** 重量单位 */
      weight_unit: SetValueUnit;
      /** 是否完成 */
      completed: boolean;
      /** 完成时间 */
      completed_at: number;
      /** 如果该动作是计时，还剩多久 */
      time1: number;
      /** 如果该动作是计时，休息时间还剩多久 */
      time2: number;
      /** 如果该动作是计时，休息已过去多久 */
      time3: number;
    }[];
    /** 休息时间还剩多久 */
    remaining_time: number;
    /** 休息时间已过去多久 */
    exceed_time: number;
    /** 组是否完成 */
    completed: boolean;
    /** 备注 */
    remark: string;
  }[];
};

/**
 * 更新训练日执行内容
 * @param body
 * @returns
 */
export function updateWorkoutDayStepContent(body: { id: number | string; content: WorkoutDayStepProgressJSON250531 }) {
  console.log("[SERVICE]workout_day - updateWorkoutDayStepContent", body.content);
  return request.post("/api/workout_day/update_steps", {
    id: Number(body.id),
    data: JSON.stringify(body.content),
  });
}

/** 用于动作执行的具体内容 */
export type WorkoutDayStepDetailsJSON250424 = {
  v: "250424";
  steps: {
    idx: number;
    sets: {
      idx: number;
      type: WorkoutPlanSetType;
      actions: {
        id: number;
        zh_name: string;
        reps: number;
        reps_unit: SetValueUnit;
        weight: string;
        rest_duration: number;
      }[];
      rest_duration: number;
      weight: string;
    }[];
    note: string;
  }[];
};

/**
 * 更新训练日计划内容
 * @param body
 * @returns
 */
export function updateWorkoutDayPlanDetails(body: { id: string; content: WorkoutDayStepDetailsJSON250424 }) {
  return request.post("/api/workout_day/update_details", {
    id: Number(body.id),
    data: body.content.steps.length === 0 ? "" : JSON.stringify(body.content),
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
    updated_details: string;
    // steps: WorkoutPlanStepResp[];
    workout_plan: { details: string };
  }>("/api/workout_day/profile", body);
}
function parseWorkoutDayDetailsString(details: string) {
  const r = parseJSONStr<WorkoutDayStepDetailsJSON250424>(details);
  if (r.error) {
    return [];
  }
  const data = r.data.steps;
  const result: WorkoutDayStepDetailsJSON250424["steps"] = [];
  const steps = data;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    result.push({
      idx: i,
      sets: step.sets.map((set, idx) => {
        return {
          idx,
          type: set.type as WorkoutPlanSetType,
          rest_duration: set.rest_duration,
          weight: set.weight,
          actions: set.actions.map((act, idx) => {
            return {
              idx,
              id: act.id,
              zh_name: act.zh_name,
              reps: act.reps,
              reps_unit: act.reps_unit,
              weight: act.weight,
              rest_duration: act.rest_duration,
              note: "",
            };
          }),
        };
      }),
      note: step.note,
    });
  }
  return result;
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
    started_at_text: dayjs(workout_day.started_at).format("MM-DD HH:mm"),
    duration_text: (() => {
      if (workout_day.status !== WorkoutDayStatus.Finished) {
        return null;
      }
      const seconds = dayjs(workout_day.started_at).valueOf() / 1000 - dayjs(workout_day.finished_at).valueOf() / 1000;
      return seconds_to_hour_with_template(seconds, seconds_to_hour_template1);
    })(),
    pending_steps: ((): Omit<WorkoutDayStepProgressJSON250531, "v"> => {
      const r = parseJSONStr<WorkoutDayStepProgressJSON250424 | WorkoutDayStepProgressJSON250531>(
        workout_day.pending_steps
      );
      if (r.error) {
        return {
          step_idx: 0,
          set_idx: 0,
          act_idx: 0,
          touched_set_idx: [],
          sets: [],
        };
      }
      if (r.data.v === "250424") {
        const d = r.data as WorkoutDayStepProgressJSON250424;
        return {
          step_idx: r.data.step_idx,
          set_idx: r.data.set_idx,
          act_idx: r.data.act_idx,
          touched_set_idx: r.data.touched_set_idx,
          sets:
            r.data.sets.map((set) => {
              return {
                ...set,
                completed: false,
              };
            }) || [],
        };
      }
      return {
        step_idx: r.data.step_idx,
        set_idx: r.data.set_idx,
        act_idx: r.data.act_idx,
        touched_set_idx: r.data.touched_set_idx,
        sets: r.data.sets || [],
      };
    })(),
    steps: (() => {
      if (workout_day.updated_details) {
        return parseWorkoutDayDetailsString(workout_day.updated_details);
      }
      const d = parseWorkoutPlanStepsString(workout_day.workout_plan.details);
      const steps = [];
      for (let a = 0; a < d.length; a += 1) {
        const step = d[a];
        const rr = {
          idx: a,
          sets: (() => {
            const sets: WorkoutDayStepDetailsJSON250424["steps"][number]["sets"] = [];
            for (let b = 0; b < step.set_count; b += 1) {
              sets.push({
                idx: b,
                type: step.set_type,
                actions: step.actions.map((act) => {
                  return {
                    id: Number(act.action.id),
                    zh_name: act.action.zh_name,
                    reps: act.reps,
                    reps_unit: act.reps_unit,
                    weight: act.weight,
                    rest_duration: act.rest_duration,
                  };
                }),
                rest_duration: step.set_rest_duration,
                weight: step.set_weight,
              });
              const is_last_set = a === steps.length - 1 && b === step.set_count - 1;
              if (is_last_set) {
                return sets;
              }
            }
            return sets;
          })(),
          note: step.set_note,
        };
        steps.push(rr);
      }
      return steps;
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
  return request.post<
    ListResponseWithCursor<{
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
    }>
  >("/api/workout_day/list", body);
}

export function fetchWorkoutDayListProcess(r: TmpRequestResp<typeof fetchWorkoutDayList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    page_size: data.page_size,
    has_more: data.has_more,
    next_cursor: data.next_marker,
    list: data.list.map((v) => {
      return {
        id: v.id,
        status: v.status,
        started_at_text: v.started_at ? dayjs(v.started_at).format("MM-DD HH:mm") : null,
        finished_at_text: v.finished_at ? dayjs(v.finished_at).format("MM-DD HH:mm") : null,
        day: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : null,
      };
    }),
  });
}
