import dayjs from "dayjs";

import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { getSetValueUnit, SetValueUnit } from "@/biz/input_set_value";
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
  WorkoutPlanBodyDetailsJSON250424,
  WorkoutPlanStepContent,
  WorkoutPlanStepJSON250424,
  WorkoutPlanBodyStepJSON250627,
  WorkoutPlanBodyDetailsJSON250627,
} from "./types";
import { map_weekday_text } from "./workout_schedule";

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
  details: WorkoutPlanBodyDetailsJSON250627;
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
  details: WorkoutPlanBodyDetailsJSON250627;
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

export function parseWeightToNumAndUnit(set_weight: string) {
  const m1 = set_weight.match(/([0-9]{1,})RM/);
  if (m1) {
    return {
      num: m1[1],
      unit: getSetValueUnit("RM"),
    };
  }
  const m2 = set_weight.match(/([0-9]{1,})RPE/);
  if (m2) {
    return {
      num: m2[1],
      unit: getSetValueUnit("RPE"),
    };
  }
  return {
    num: "6",
    unit: getSetValueUnit("RPE"),
  };
}
export function parseWorkoutPlanStepsString(details: string) {
  const r = parseJSONStr<WorkoutPlanBodyDetailsJSON250424 | WorkoutPlanBodyDetailsJSON250627>(details);
  if (r.error) {
    return [];
  }
  const { v, steps } = r.data;
  const result: WorkoutPlanStepContent[] = [];
  if (["250424", "250607"].includes(v)) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as WorkoutPlanStepJSON250607;
      result.push({
        idx: i,
        set_type: step.set_type as WorkoutPlanSetType,
        set_count: String(step.set_count),
        set_rest_duration: {
          num: String(step.set_rest_duration),
          unit: getSetValueUnit("秒"),
        },
        set_weight: parseWeightToNumAndUnit(step.set_weight),
        set_note: step.set_note,
        set_tags: [],
        actions: step.actions.map((act) => {
          return {
            action: {
              id: act.action.id,
              zh_name: act.action.zh_name,
            },
            reps: {
              num: String(act.reps),
              unit: act.reps_unit,
            },
            weight: parseWeightToNumAndUnit(act.weight),
            rest_duration: {
              num: String(act.rest_duration),
              unit: getSetValueUnit("秒"),
            },
          };
        }),
      });
    }
  }
  if (v === "250627") {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as WorkoutPlanBodyStepJSON250627;
      result.push({
        idx: i,
        set_type: step.set_type as WorkoutPlanSetType,
        set_count: String(step.set_count),
        set_rest_duration: step.set_rest_duration,
        set_weight: step.set_weight,
        set_note: step.set_note,
        set_tags: step.set_tags.split(",").filter(Boolean),
        actions: step.actions.map((act) => {
          return {
            action: act.action,
            reps: act.reps,
            weight: act.weight,
            rest_duration: act.rest_duration,
          };
        }),
      });
    }
  }
  return result;
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
    details: string;
    // details: WorkoutPlanBodyDetailsJSON250424 | WorkoutPlanBodyDetailsJSON250627;
    // steps: (WorkoutPlanStepJSON250607 | WorkoutPlanStepJSON250627)[];
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
    steps: parseWorkoutPlanStepsString(v.details),
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
      overview: string;
      video_key: string;
      details: string;
      // like_count: number;
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

export function fetchContentListOfWorkoutPlanProcess(r: TmpRequestResp<typeof fetchContentListOfWorkoutPlan>) {
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
        video_key: v.video_key,
        details: (() => {
          const r = parseJSONStr<{
            points: {
              /** 秒数 */
              time: number;
              time_text: string;
              workout_action_id: number;
              workout_action_name: string;
            }[];
          }>(v.details);
          if (r.error) {
            return {
              points: [],
            };
          }
          return {
            points: r.data.points ?? [],
          };
        })(),
        // like_count: number;
        creator: v.creator,
      };
    }),
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
          workout_action_id: number;
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

export function fetchWorkoutPlanList(body: Partial<FetchParams> & { ids?: number[]; keyword?: string; tag?: string }) {
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
    tag: body.tag,
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
    schedules: {
      day: number;
      weekday: number;
      workout_plan: {
        id: number;
        title: string;
        overview: string;
        tags: string;
        estimated_duration: number;
      };
    }[];
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
      if (profile.schedules.length) {
        return profile.schedules.map((s) => {
          return {
            idx: 0,
            day: s.day,
            weekday: s.weekday,
            workout_plan_ids: [s.workout_plan.id],
          };
        });
      }
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

export function fetchAppliedWorkoutScheduleList() {
  return request.post<{
    list: {
      id: number;
      level: number;
      overview: string;
      start_date: string;
      schedules: {
        day: number;
        weekday: number;
        title: string;
        overview: string;
        tags: string;
        workout_plan_id: number;
      }[];
      details: string;
      status: number;
      title: string;
      type: number;
      workout_schedule_id: number;
      applied_at: string;
    }[];
  }>("/api/workout_schedule/enabled", {});
}

export function fetchAppliedWorkoutScheduleListProcess(r: TmpRequestResp<typeof fetchAppliedWorkoutScheduleList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    ...r.data,
    list: r.data.list.map((v) => {
      return {
        id: v.id,
        type: v.type,
        start_date: v.start_date ? dayjs(v.start_date) : dayjs(v.applied_at),
        schedules: (() => {
          if (v.schedules.length) {
            return v.schedules.map((s) => {
              return {
                idx: 0,
                day: s.day,
                weekday: s.weekday,
                workout_plan_ids: [s.workout_plan_id],
              };
            });
          }
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
                return "单次计划";
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
