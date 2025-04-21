import { request } from "@/biz/requests";

export function createMember(data: { name: string }) {
  return request.post("/api/coach/create", data);
}
