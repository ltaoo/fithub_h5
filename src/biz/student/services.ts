import { request } from "@/biz/requests";
import { ListResponseWithCursor } from "@/biz/requests/types";

export function fetchStudentList() {
  return request.post<
    ListResponseWithCursor<{
      id: number | string;
      name: string;
    }>
  >("/api/student/list");
}

export function createStudent(data: { name: string; phone: string; email: string }) {
  return request.post<{}>("/api/student/create", data);
}

export function updateStudent(data: { id: string; name: string; phone: string; email: string }) {
  return request.post<{}>("/api/student/update", data);
}
