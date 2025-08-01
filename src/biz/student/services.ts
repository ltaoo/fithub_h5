import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { request } from "@/biz/requests";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { WorkoutPlanType } from "@/biz/workout_plan/constants";
import { SetValueUnit } from "@/biz/input_set_value";
import { toFixed } from "@/utils";

import { HumanGenderType, CoachStudentRole, CoachStudentRoleTextMap } from "./constants";

export function fetchStudentList(params: Partial<FetchParams> & { keyword: string }) {
  return request.post<
    ListResponseWithCursor<{
      id: number;
      nickname: string;
      avatar_url: string;
      gender: number;
      age: number;
      role: CoachStudentRole;
      role_text: string;
      status: number;
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
        role: v.role,
        role_text: v.role_text,
        status: v.status,
      };
    }),
  });
}

// export function fetchCoachProfile(body: { id: number }) {
//   return request.post<{
//     id: number;
//     nickname: string;
//     avatar_url: string;
//   }>("/api/coach/profile", body);
// }

export function addFriend(body: { uid: string }) {
  return request.post("/api/friend/add", body);
}

export function createStudent(body: { name: string; age: number; gender: number }) {
  return request.post<{}>("/api/student/create", body);
}

export function updateStudentProfile(
  body: { id: number } & Partial<{ nickname: string; age: number; gender: HumanGenderType }>
) {
  return request.post<{}>("/api/student/update", body);
}

export function deleteStudent(body: { id: number }) {
  return request.post<{}>("/api/student/delete", body);
}

export function fetchStudentAuthURL(body: { id: number }) {
  return request.post<{ url: string }>("/api/student/auth_url", body);
}

export function studentToFriend(body: { id: number }) {
  return request.post("/api/student/to_friend", body);
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
    status: number;
    role: CoachStudentRole;
  }>("/api/student/profile", { id: body.id });
}
export function fetchStudentProfileProcess(r: TmpRequestResp<typeof fetchStudentProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const v = r.data;
  return Result.Ok({
    id: v.id,
    nickname: v.nickname,
    avatar_url: v.avatar_url,
    age: v.age,
    gender: v.gender,
    status: v.status,
    role: v.role,
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
      title: string;
      status: WorkoutDayStatus;
      started_at: string;
      finished_at: string;
      workout_plan: null | {
        id: number;
        title: string;
        overview: string;
        tags: string;
      };
    }>
  >("/api/student/workout_day/list", {
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
        title: v.workout_plan ? v.workout_plan.title : v.title,
        finished_at_text: dayjs(v.finished_at).format("YYYY-MM-DD"),
        started_at_text: dayjs(v.started_at).format("YYYY-MM-DD"),
        workout_plan: v.workout_plan
          ? {
              ...v.workout_plan,
              tags: v.workout_plan.tags.split(",").filter(Boolean),
            }
          : null,
      };
    }),
  });
}

export function fetchStudentWorkoutDayProfile(body: { id: number; student_id?: number }) {
  return request.post<{
    id: number;
    title: string;
    type: WorkoutPlanType;
    status: WorkoutDayStatus;
    started_at: number;
    finished_at: number;
    pending_steps: string;
    updated_details: string;
    duration: number;
    total_volume: number;
    remark: string;
    day_number: number;
    is_self: boolean;
    student_id: number;
    student: {
      id: number;
      nickname: string;
      avatar_url: string;
    };
    // steps: WorkoutPlanStepResp[];
    workout_plan: null | {
      id: number;
      title: string;
      overview: string;
      tags: string;
      details: string;
      creator: { nickname: string; avatar_url: string };
    };
  }>("/api/student/workout_day/profile", body);
}

/**
 * 获取学员/好友训练日结果
 * @param body
 * @returns
 */
export function fetchStudentWorkoutDayResult(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
    type: WorkoutPlanType;
    status: WorkoutDayStatus;
    remark: string;
    started_at: number;
    finished_at: number;
    steps: {
      title: string;
      type: string;
      total_volume: number;
      sets: {
        idx: number;
        texts: string[];
        actions: {
          action_id: number;
          action_name: string;
          reps: number;
          reps_unit: SetValueUnit;
          weight: string;
          weight_unit: SetValueUnit;
        }[];
      }[];
      duration: number;
    }[];
    set_count: number;
    /** 持续时间，单位 分 */
    duration: number;
    /** 总容量，单位 公斤 */
    total_volume: number;
    tags: string[];
    student_id: number;
    student: {
      id: number;
      nickname: string;
      avatar_url: string;
    };
    is_self: boolean;
    workout_plan: null | {
      id: number;
      title: string;
      overview: string;
      tags: string;
      creator: { nickname: string; avatar_url: string };
    };
  }>("/api/student/workout_day/result", body);
}
export function fetchStudentWorkoutDayResultProcess(r: TmpRequestResp<typeof fetchStudentWorkoutDayResult>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const v = r.data;
  return Result.Ok({
    id: v.id,
    type: v.type || WorkoutPlanType.Strength,
    title: v.workout_plan ? v.workout_plan.title : v.title,
    overview: v.workout_plan?.overview ?? "",
    tags: v.tags,
    status: v.status,
    started_at: dayjs(v.started_at),
    started_at_text: dayjs(v.started_at).format("MM-DD HH:mm"),
    finished_at: dayjs(v.finished_at),
    finished: v.status === WorkoutDayStatus.Finished ? dayjs(v.finished_at) : dayjs(),
    finished_at_text: v.status === WorkoutDayStatus.Finished ? dayjs(v.finished_at).format("MM-DD HH:mm") : "",
    total_weight: toFixed(v.total_volume, 1),
    set_count: v.set_count,
    duration_text: `${v.duration}分钟`,
    duration: v.duration,
    steps: v.steps,
    remark: v.remark,
    student_id: v.student_id,
    student: v.student,
    is_self: v.is_self,
    workout_plan: v.workout_plan
      ? {
          id: v.workout_plan.id,
          title: v.workout_plan.title,
          overview: v.workout_plan.overview,
          creator: v.workout_plan.creator,
        }
      : null,
  });
}
