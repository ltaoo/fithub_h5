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

export function refreshWorkoutStats(body: { range_of_start: Date; range_of_end: Date }) {
  return request.post<{
    stats: {
      total_workout_days: number;
      total_workout_times: number;
    };
    action_stats: {
      action: string;
      records: {
        reps: number;
        reps_unit: string;
        weight: number;
        weight_unit: string;
        created_at: string;
      }[];
    }[];
    earliest_start_day: {
      duration: number;
      finished_at: string;
      id: number;
      started_at: string;
      total_volume: number;
      workout_plan: {
        id: number;
        overview: string;
        title: string;
        type: number;
      };
    };
    latest_finish_day: {
      duration: number;
      finished_at: string;
      id: number;
      started_at: string;
      total_volume: number;
      workout_plan: {
        id: number;
        overview: string;
        title: string;
        type: number;
      };
    };
    max_duration_day: {
      duration: number;
      finished_at: string;
      id: number;
      started_at: string;
      total_volume: number;
      workout_plan: {
        id: number;
        overview: string;
        title: string;
        type: number;
      };
    };
    max_streak: number;
    max_streak_range: {
      end: string;
      start: string;
    };
    max_volume_day: {
      duration: number;
      finished_at: string;
      id: number;
      started_at: string;
      total_volume: number;
      workout_plan: {
        id: number;
        overview: string;
        title: string;
        type: number;
      };
    };
    type_plan_map: Record<
      number,
      {
        workout_day_id: number;
        workout_plan: {
          id: number;
          title: string;
        };
      }[]
    >;
  }>("/api/refresh_workout_stats", body);
}

export function refreshWorkoutStatsProcess(r: TmpRequestResp<typeof refreshWorkoutStats>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const v = r.data;
  return Result.Ok({
    max_volume_day: v.max_volume_day,
    max_duration_day: v.max_duration_day,
    latest_finish_day: {
      ...v.latest_finish_day,
      finished_at_text: dayjs(v.latest_finish_day.finished_at).format("MM-DD HH:mm"),
    },
    earliest_start_day: {
      ...v.earliest_start_day,
      started_at_text: dayjs(v.earliest_start_day.started_at).format("MM-DD HH:mm"),
    },
    stats: v.stats,
    action_stats: v.action_stats
      ? v.action_stats.map((vv) => {
          return {
            ...vv,
            records: vv.records.map((vvv) => {
              return {
                ...vvv,
                created_at: dayjs(vvv.created_at).format("HH:mm"),
              };
            }),
          };
        })
      : [],
    ...(() => {
      const types = Object.keys(v.type_plan_map);
      const WorkoutPlanTypeTextMap: Record<string, string> = {
        "0": "未知",
        "1": "力量",
        "2": "有氧",
      };
      const text = [];
      const d = [];
      for (let i = 0; i < types.length; i += 1) {
        const t = types[i];
        const records = v.type_plan_map[Number(t)];
        // text.push({

        // });
        d.push({
          type_text: WorkoutPlanTypeTextMap[t],
          day_count: records.length,
          records,
        });
      }
      return {
        workout_day_group_with_type: d,
      };
    })(),
  });
}

export function refreshWorkoutActionStats(body: { range_of_start: Date; range_of_end: Date }) {
  return request.post("/api/refresh_workout_action_stats", body);
}

export function refreshWorkoutDays() {
  return request.post("/api/admin/workout_day/refresh_250630", {});
}
