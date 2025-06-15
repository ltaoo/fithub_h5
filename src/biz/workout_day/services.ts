import dayjs, { Dayjs } from "dayjs";

import { request } from "@/biz/requests";
import { WorkoutPlanActionPayload, WorkoutPlanStepJSON250607 } from "@/biz/workout_plan/types";
import { WorkoutPlanStepType, WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { ListResponseWithCursor } from "@/biz/requests/types";
import {
  parseWorkoutPlanStepsString,
  WorkoutPlanDetailsJSON250424,
  WorkoutPlanStepJSON250424,
} from "@/biz/workout_plan/services";
import { getSetValueUnit, SetValueUnit } from "@/biz/set_value_input";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import {
  parseJSONStr,
  seconds_to_hour_minute_seconds,
  seconds_to_hour_template1,
  seconds_to_hour_with_template,
  seconds_to_minutes,
} from "@/utils";

import { WorkoutDayStatus } from "./constants";
import { FetchParams } from "@/domains/list/typing";

/**
 * 创建训练日
 * @param body
 * @returns
 */
export function createWorkoutDay(body: {
  workout_plan_id?: number;
  student_ids: number[];
  start_when_create: boolean;
}) {
  return request.post<{ ids: number[] }>("/api/workout_day/create", {
    workout_plan_id: body.workout_plan_id,
    student_ids: body.student_ids,
    start_when_create: body.start_when_create,
  });
}

export function checkHasStartedWorkoutDay() {
  return request.post<{
    list: {
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      student_id: number;
      coach_id: number;
    }[];
  }>("/api/workout_day/has_started", {});
}

export function fetchStartedWorkoutDayList() {
  return request.post<{
    list: {
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      coach_id: number;
      student: {
        id: number;
        nickname: string;
        avatar_url: string;
      };
      workout_plan: {
        id: number;
        title: string;
        overview: string;
      };
    }[];
  }>("/api/workout_day/started_list", {});
}
export function fetchStartedWorkoutDayListProcess(r: TmpRequestResp<typeof fetchStartedWorkoutDayList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const groups: Record<
    number,
    {
      id: number;
      status: WorkoutDayStatus;
      idx: number;
      started_at_text: string;
      students: {
        id: number;
        nickname: string;
        avatar_url: string;
        is_self: boolean;
        /** 这个字段似乎没啥用 */
        workout_day_id: number;
      }[];
      workout_plan: { id: number; title: string };
    }
  > = {};
  for (let i = 0; i < r.data.list.length; i += 1) {
    const v = r.data.list[i];
    const started_at = dayjs(v.started_at);
    const group_no = started_at.unix().valueOf();
    groups[group_no] = groups[group_no] || {
      id: v.id,
      idx: started_at.unix(),
      status: v.status,
      started_at_text: started_at.format("HH:mm"),
      students: [],
      workout_plan: v.workout_plan,
    };
    groups[group_no].students.push({
      id: v.student.id,
      nickname: v.student.nickname,
      avatar_url: v.student.avatar_url,
      is_self: v.student.id === v.coach_id,
      workout_day_id: v.id,
    });
  }
  return Result.Ok({
    list: Object.values(groups).sort((a, b) => b.idx - a.idx),
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
    day_number: number;
    student_id: number;
    // steps: WorkoutPlanStepResp[];
    workout_plan: { title: string; overview: string; tags: string; details: string };
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
  const pending_steps = ((): Omit<WorkoutDayStepProgressJSON250531, "v"> => {
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
  })();
  let total_weight = 0;
  let total_set_count = pending_steps.sets.length;
  for (let i = 0; i < pending_steps.sets.length; i += 1) {
    const { actions } = pending_steps.sets[i];
    for (let j = 0; j < actions.length; j += 1) {
      const { weight, weight_unit, reps, reps_unit } = actions[j];
      let real_weight = weight;
      if (weight_unit === getSetValueUnit("磅")) {
        real_weight = Number((real_weight * 0.45).toFixed(1));
      }
      if (reps_unit === getSetValueUnit("次")) {
        real_weight = real_weight * reps;
      }
      total_weight += real_weight;
    }
  }
  // const seconds = dayjs(workout_day.started_at).valueOf() / 1000 - dayjs(workout_day.finished_at).valueOf() / 1000;
  const seconds =
    workout_day.status === WorkoutDayStatus.Finished
      ? dayjs(workout_day.finished_at).diff(dayjs(workout_day.started_at), "seconds")
      : 0;
  console.log(seconds, dayjs(workout_day.finished_at).format("HH:mm"), dayjs(workout_day.started_at).format("HH:mm"));
  return Result.Ok({
    id: workout_day.id,
    title: workout_day.workout_plan.title,
    overview: workout_day.workout_plan.overview,
    tags: workout_day.workout_plan.tags.split(",").filter(Boolean),
    status: workout_day.status,
    started_at: dayjs(workout_day.started_at),
    started_at_text: dayjs(workout_day.started_at).format("MM-DD HH:mm"),
    finished: workout_day.status === WorkoutDayStatus.Finished ? dayjs(workout_day.finished_at) : dayjs(),
    finished_at_text:
      workout_day.status === WorkoutDayStatus.Finished ? dayjs(workout_day.finished_at).format("MM-DD HH:mm") : "",
    total_weight,
    total_set_count,
    duration_text: seconds_to_hour_with_template(seconds, seconds_to_hour_template1),
    // ...(() => {
    //   if (workout_day.status !== WorkoutDayStatus.Finished) {
    //     return { hours: 0, minutes: 0, seconds: 0 };
    //   }
    //   return seconds_to_hour_minute_seconds(seconds);
    // })(),
    minutes: seconds_to_minutes(seconds),
    pending_steps,
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
    student_id: workout_day.student_id,
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
export function fetchWorkoutDayList(body: Partial<FetchParams> & { status: WorkoutDayStatus }) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
      workout_plan: {
        id: number;
        title: string;
      };
    }>
  >("/api/workout_day/list", {
    page_size: body.pageSize,
    page: body.page,
    status: body.status,
  });
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
        started_at_text: v.started_at ? dayjs(v.started_at).format("MM-DD HH:mm") : "",
        finished_at_text: v.finished_at ? dayjs(v.finished_at).format("MM-DD HH:mm") : "",
        day: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : "",
        workout_plan: v.workout_plan,
      };
    }),
  });
}

export function fetchFinishedWorkoutDayList(body: { finished_at_start: string; finished_at_end: string }) {
  return request.post<{
    list: {
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
    }[];
  }>("/api/workout_day/finished_list", {
    finished_at_start: dayjs(body.finished_at_start).startOf("date").toDate(),
    finished_at_end: dayjs(body.finished_at_end).endOf("date").toDate(),
  });
}

export function fetchFinishedWorkoutDayListProcess(r: TmpRequestResp<typeof fetchFinishedWorkoutDayList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    list: data.list.map((v) => {
      return {
        id: v.id,
        status: v.status,
        started_at_text: v.started_at ? dayjs(v.started_at).format("MM-DD HH:mm") : null,
        finished_at_text: v.finished_at ? dayjs(v.finished_at).format("MM-DD HH:mm") : null,
        day: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : null,
        date_text: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : null,
      };
    }),
  });
}

/** 已完成、已放弃 的训练日状态变回进行中 */
export function continueWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/continue", { id: body.id });
}
