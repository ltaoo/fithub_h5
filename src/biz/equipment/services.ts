/**
 * @file 健身设备、器械
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

export function fetchEquipmentList(body: Partial<FetchParams> & { ids: number[] }) {
  return request.post<
    ListResponse<{
      id: number;
      name: string;
      zh_name: string;
      overview: string;
      tags: string;
      alias: string;
      sort_idx: number;
      medias: string;
    }>
  >("/api/equipment/list", {
    page_size: body.pageSize,
    page: body.page,
    ids: body.ids,
  });
}
export function fetchEquipmentListProcess(r: TmpRequestResp<typeof fetchEquipmentList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    ...r.data,
    list: r.data.list.map((v) => {
      return {
        id: v.id,
        name: v.name,
        zh_name: v.zh_name,
        alias: v.alias,
        overview: v.overview,
        tags: v.tags.split(",").filter(Boolean),
        sort_idx: v.sort_idx,
        medias: (() => {
          const r = parseJSONStr<{ pics: string[] }>(v.medias);
          if (r.error) {
            return {
              pics: [] as string[],
            };
          }
          return {
            pics: r.data.pics ?? [],
          };
        })(),
      };
    }),
  });
}

export type WorkoutEquipmentProfile = UnpackedResult<ReturnType<typeof fetchEquipmentListProcess>>["list"][number];

type EquipmentBody = {
  name: string;
  zh_name: string;
  alias: string;
  overview: string;
  sort_idx: number;
  medias: string;
};
export function createEquipment(body: EquipmentBody) {
  return request.post<void>("/api/equipment/create", body);
}

export function updateEquipment(body: EquipmentBody & { id: number }) {
  return request.post<void>("/api/equipment/update", body);
}
