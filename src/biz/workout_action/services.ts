import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result, UnpackedResult } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr } from "@/utils";

import { WorkoutActionSteps, WorkoutActionProblems } from "./types";
import { WorkoutActionType } from "./constants";
import dayjs from "dayjs";

type PartialWorkoutAction = {
  id: number;
  name: string;
  zh_name: string;
  alias: string;
  type: string;
  overview: string;
  level: number;
  tags1: string;
  tags2: string;
  details: string;
  points: string;
  problems: string;
  equipment_ids: string;
  muscle_ids: string;
  alternative_action_ids: string;
  advanced_action_ids: string;
  regressed_action_ids: string;
};

/**
 * 获取健身动作列表
 * @returns
 */
export function fetchWorkoutActionList(
  params: Partial<FetchParams> & {
    type?: WorkoutActionType | null;
    keyword?: string;
    tags?: string[];
    tags2?: string[];
  }
) {
  return request.post<ListResponseWithCursor<PartialWorkoutAction>>("/api/workout_action/list", {
    page_size: params.pageSize,
    page: params.page,
    next_marker: params.next_marker,
    type: params.type ?? WorkoutActionType.Resistance,
    keyword: params.keyword,
    tag: params.tags?.join(",") ?? "",
    tags2: params.tags2,
  });
}
export function fetchWorkoutActionListProcess(r: TmpRequestResp<typeof fetchWorkoutActionList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    no_more: !r.data.has_more,
    list: r.data.list.map((action) => {
      return {
        id: action.id,
        name: action.name,
        zh_name: action.zh_name,
        type: action.type,
        overview: action.overview,
        tags1: action.tags1.split(",").filter(Boolean),
        tags2: action.tags2.split(",").filter(Boolean),
        level: action.level,
        equipments: idsMapValue(action.equipment_ids),
        muscles: idsMapValue(action.muscle_ids),
      };
    }),
  });
}
export type WorkoutActionProfile = {
  id: number;
  name: string;
  zh_name: string;
  overview: string;
  muscles: {
    id: number;
  }[];
  equipments: {
    id: number;
  }[];
};

export function fetchWorkoutActionListByIds(body: { ids: number[] }) {
  return request.post<{
    list: PartialWorkoutAction[];
  }>("/api/workout_action/list_by_ids", {
    ids: body.ids,
  });
}
export function fetchWorkoutActionListByIdsProcess(r: TmpRequestResp<typeof fetchWorkoutActionListByIds>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    list: r.data.list.map((action) => {
      return {
        id: action.id,
        name: action.name,
        zh_name: action.zh_name,
        type: action.type,
        overview: action.overview,
        tags1: action.tags1.split(",").filter(Boolean),
        tags2: action.tags2.split(",").filter(Boolean),
        level: action.level,
        equipments: idsMapValue(action.equipment_ids),
        muscles: idsMapValue(action.muscle_ids),
      };
    }),
  });
}

/**
 * 创建健身动作
 * @param body
 * @returns
 */
export function createWorkoutAction(body: {
  name: string;
  zh_name: string;
  alias: string;
  overview: string;
  type: string;
  level: number;
  tags1: string;
  tags2: string;
  details: string;
  points: string;
  problems: string;
  equipment_ids: string;
  muscle_ids: string;
  alternative_action_ids: string;
  advanced_action_ids: string;
  regressed_action_ids: string;
}) {
  return request.post<void>("/api/workout_action/create", body);
}

/**
 * 获取健身动作详情
 * @param body
 * @returns
 */
export function fetchWorkoutActionProfile(body: { id: number | string }) {
  return request.post<{
    id: number;
    name: string;
    zh_name: string;
    alias: string;
    overview: string;
    type: string;
    level: number;
    tags1: string;
    tags2: string;
    details: string;
    points: string;
    problems: string;
    equipment_ids: string;
    muscle_ids: string;
    alternative_action_ids: string;
    advanced_action_ids: string;
    regressed_action_ids: string;
  }>("/api/workout_action/profile", {
    id: Number(body.id),
  });
}
export function fetchWorkoutActionProfileProcess(r: TmpRequestResp<typeof fetchWorkoutActionProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    id: data.id,
    name: data.name,
    zh_name: data.zh_name,
    alias: data.alias.split(",").filter(Boolean),
    overview: data.overview,
    type: data.type,
    level: data.level,
    tags1: data.tags1.split(",").filter(Boolean),
    tags2: data.tags2.split(",").filter(Boolean),
    details: (() => {
      const r = parseJSONStr<WorkoutActionSteps>(data.details);
      console.log("[SERVICE]fetchWorkoutActionProfileProcess", r);
      if (r.error) {
        return {
          startPosition: "",
          start_position: "",
          steps: [],
        };
      }
      return {
        startPosition: r.data.startPosition,
        start_position: r.data.startPosition,
        steps: r.data.steps ?? [],
      };
    })(),
    points: (() => {
      const r = parseJSONStr<string[]>(data.points);
      if (r.error) {
        return [];
      }
      return r.data;
    })(),
    problems: (() => {
      const r = parseJSONStr<WorkoutActionProblems[]>(data.problems);
      if (r.error) {
        return [];
      }
      return r.data.map((problem) => {
        return {
          title: problem.title,
          reason: problem.reason,
          solutions: problem.solutions ?? [],
        };
      });
    })(),
    equipments: idsMapValue(data.equipment_ids),
    muscles: idsMapValue(data.muscle_ids),
    alternative_actions: idsMapValue(data.alternative_action_ids),
    advanced_actions: idsMapValue(data.advanced_action_ids),
    regressed_actions: idsMapValue(data.regressed_action_ids),
  });
}

