import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { request } from "@/biz/requests";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";

import { HumanGenderType } from "./constants";

export function fetchStudentList(params: Partial<FetchParams> & { keyword: string }) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      nickname: string;
      avatar_url: string;
      gender: number;
      age: number;
    }>
  >("/api/student/list", {
    page: params.page,
    page_size: params.pageSize,
    keyword: params.keyword,
  });
}
export function fetchStudentListProcess(r: TmpRequestResp<typeof fetchStudentList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    ...resp,
    list: resp.list.map((v) => {
      return {
        id: v.id,
        nickname: v.nickname,
        avatar_url: v.avatar_url,
        age: v.age,
        gender: v.gender,
      };
    }),
  });
}

export function createStudent(data: { name: string; age: number; gender: number }) {
  return request.post<{}>("/api/student/create", data);
}

export function updateStudentProfile(
  body: { id: number } & Partial<{ nickname: string; age: number; gender: HumanGenderType }>
) {
  return request.post<{}>("/api/student/update", body);
}

export function deleteStudent(body: { id: number }) {
  return request.post<{}>("/api/student/delete", body);
}

export function fetchStudentProfile(body: { id: number }) {
  return request.post<{
    id: number;
    nickname: string;
    avatar_url: string;
    /** 年龄 */
    age: number;
    /** 性别 1男 2女 */
    gender: HumanGenderType;
  }>("/api/student/profile", { id: body.id });
}
export function fetchStudentProfileProcess(r: TmpRequestResp<typeof fetchStudentProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    id: data.id,
    nickname: data.nickname,
    avatar_url: data.avatar_url,
    age: data.age,
    gender: data.gender,
  });
}

export function fetchStudentWorkoutDayList(
  body: Partial<FetchParams> & {
    id: number;
    status: WorkoutDayStatus;
    started_at_start: string;
    started_at_end: string;
  }
) {
  return request.post<
    ListResponse<{
      id: number;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
      workout_plan: {
        id: number;
        title: string;
        overview: string;
        tags: string;
      };
    }>
  >("/api/student/workout_day_list", {
    page_size: body.pageSize,
    page: body.page,
    id: body.id,
    status: body.status,
    started_at_start: body.started_at_start,
    started_at_end: body.started_at_end,
  });
}

export function fetchStudentWorkoutDayListProcess(r: TmpRequestResp<typeof fetchStudentWorkoutDayList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    ...resp,
    list: resp.list.map((v) => {
      return {
        ...v,
        finished_at_text: dayjs(v.finished_at).format("YYYY-MM-DD"),
        started_at_text: dayjs(v.started_at).format("YYYY-MM-DD"),
        workout_plan: {
          ...v.workout_plan,
          tags: v.workout_plan.tags.split(",").filter(Boolean),
        },
      };
    }),
  });
}
