import dayjs, { Dayjs } from "dayjs";

import { request } from "@/biz/requests";
import {
  WorkoutPlanStepType,
  WorkoutPlanSetType,
  WorkoutSetTypeTextMap,
  WorkoutPlanType,
} from "@/biz/workout_plan/constants";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { parseWeightToNumAndUnit, parseWorkoutPlanStepsString } from "@/biz/workout_plan/services";
import { getSetValueUnit, SetValueUnit } from "@/biz/input_set_value";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import {
  parseJSONStr,
  seconds_to_hour_minute_seconds,
  seconds_to_hour_template1,
  seconds_to_hour_with_template,
  seconds_to_minutes,
  toFixed,
} from "@/utils";

import { WorkoutDayStatus } from "./constants";

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

/**
 * 不使用训练计划，创建训练日
 * @param body
 * @returns
 */
export function createWorkoutDayFree(body: {
  type: WorkoutPlanType;
  title: string;
  pending_steps: WorkoutDayStepProgressJSON250629;
  updated_details: WorkoutDayStepDetailsJSON250629;
  start_at: Date;
  finished_at: Date;
  start_when_create?: boolean;
  finish_when_created?: boolean;
}) {
  return request.post<{ id: number }>("/api/workout_day/create_free", {
    ...body,
    pending_steps: JSON.stringify(body.pending_steps),
    updated_details: JSON.stringify(body.updated_details),
  });
}

/**
 * 编辑训练日
 * @param body
 * @returns
 */
