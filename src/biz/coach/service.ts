/**
 * @file 教练详情
 */
import dayjs from "dayjs";
import { request } from "@/biz/requests";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result, UnpackedResult } from "@/domains/result";
import { TheResponseOfFetchFunction } from "@/domains/request";
import { Unpacked } from "@/types";
import { parseJSONStr } from "@/utils";

export function fetchCoachProfile(body: { id: number }) {
  return request.post<{
    id: number;
    nickname: string;
    avatar_url: string;
    bio: string;
    accounts: {
      name: string;
      logo_url: string;
      account_url: string;
    }[];
    contact: {
      email: string;
      phone: string;
      wechat: string;
    };
  }>("/api/coach/profile", body);
}
