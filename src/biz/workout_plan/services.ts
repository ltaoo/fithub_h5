import dayjs from "dayjs";

import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { SetValueUnit } from "@/biz/set_value_input";
import { TheResponseOfFetchFunction } from "@/domains/request";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import {
  WorkoutScheduleType,
  WorkoutPlanSetType,
  WorkoutScheduleDayType,
  WorkoutScheduleTypeTextMap,
} from "./constants";
import {
  WorkoutPlanStepBody,
  WorkoutPlanActionPayload,
  WorkoutPlanPreviewPayload,
  WorkoutPlanStepJSON250607,
} from "./types";
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

enum WorkoutPlanPublishStatus {
  Unknown = 0,
  Public = 1,
  Private = 2,
}

export function createWorkoutPlan(body: {
  title: string;
  overview: string;
  tags: string;
  level: number;
  status: WorkoutPlanPublishStatus;
  details: WorkoutPlanDetailsJSON250424;
  estimated_duration: number;
  points: string;
  suggestions: string;
  muscle_ids: string;
  equipment_ids: string;
}) {
  return request.post<{ id: number }>("/api/workout_plan/create", {
    ...body,
    details: JSON.stringify(body.details),
  });
}

export function updateWorkoutPlan(body: {
  id: number;
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
  return request.post<void>("/api/workout_plan/update", {
    ...body,
    details: JSON.stringify(body.details),
  });
}

export function fetchWorkoutPlanProfile(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
    overview: string;
    tags: string;
    level: number;
    estimated_duration: number;
    suggestions: string;
    steps: WorkoutPlanStepJSON250607[];
    muscle_ids: string;
    equipment_ids: string;
    creator: {
      nickname: string;
      avatar_url: string;
      is_self: boolean;
    };
    created_at: string;
  }>("/api/workout_plan/profile", { id: body.id });
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
  const v = r.data;
  return Result.Ok({
    id: v.id,
    title: v.title,
    overview: v.overview,
    tags: v.tags.split(",").filter(Boolean),
    level: v.level,
    steps: v.steps,
    estimated_duration: v.estimated_duration,
    estimated_duration_text: seconds_to_hour_with_template(v.estimated_duration, seconds_to_hour_template1),
    suggestions: (() => {
      const r = parseJSONStr<string[]>(v.suggestions);
      if (r.error) {
        return "";
      }
      if (r.data[0]) {
        return r.data[0];
      }
      return "";
    })(),
    creator: v.creator,
    muscle_ids: v.muscle_ids
      .split(",")
      .filter(Boolean)
      .map((v) => Number(v)),
    equipment_ids: v.equipment_ids
      .split(",")
      .filter(Boolean)
      .map((v) => Number(v)),
    created_at: dayjs(v.created_at).format("YYYY-MM-DD HH:mm"),
  });
}

export function fetchContentListOfWorkoutPlan(
  body: Partial<FetchParams> & { workout_plan_id: number; keyword?: string }
) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      description: string;
      video_url: string;
      details: string;
      like_count: number;
      creator: {
        nickname: string;
        avatar_url: string;
      };
    }>
  >("/api/workout_plan/content/list", {
    page: body.page,
    page_size: body.pageSize,
    workout_plan_id: body.workout_plan_id,
  });
}
export function fetchContentProfileOfWorkoutPlan(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
    description: string;
    video_url: string;
    details: string;
    creator: {
      nickname: string;
      avatar_url: string;
    };
  }>("/api/workout_plan/content/profile", {
    id: body.id,
  });
}
export function fetchContentProfileOfWorkoutPlanProcess(r: TmpRequestResp<typeof fetchContentProfileOfWorkoutPlan>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    id: data.id,
    title: data.title,
    description: data.description,
    video_url: data.video_url,
    details: (() => {
      const r = parseJSONStr<{
        points: {
          /** 秒数 */
          time: number;
          time_text: string;
          /** 文本 */
          // text: string;
          workout_action_name: string;
        }[];
      }>(data.details);
      if (r.error) {
        return {
          points: [],
        };
      }
      return {
        points: r.data.points ?? [],
      };
    })(),
    creator: data.creator,
  });
}

