import { request } from "@/biz/requests";

/**
 * 创建训练日
 * @param body
 * @returns
 */
export function createWorkoutDay(body: { workout_plan_id?: number; time: number }) {
  return request.post<{ id: number }>("/api/workout_day/create", body);
}

/**
 * 更新训练日内容
 * @param body
 * @returns
 */
export function updateWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/update", body);
}

/**
 * 完成训练日计划
 * @param body
 * @returns
 */
export function finishWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/finish", body);
}

/**
 * 删除训练日
 * @param body
 * @returns
 */
export function deleteWorkoutDay(body: { id: number }) {
  return request.post("/api/workout_day/delete", body);
}

/**
 * 获取训练日详情
 * @param body
 * @returns
 */
export function fetchWorkoutDayProfile(body: { id: number }) {
  return request.post<{
    started_at: number;
    finished_at: number;
    steps: {
      id: number;
      title: string;
    };
  }>("/api/workout_day/profile", body);
}

/**
 * 获取训练日当前进度
 * @param body
 * @returns
 */
export function fetchWorkoutDayCurStep(body: { id: number }) {
  return request.post<{
    id: number;
    title: string;
  }>("/api/workout_day/cur_step", body);
}

/**
 * 获取训练日列表
 * @param body
 * @returns
 */
export function fetchWorkoutDayList(body: { page: number; page_size: number }) {
  return request.post("/api/workout_day/list", body);
}
