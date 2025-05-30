import { request } from "@/biz/requests";
import { ListResponseWithCursor } from "@/biz/requests/types";
import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";

export function fetchStudentList(params: Partial<FetchParams>) {
  return request.post<
    ListResponseWithCursor<{
      id: number | string;
      student: {
        nickname: string;
      };
    }>
  >("/api/student/list", {
    page: params.page,
    page_size: params.pageSize,
  });
}
export function fetchStudentListProcess(r: TmpRequestResp<typeof fetchStudentList>) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const data = r.data;
  return Result.Ok({
    page_size: data.page_size,
    no_more: !data.has_more,
    list: data.list.map((student) => {
      return {
        id: student.id,
        nickname: student.student.nickname,
      };
    }),
  });
}

export function createStudent(data: { name: string; age: number; gender: number }) {
  return request.post<{}>("/api/student/create", data);
}

export function updateStudent(data: { id: string; name: string; phone: string; email: string }) {
  return request.post<{}>("/api/student/update", data);
}

export function fetchStudentProfile(body: { id: number }) {
  return request.post<{
    nickname: string;
    profile1: {
      nickname: string;
      avatar_url: string;
      /** 年龄 */
      age: number;
      /** 性别 1男 2女 */
      gender: number;
      /** 身高 */
      height: number;
    };
  }>("/api/student/profile", { id: body.id });
}
export function fetchStudentProfileProcess(r: TmpRequestResp<typeof fetchStudentProfile>) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const data = r.data;
  return Result.Ok({
    nickname: data.profile1.nickname,
    avatar_url: data.profile1.avatar_url,
    age: data.profile1.age,
    gender: data.profile1.gender,
  });
}
