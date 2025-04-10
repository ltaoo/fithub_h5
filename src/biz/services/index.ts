/**
 *
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

export function fetchEquipmentList() {
  return request.post<{
    list: {
      id: number | string;
      name: string;
      zh_name: string;
      overview: string;
      media: string;
    }[];
    total: number;
  }>("/api/equipment/list", {});
}

export function fetchEquipmentListProcess(r: TmpRequestResp<typeof fetchEquipmentList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  return Result.Ok({
    list: r.data.list.map((equipment) => {
      return {
        id: equipment.id,
        name: equipment.name,
        zh_name: equipment.zh_name,
        overview: equipment.overview,
        media: equipment.media ? JSON.parse(equipment.media) : {},
      };
    }),
    total: r.data.total,
  });
}

export type WorkoutEquipmentProfile = UnpackedResult<ReturnType<typeof fetchEquipmentListProcess>>["list"][number];

export function createEquipment(params: { name: string; zh_name: string; overview: string; media: string }) {
  return request.post<void>("/api/equipment/create", params);
}