/**
 * 更新健身动作
 * @param body
 * @returns
 */
export function updateWorkoutAction(body: {
  id: number | string;
  name: string;
  zh_name: string;
  alias: string;
  overview: string;
  type: string;
  level: number;
  tags1: string;
  tags2: string;
  details: string;
  points: string;
  problems: string;
  equipment_ids: string;
  muscle_ids: string;
  alternative_action_ids: string;
  advanced_action_ids: string;
  regressed_action_ids: string;
}) {
  return request.post<void>("/api/workout_action/update", body);
}

export type WorkoutAction = {
  id: number;
  reps: number;
  reps_unit: string;
  weight: number;
  weight_unit: string;
  remark: string;
  extra_medias: string;
  created_at: string;
  workout_day_id: number;
  student_id: number;
  action_id: number;
  action: {
    id: number;
    status: number;
    name: string;
    zh_name: string;
    alias: string;
    overview: string;
    type: string;
    level: number;
    tags1: string;
    tags2: string;
    details: string;
    points: string;
    problems: string;
    created_at: string;
    updated_at: string;
    muscle_ids: string;
    equipment_ids: string;
    alternative_action_ids: string;
    advanced_action_ids: string;
    regressed_action_ids: string;
    owner_id: number;
  };
};

export function createWorkoutActionHistory(body: {
  workout_action_id: number;
  reps: number;
  reps_unit: string;
  weight: number;
  weight_unit: string;
}) {
  return request.post("/api/workout_action_history/create", body);
}

/**
 * 获取指定「训练日」内的所有动作历史记录
 */
export function fetchWorkoutActionHistoryListOfWorkoutDay(body: Partial<FetchParams> & { workout_day_id: number }) {
  return request.post<ListResponseWithCursor<WorkoutAction>>("/api/workout_action_history/list_of_workout_day", {
    page: body.page,
    page_size: body.pageSize,
    workout_day_id: body.workout_day_id,
  });
}

export function fetchWorkoutActionHistoryListOfWorkoutDayProcess(
  r: TmpRequestResp<typeof fetchWorkoutActionHistoryListOfWorkoutDay>
) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const { page_size, list, total } = r.data;
  return Result.Ok({
    page_size,
    list: list.map((v) => {
      return {
        id: v.id,
        reps: v.reps,
        reps_unit: v.reps_unit,
        weight: v.weight,
        weight_unit: v.weight_unit,
        created_at: dayjs(new Date(v.created_at)).format("YYYY-MM-DD HH:mm"),
        action: {
          id: v.action.id,
          zh_name: v.action.zh_name,
        },
      };
    }),
    total,
  });
}

/**
 * 获取「指定动作」的所有历史记录
 */
export function fetchWorkoutActionHistoryListOfWorkoutAction(
  body: Partial<FetchParams> & { workout_action_id: number; student_id: number }
) {
  return request.post<ListResponseWithCursor<WorkoutAction>>("/api/workout_action_history/list_of_workout_action", {
    page: body.page,
    page_size: body.pageSize,
    workout_action_id: body.workout_action_id,
    student_id: body.student_id,
  });
}

export function fetchWorkoutActionHistoryListOfWorkoutActionProcess(
  r: TmpRequestResp<typeof fetchWorkoutActionHistoryListOfWorkoutDay>
) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const { page_size, list, total } = r.data;
  return Result.Ok({
    page_size,
    list: list.map((v) => {
      return {
        id: v.id,
        reps: v.reps,
        reps_unit: v.reps_unit,
        weight: v.weight,
        weight_unit: v.weight_unit,
        created_at: dayjs(new Date(v.created_at)).format("YYYY-MM-DD HH:mm"),
        action: {
          id: v.action.id,
          zh_name: v.action.zh_name,
        },
      };
    }),
    total,
  });
}
