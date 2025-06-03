import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { ListResponse } from "@/biz/requests/types";
import { request } from "@/biz/requests";
import { parseJSONStr } from "@/utils";

export function createReport(body: { content: string }) {
  return request.post("/api/report/create", body);
}

export function fetchReportList(body: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      content: string;
      reply_content: string;
      created_at: string;
    }>
  >("/api/report/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}
export function fetchReportListProcess(r: TmpRequestResp<typeof fetchReportList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    ...resp,
    list: resp.list.map((v) => {
      return {
        id: v.id,
        content: v.content,
        reply_content: v.reply_content,
        created_at: dayjs(v.created_at).format("YYYY-MM-DD HH:mm"),
      };
    }),
  });
}

export function cancelReport(body: { id: number }) {
  return request.post("/api/report/cancel", {
    id: body.id,
  });
}

export function deleteReport(body: { id: number }) {
  return request.post("/api/report/delete", {
    id: body.id,
  });
}

export function fetchReportProfile(body: { id: number }) {
  return request.post<{
    id: number;
    content: string;
    reply_content: string;
    created_at: string;
  }>("/api/report/profile", {
    id: body.id,
  });
}

export function fetchReportProfileProcess(r: TmpRequestResp<typeof fetchReportProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    id: resp.id,
    content: resp.content,
    reply_content: resp.reply_content,
    created_at: dayjs(resp.created_at).format("YYYY-MM-DD HH:mm"),
  });
}
