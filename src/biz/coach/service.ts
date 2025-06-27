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
import { parseJSONStr, seconds_to_hour_text, toFixed } from "@/utils";

import { CoachArticleType } from "./constants";

export function fetchCoachProfile(body: { uid: number }) {
  return request.post<{
    id: number;
    uid: string;
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

export function fetchArticleList(body: Partial<FetchParams>) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      overview: string;
      type: CoachArticleType;
      creator: {
        nickname: string;
        avatar_url: string;
      };
      created_at: string;
    }>
  >("/api/content/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}

export function createArticle(body: {
  title: string;
  overview: string;
  type: CoachArticleType;
  video_url: string;
  time_points: {
    time: number;
    workout_action_id: number;
    text: string;
  }[];
}) {
  return request.post<{ id: number }>("/api/content/create", body);
}

export function updateArticle(body: {
  id: number;
  title: string;
  overview: string;
  type: CoachArticleType;
  video_url: string;
  time_points: {
    id?: number;
    time: number;
    workout_action_id: number;
    text: string;
  }[];
}) {
  return request.post<{ id: number }>("/api/content/update", body);
}

export function fetchArticleProfile(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
    overview: string;
    type: CoachArticleType;
    video_url: string;
    time_points: {
      id: number;
      time: number;
      text: string;
      workout_action: null | {
        id: number;
        zh_name: string;
        score: number;
      };
    }[];
    is_author: boolean;
    creator: {
      nickname: string;
      avatar_url: string;
    };
    created_at: string;
  }>("/api/content/profile", body);
}

const WorkoutActionScoreTextArr = [
  "F-",
  "F-",
  "F",
  "F+",
  "D-",
  "D",
  "D+",
  "C-",
  "C",
  "C+",
  "B-",
  "B",
  "B+",
  "A-",
  "A",
  "A+",
  "S-",
  "S",
  "S+",
];
export function fetchArticleProfileProcess(r: TmpRequestResp<typeof fetchArticleProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const v = r.data;
  return Result.Ok({
    ...v,
    overview: v.overview.split("\n"),
    time_points: v.time_points.map((v) => {
      return {
        ...v,
        text: v.text.split("\n"),
        time_text: seconds_to_hour_text(v.time),
        score: (() => {
          if (!v.workout_action) {
            return null;
          }
          if (!v.workout_action.score) {
            return null;
          }
          return {
            text: WorkoutActionScoreTextArr[v.workout_action.score],
            position: toFixed((v.workout_action.score / 18) * 100, 0),
          };
        })(),
      };
    }),
    created_at: dayjs(v.created_at).format("YYYY-MM-DD HH:mm"),
  });
}

export function refreshWorkoutStats() {
  return request.post("/api/refresh_workout_stats");
}