export function fetchWorkoutPlanList(body: Partial<FetchParams> & { ids: number[]; keyword?: string }) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      title: string;
      overview: string;
      tags: string;
      level: number;
      estimated_duration: number;
      creator: {
        nickname: string;
        avatar_url: string;
      };
    }>
  >("/api/workout_plan/list", {
    page: body.page,
    page_size: body.pageSize,
    ids: body.ids,
    keyword: body.keyword,
  });
}
export function fetchWorkoutPlanListProcess(r: TmpRequestResp<typeof fetchWorkoutPlanList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    ...r.data,
    list: r.data.list.map((v) => {
      return {
        id: v.id,
        title: v.title,
        overview: v.overview,
        tags: v.tags.split(",").filter(Boolean),
        level: v.level,
        estimated_duration: v.estimated_duration,
        estimated_duration_text: seconds_to_hour_with_template(v.estimated_duration, seconds_to_hour_template1),
        creator: v.creator,
      };
    }),
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
  status: WorkoutPlanPublishStatus;
  type: WorkoutScheduleType;
  // 安排
  details: string;
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
  details: string;
}) {
  return request.post<{ id: number }>("/api/workout_schedule/update", body);
}

type WorkoutScheduleDetailsJSON250616 = {
  schedules: {
    weekday: number;
    day: number;
    idx: number;
    workout_plan_ids: number[];
  }[];
};
export function fetchWorkoutScheduleProfile(body: { id: number | string }) {
  return request.post<{
    id: number;
    title: string;
    overview: string;
    // tags: string;
    level: number;
    type: WorkoutScheduleType;
    details: string;
    /** 是否应用 */
    applied: number;
    applied_in_interval: number;
    creator: {
      nickname: string;
      avatar_url: string;
      is_self: boolean;
    };
    created_at: string;
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
    created_at: dayjs(profile.created_at).format("YYYY-MM-DD HH:mm"),
    creator: profile.creator,
    schedules: (() => {
      const r = parseJSONStr<WorkoutScheduleDetailsJSON250616>(profile.details);
      if (r.error) {
        return [];
      }
      return r.data.schedules;
    })(),
    // schedules: (() => {
    // })(),
  });
}

export function applyWorkoutSchedule(body: { id: number; start_date?: Date }) {
  return request.post<void>("/api/workout_schedule/apply", body);
}
export function cancelWorkoutSchedule(body: { id: number }) {
  return request.post<void>("/api/workout_schedule/cancel", body);
}

export function fetchWorkoutScheduleList(body: Partial<FetchParams> & { keyword: string }) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      overview: string;
      level: number;
      type: WorkoutScheduleType;
      creator: {
        nickname: string;
        avatar_url: string;
      };
    }>
  >("/api/workout_schedule/list", {
    page_size: body.pageSize,
    page: body.page,
    keyword: body.keyword,
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
        type_text: WorkoutScheduleTypeTextMap[v.type] ?? "未知",
        schedules: (() => {
          return [];
        })(),
        schedule_text: (() => {
          return "";
        })(),
        creator: v.creator,
      };
    }),
  });
}

export function fetchMyWorkoutScheduleList() {
  return request.post<{
    list: {
      id: number;
      level: number;
      overview: string;
      start_date: string;
      // schedules: {
      //   day: number;
      //   weekday: number;
      //   title: string;
      //   overview: string;
      //   tags: string;
      //   workout_plan_id: number;
      // }[];
      details: string;
      status: number;
      title: string;
      type: number;
      workout_schedule_id: number;
    }[];
  }>("/api/workout_schedule/enabled", {});
}

export function fetchMyWorkoutScheduleListProcess(r: TmpRequestResp<typeof fetchMyWorkoutScheduleList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    ...r.data,
    list: r.data.list.map((v) => {
      return {
        id: v.id,
        type: v.type,
        start_date: dayjs(v.start_date),
        schedules: (() => {
          const r = parseJSONStr<WorkoutScheduleDetailsJSON250616>(v.details);
          if (r.error) {
            return [];
          }
          return r.data.schedules;
        })(),
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
      details: {
        id: number;
        type: number;
        title: string;
        overview: string;
        tags: string;
        creator: { nickname: string; avatar_url: string };
      }[];
    }[];
  }>("/api/workout_plan_set/list", {
    page: 1,
    page_size: 10,
  });
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
        list: v.details.map((vv) => {
          return {
            id: vv.id,
            title: vv.title,
            overview: vv.overview,
            tags: vv.tags.split(",").filter(Boolean),
            type: vv.type,
            type_text: (() => {
              if (vv.type === 1) {
                return "单天计划";
              }
              return "周期计划";
            })(),
            creator: vv.creator,
          };
        }),
      };
    }),
  });
}
