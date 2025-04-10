import { request } from "@/biz/requests";
import { idsMapValue } from "@/biz/services/utils";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result, UnpackedResult } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { parseJSONStr } from "@/utils";

import { WorkoutActionSteps, WorkoutActionProblems } from "./types";
import { WorkoutActionType } from "./constants";

type PartialWorkoutAction = {
  id: number | string;
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
  params: FetchParams & { type?: string; keyword?: string; tags1?: string[]; tags2?: string[] }
) {
  return request.post<ListResponseWithCursor<PartialWorkoutAction>>("/api/workout_action/list", {
    page_size: params.page_size,
    page: params.page,
    next_marker: params.next_marker,
    type: params.type ?? WorkoutActionType.RESISTANCE,
    keyword: params.keyword,
    tags1: params.tags1,
    tags2: params.tags2,
  });
}
export function fetchWorkoutActionListProcess(r: TmpRequestResp<typeof fetchWorkoutActionList>) {
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
export type WorkoutActionProfile = UnpackedResult<ReturnType<typeof fetchWorkoutActionListProcess>>["list"][number];

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
