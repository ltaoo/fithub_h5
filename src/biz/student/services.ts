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