export function updateWorkoutDay(body: {
  id: number;
  type: WorkoutPlanType;
  title: string;
  pending_steps: WorkoutDayStepProgressJSON250629;
  updated_details: WorkoutDayStepDetailsJSON250629;
  start_at: Date;
  finished_at: Date;
}) {
  return request.post<{ id: number }>("/api/workout_day/update", {
    ...body,
    // @todo 想做更精细化的更新，没有改变过的字段就不传。后端已经有该逻辑了
    pending_steps: body.pending_steps ? JSON.stringify(body.pending_steps) : undefined,
    updated_details: body.updated_details ? JSON.stringify(body.updated_details) : undefined,
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
      title: string;
      type: WorkoutPlanType;
      status: WorkoutDayStatus;
      started_at: string;
      coach_id: number;
      student: {
        id: number;
        nickname: string;
        avatar_url: string;
      };
      workout_plan: null | {
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
      title: string;
      type: WorkoutPlanType;
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
      workout_plan: null | { id: number; title: string };
    }
  > = {};
  for (let i = 0; i < r.data.list.length; i += 1) {
    const v = r.data.list[i];
    const started_at = dayjs(v.started_at);
    const group_no = started_at.unix().valueOf();
    groups[group_no] = groups[group_no] || {
      id: v.id,
      title: v.title ?? v.workout_plan?.title ?? "",
      type: v.type,
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
  /** 更新数据时，避免将没有填写的组默认输入 0 提交上去了 */
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

export type WorkoutDayStepProgressJSON250616 = {
  v: "250616";
  /** 当前做到第几个动作了 */
  step_idx: number;
  /** 当前做到动作的第几组了 */
  set_idx: number;
  /** 当前做到动作的组中第几个动作了 */
  act_idx: number;
  /** 更新数据时，避免将没有填写的组默认输入 0 提交上去了 */
  touched_set_uid: string[];
  /** 动作/组  */
  sets: {
    step_uid: number;
    uid: number;
    actions: {
      uid: number;
      /** 动作id，用于后面记录该记录动作执行历史，获取最大重量、最大次数等统计参考数据 */
      action_id: number;
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

export type WorkoutDayStepProgressJSON250629 = {
  v: "250629";
  /** 当前做到第几个动作了 */
  step_idx: number;
  /** 当前做到动作的第几组了 */
  set_idx: number;
  /** 当前做到动作的组中第几个动作了 */
  act_idx: number;
  /** 更新数据时，避免将没有填写的组默认输入 0 提交上去了 */
  touched_set_uid: string[];
  /** 动作/组  */
  sets: {
    step_uid: number;
    uid: number;
    actions: {
      uid: number;
      /** 动作id，用于后面记录该记录动作执行历史，获取最大重量、最大次数等统计参考数据 */
      action_id: number;
      /** 方便查看 */
      action_name: string;
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
      /** 计数单位为时间的动作，会记录倒计时开始时间 */
      start_at1: number;
      /** 休息倒计时开始时间 */
      start_at2: number;
      start_at3: number;
      /** 计数单位为时间的动作，会记录倒计时暂停时间 */
      finished_at1: number;
      /** 休息倒计时暂停时间 */
      finished_at2: number;
      finished_at3: number;
      /** 如果该动作是计时，还剩多久 */
      time1: number;
      /** 如果该动作是计时，休息时间还剩多久 */
      time2: number;
      /** 如果该动作是计时，休息已过去多久 */
      time3: number;
    }[];
    /** 倒计时开始时间 */
    start_at: number;
    /** 倒计时结束时间 */
    finished_at: number;
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
export function updateWorkoutDayStepContent(body: { id: number | string; content: WorkoutDayStepProgressJSON250629 }) {
  // console.log("[SERVICE]workout_day - updateWorkoutDayStepContent", body.content);
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
export type WorkoutDayStepDetailsJSON250616 = {
  v: "250616";
  steps: {
    uid: number;
    sets: {
      uid: number;
      type: WorkoutPlanSetType;
      actions: {
        /** 在组中的动作uid，超级组可能用上。不使用 id 可能一组存在两个相同的动作 */
        uid: number;
        /** 动作id */
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

export type WorkoutDayStepDetailsJSON250629 = {
  v: "250629";
  steps: {
    uid: number;
    sets: {
      uid: number;
      type: WorkoutPlanSetType;
      actions: {
        /** 在组中的动作uid，超级组可能用上。不使用 id 可能一组存在两个相同的动作 */
        uid: number;
        /** 动作id */
        id: number;
        zh_name: string;
        reps: {
          num: number;
          unit: SetValueUnit;
        };
        weight: {
          num: string;
          unit: SetValueUnit;
        };
        rest_duration: {
          num: number;
          unit: SetValueUnit;
        };
      }[];
      rest_duration: {
        num: number;
        unit: SetValueUnit;
      };
      weight: {
        num: string;
        unit: SetValueUnit;
      };
    }[];
    note: string;
  }[];
};

/**
 * 更新训练日计划内容
 * @param body
 * @returns
 */
export function updateWorkoutDayPlanDetails(body: { id: string; content: WorkoutDayStepDetailsJSON250629 }) {
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
export function completeWorkoutDay(body: {
  id: string;
  pending_steps: WorkoutDayStepProgressJSON250629;
  updated_details: WorkoutDayStepDetailsJSON250629;
}) {
  return request.post("/api/workout_day/finish", {
    id: Number(body.id),
    pending_steps: JSON.stringify(body.pending_steps),
    updated_details: JSON.stringify(body.updated_details),
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
    title: string;
    type: WorkoutPlanType;
    /** 持续时间，单位 秒 */
    duration: number;
    /** 总容量，单位 公斤 */
    total_volume: number;
    status: WorkoutDayStatus;
    remark: string;
    started_at: number;
    finished_at: number;
    pending_steps: string;
    updated_details: string;
    day_number: number;
    student_id: number;
    is_self: boolean;
    // steps: WorkoutPlanStepResp[];
    workout_plan: null | {
      id: number;
      title: string;
      overview: string;
      tags: string;
      details: string;
      creator: { nickname: string; avatar_url: string };
    };
  }>("/api/workout_day/profile", body);
}
function parseWorkoutDayDetailsString(details: string) {
  const r = parseJSONStr<
    WorkoutDayStepDetailsJSON250424 | WorkoutDayStepDetailsJSON250616 | WorkoutDayStepDetailsJSON250629
  >(details);
  if (r.error) {
    return [];
  }
  const result: WorkoutDayStepDetailsJSON250629["steps"] = [];
  if (r.data.v === "250424") {
    const steps = r.data.steps as WorkoutDayStepDetailsJSON250424["steps"];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      result.push({
        uid: i,
        sets: step.sets.map((set, idx) => {
          return {
            uid: idx,
            type: set.type as WorkoutPlanSetType,
            rest_duration: {
              num: set.rest_duration,
              unit: getSetValueUnit("秒"),
            },
            weight: parseWeightToNumAndUnit(set.weight),
            actions: set.actions.map((act, act_idx) => {
              return {
                uid: act_idx,
                id: act.id,
                zh_name: act.zh_name,
                reps: {
                  num: act.reps,
                  unit: act.reps_unit,
                },
                weight: parseWeightToNumAndUnit(act.weight),
                rest_duration: {
                  num: act.rest_duration,
                  unit: getSetValueUnit("秒"),
                },
                note: "",
              };
            }),
          };
        }),
        note: step.note,
      });
    }
  }
  if (r.data.v === "250616") {
    const steps = r.data.steps as WorkoutDayStepDetailsJSON250616["steps"];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      result.push({
        uid: step.uid,
        sets: step.sets.map((set, idx) => {
          return {
            uid: set.uid,
            type: set.type as WorkoutPlanSetType,
            rest_duration: {
              num: set.rest_duration,
              unit: getSetValueUnit("秒"),
            },
            weight: parseWeightToNumAndUnit(set.weight),
            actions: set.actions.map((act, idx) => {
              return {
                uid: act.uid,
                id: act.id,
                zh_name: act.zh_name,
                reps: {
                  num: act.reps,
                  unit: act.reps_unit,
                },
                weight: parseWeightToNumAndUnit(act.weight),
                rest_duration: {
                  num: act.rest_duration,
                  unit: getSetValueUnit("秒"),
                },
                note: "",
              };
            }),
          };
        }),
        note: step.note,
      });
    }
  }
  if (r.data.v === "250629") {
    const steps = r.data.steps as WorkoutDayStepDetailsJSON250629["steps"];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      result.push({
        uid: step.uid,
        sets: step.sets.map((set, idx) => {
          return {
            uid: set.uid,
            type: set.type as WorkoutPlanSetType,
            rest_duration: set.rest_duration,
            weight: set.weight,
            actions: set.actions.map((act, idx) => {
              return {
                uid: act.uid,
                id: act.id,
                zh_name: act.zh_name,
                reps: act.reps,
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
  }
  return result;
}
export function fetchWorkoutDayProfileProcess(r: TmpRequestResp<typeof fetchWorkoutDayProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const workout_day = r.data;
  const pending_steps = ((): Omit<WorkoutDayStepProgressJSON250629, "v"> => {
    const r = parseJSONStr<
      | WorkoutDayStepProgressJSON250424
      | WorkoutDayStepProgressJSON250531
      | WorkoutDayStepProgressJSON250616
      | WorkoutDayStepProgressJSON250629
    >(workout_day.pending_steps);
    if (r.error) {
      return {
        step_idx: 0,
        set_idx: 0,
        act_idx: 0,
        touched_set_uid: [],
        sets: [],
      };
    }
    if (r.data.v === "250424") {
      const d = r.data as WorkoutDayStepProgressJSON250424;
      return {
        step_idx: d.step_idx,
        set_idx: d.set_idx,
        act_idx: d.act_idx,
        touched_set_uid: d.touched_set_idx,
        sets: (d.sets ?? []).map((set) => {
          return {
            ...set,
            step_uid: set.step_idx,
            uid: set.idx,
            actions: set.actions.map((vv) => {
              return {
                ...vv,
                action_id: Number(vv.action_id),
                action_name: String(vv.action_id),
                uid: vv.idx,
                start_at1: 0,
                finished_at1: 0,
                start_at2: 0,
                finished_at2: 0,
                start_at3: 0,
                finished_at3: 0,
              };
            }),
            start_at: 0,
            finished_at: 0,
            completed: false,
          };
        }),
      };
    }
    if (r.data.v === "250531") {
      const d = r.data as WorkoutDayStepProgressJSON250531;
      return {
        step_idx: d.step_idx,
        set_idx: d.set_idx,
        act_idx: d.act_idx,
        touched_set_uid: d.touched_set_idx,
        sets: (d.sets ?? []).map((set) => {
          return {
            ...set,
            step_uid: set.step_idx,
            uid: set.idx,
            actions: set.actions.map((vv) => {
              return {
                ...vv,
                action_id: Number(vv.action_id),
                action_name: String(vv.action_id),
                uid: vv.idx,
                start_at1: 0,
                finished_at1: 0,
                start_at2: 0,
                finished_at2: 0,
                start_at3: 0,
                finished_at3: 0,
              };
            }),
            start_at: 0,
            finished_at: 0,
            completed: set.completed,
          };
        }),
      };
    }
    if (r.data.v === "250616") {
      const d = r.data as WorkoutDayStepProgressJSON250616;
      return {
        step_idx: d.step_idx,
        set_idx: d.set_idx,
        act_idx: d.act_idx,
        touched_set_uid: d.touched_set_uid,
        sets: (d.sets ?? []).map((set) => {
          return {
            ...set,
            step_uid: set.step_uid,
            uid: set.uid,
            actions: set.actions.map((vv) => {
              return {
                ...vv,
                action_id: Number(vv.action_id),
                action_name: String(vv.action_id),
                uid: vv.uid,
                start_at1: 0,
                finished_at1: 0,
                start_at2: 0,
                finished_at2: 0,
                start_at3: 0,
                finished_at3: 0,
              };
            }),
            start_at: 0,
            finished_at: 0,
            completed: set.completed,
          };
        }),
      };
    }
    const d = r.data as WorkoutDayStepProgressJSON250629;
    return d;
  })();
  const steps = (() => {
    /** 如果手动编辑了训练内容 */
    if (workout_day.updated_details) {
      return parseWorkoutDayDetailsString(workout_day.updated_details);
    }
    if (!workout_day.workout_plan) {
      return [];
    }
    const d = parseWorkoutPlanStepsString(workout_day.workout_plan.details);
    const steps = [];
    for (let a = 0; a < d.length; a += 1) {
      const step = d[a];
      const rr = {
        uid: a,
        sets: (() => {
          const sets: WorkoutDayStepDetailsJSON250629["steps"][number]["sets"] = [];
          for (let b = 0; b < Number(step.set_count); b += 1) {
            sets.push({
              uid: b,
              type: step.set_type,
              actions: step.actions.map((act, idx) => {
                return {
                  uid: idx,
                  id: Number(act.action.id),
                  zh_name: act.action.zh_name,
                  reps: {
                    num: Number(act.reps.num),
                    unit: act.reps.unit,
                  },
                  weight: {
                    num: act.weight.num,
                    unit: act.weight.unit,
                  },
                  rest_duration: {
                    num: Number(act.rest_duration.num),
                    unit: act.rest_duration.unit,
                  },
                };
              }),
              rest_duration: {
                num: (() => {
                  const vv = Number(step.set_rest_duration.num);
                  if (step.set_rest_duration.unit === getSetValueUnit("分")) {
                    return vv * 60;
                  }
                  return vv;
                })(),
                unit: getSetValueUnit("秒"),
              },
              weight: step.set_weight,
            });
            const is_last_set = a === steps.length - 1 && b === Number(step.set_count) - 1;
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
    workout_day.status === WorkoutDayStatus.Finished && workout_day.finished_at
      ? dayjs(workout_day.finished_at)
          .startOf("minute")
          .diff(dayjs(workout_day.started_at).startOf("minute"), "seconds")
      : 0;
  // console.log(seconds, dayjs(workout_day.finished_at).format("HH:mm"), dayjs(workout_day.started_at).format("HH:mm"));
  return Result.Ok({
    id: workout_day.id,
    type: workout_day.type || WorkoutPlanType.Strength,
    title: workout_day.workout_plan ? workout_day.workout_plan.title : workout_day.title,
    overview: workout_day.workout_plan?.overview ?? "",
    tags: workout_day.workout_plan?.tags.split(",").filter(Boolean) ?? [],
    status: workout_day.status,
    started_at: dayjs(workout_day.started_at),
    started_at_text: dayjs(workout_day.started_at).format("MM-DD HH:mm"),
    finished_at: dayjs(workout_day.finished_at),
    finished: workout_day.status === WorkoutDayStatus.Finished ? dayjs(workout_day.finished_at) : dayjs(),
    finished_at_text:
      workout_day.status === WorkoutDayStatus.Finished ? dayjs(workout_day.finished_at).format("MM-DD HH:mm") : "",
    total_weight: toFixed(total_weight, 1),
    total_set_count,
    duration_text: (() => {
      if (workout_day.duration) {
        return `${workout_day.duration}分钟`;
      }
      return seconds_to_hour_with_template(seconds, seconds_to_hour_template1);
    })(),
    minutes: (() => {
      if (workout_day.duration) {
        return workout_day.duration;
      }
      return seconds_to_minutes(seconds);
    })(),
    remark: workout_day.remark,
    /** 填写的数据 */
    pending_steps,
    /** 训练内容 */
    steps,
    /** 动作统计 */
    stats: (() => {
      const action_group: Record<
        number,
        {
          title: string;
          type: WorkoutPlanSetType;
          records: {
            reps: number;
            reps_unit: SetValueUnit;
            weight: number;
            weight_unit: SetValueUnit;
            finished_at: number;
          }[];
        }
      > = {};
      const step_groups: Record<
        string,
        {
          sets: {
            uid: number;
            actions: {
              action_id: number;
              reps: number;
              reps_unit: SetValueUnit;
              weight: number;
              weight_unit: SetValueUnit;
            }[];
          }[];
        }
      > = {};
      for (let i = 0; i < pending_steps.sets.length; i += 1) {
        const { step_uid, uid, actions } = pending_steps.sets[i];
        step_groups[step_uid] = step_groups[step_uid] || { sets: [] };
        step_groups[step_uid].sets.push({
          uid,
          actions,
        });
      }
      const step_uids = Object.keys(step_groups);
      for (let i = 0; i < step_uids.length; i += 1) {
        const uid = step_uids[i];
        const matched = steps.find((v) => v.uid === Number(uid));
        if (matched && matched.sets[0]) {
          const set = matched.sets[0];
          if (set.type === WorkoutPlanSetType.Normal) {
            const act = set.actions[0];
            console.log(act.zh_name);
            const sets = step_groups[uid].sets;
            for (let j = 0; j < sets.length; j += 1) {
              const s = sets[j];
              const weight_text =
                s.actions[0].weight_unit === getSetValueUnit("自重")
                  ? "自重"
                  : s.actions[0].weight + s.actions[0].weight_unit;
              const reps_text = s.actions[0].reps + s.actions[0].reps_unit;
              console.log(`${weight_text}x${reps_text}`);
              console.log();
            }
          }
          if (set.type === WorkoutPlanSetType.Super) {
            const title = set.actions.map((a) => a.zh_name).join("+") + " 超级组";
            console.log(title);
            const sets = step_groups[uid].sets;
            for (let j = 0; j < sets.length; j += 1) {
              let texts = [];
              for (let z = 0; z < sets[j].actions.length; z += 1) {
                const act = sets[j].actions[z];
                const act_name = set.actions.find((a) => a.id === act.action_id)?.zh_name ?? null;
                if (act_name) {
                  const weight_text =
                    act.weight_unit === getSetValueUnit("自重") ? "自重" : act.weight + act.weight_unit;
                  const reps_text = act.reps + act.reps_unit;
                  texts.push(`${act_name} ${weight_text}x${reps_text}`);
                }
              }
              console.log(texts.join(" + "));
              console.log();
            }
          }
          if (set.type === WorkoutPlanSetType.HIIT) {
            const title = set.actions.map((a) => a.zh_name).join("+") + " HIIT";
            console.log(title);
            const sets = step_groups[uid].sets;
            for (let j = 0; j < sets.length; j += 1) {
              let texts = [];
              for (let z = 0; z < sets[j].actions.length; z += 1) {
                const act = sets[j].actions[z];
                const act_name = set.actions.find((a) => a.id === act.action_id)?.zh_name ?? null;
                if (act_name) {
                  const weight_text =
                    act.weight_unit === getSetValueUnit("自重") ? "自重" : act.weight + act.weight_unit;
                  const reps_text = act.reps + act.reps_unit;
                  texts.push(`${act_name} ${weight_text}x${reps_text}`);
                }
              }
              console.log(texts.join(" + "));
              console.log();
            }
          }
          if ([WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(set.type)) {
            const act = set.actions[0];
            const title = `${act.zh_name} ${WorkoutSetTypeTextMap[set.type]}`;
            console.log(title);
            const sets = step_groups[uid].sets;
            for (let j = 0; j < sets.length; j += 1) {
              let texts = [];
              for (let z = 0; z < sets[j].actions.length; z += 1) {
                const act = sets[j].actions[z];
                const act_name = set.actions.find((a) => a.id === act.action_id)?.zh_name ?? null;
                if (act_name) {
                  const weight_text =
                    act.weight_unit === getSetValueUnit("自重") ? "自重" : act.weight + act.weight_unit;
                  const reps_text = act.reps + act.reps_unit;
                  texts.push(`${weight_text}x${reps_text}`);
                }
              }
              console.log(texts.join(" + "));
              console.log();
            }
          }
        }
      }
      return action_group;
    })(),
    student_id: workout_day.student_id,
    is_self: workout_day.is_self,
    workout_plan: workout_day.workout_plan
      ? {
          id: workout_day.workout_plan.id,
          title: workout_day.workout_plan.title,
          overview: workout_day.workout_plan.overview,
          creator: workout_day.workout_plan.creator,
        }
      : null,
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
export function fetchWorkoutDayList(
  body: Partial<FetchParams> & Partial<{ status: WorkoutDayStatus; finished_at_start: Date; finished_at_end: Date }>
) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      title: string;
      type: WorkoutPlanType;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
      workout_plan: null | {
        id: number;
        title: string;
      };
    }>
  >("/api/workout_day/list", {
    page_size: body.pageSize,
    page: body.page,
    status: body.status,
    finished_at_start: body.finished_at_start,
    finished_at_end: body.finished_at_end,
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
        title: (() => {
          if (v.title) {
            return v.title;
          }
          return v.workout_plan?.title ?? "";
        })(),
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

// export function fetchWorkoutDayListWithProfile(body: { finished_at_start: string; finished_at_end: string }) {
//   return request.post<{
//     list: {
//       id: number;
//       status: WorkoutDayStatus;
//       started_at: string;
//       finished_at: string;
//     }[];
//   }>("/api/workout_day/finished_list", {
//     finished_at_start: dayjs(body.finished_at_start).startOf("date").toDate(),
//     finished_at_end: dayjs(body.finished_at_end).endOf("date").toDate(),
//   });
// }

// export function fetchWorkoutDayListWithProfileProcess(r: TmpRequestResp<typeof fetchWorkoutDayListWithProfile>) {
//   if (r.error) {
//     return Result.Err(r.error);
//   }
//   const data = r.data;
//   return Result.Ok({
//     list: data.list.map((v) => {
//       return {
//         id: v.id,
//         status: v.status,
//         started_at_text: v.started_at ? dayjs(v.started_at).format("MM-DD HH:mm") : null,
//         finished_at_text: v.finished_at ? dayjs(v.finished_at).format("MM-DD HH:mm") : null,
//         day: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : null,
//         date_text: v.finished_at ? dayjs(v.finished_at).format("YYYY-MM-DD") : null,
//       };
//     }),
//   });
// }

/** 已完成、已放弃 的训练日状态变回进行中 */
export function continueWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/continue", { id: body.id });
}
