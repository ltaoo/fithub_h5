import dayjs from "dayjs";

import { request } from "@/biz/requests";
import { SubscriptionStatus, SubscriptionStatusTextMap } from "@/biz/subscription/constants";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";

/**
 * 用户登录
 * @param body
 * @returns
 */
export function login(body: { email: string; password: string }) {
  return request.post<{
    id: string;
    nickname: string;
    avatar_url: string;
    verified: string;
    token: string;
    expires_at: number;
  }>("/api/auth/web_login", {
    email: body.email,
    password: body.password,
  });
}

/**
 * 用户注册
 * @param body
 * @returns
 */
export function register(body: { email: string; password: string }) {
  return request.post<{
    id: string;
    nickname: string;
    avatar_url: string;
    verified: string;
    token: string;
    expires_at: number;
  }>("/api/auth/web_register", {
    email: body.email,
    password: body.password,
  });
}

export function logout(body: { email: string; password: string }) {
  return request.post("/api/auth/web_logout", body);
}

export function refresh_token() {
  return request.post<{ token: string; expires_at: number }>("/api/auth/refresh_token", {});
}

export function get_token() {
  return request.post("/api/token", {});
}

/**
 * 获取当前登录用户信息详情
 * @returns
 */
export function fetch_user_profile() {
  return request.post<{
    id: number;
    uid: string;
    nickname: string;
    avatar_url: string;
    subscription: {
      status: SubscriptionStatus;
      name: string;
      expired_at: string;
      count: number;
    };
    no_account: boolean;
  }>("/api/auth/profile");
}
export function fetch_user_profile_process(r: TmpRequestResp<typeof fetch_user_profile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const v = r.data;
  return Result.Ok({
    ...v,
    subscription: {
      ...v.subscription,
      name: (() => {
        if (v.subscription.count === 9999) {
          return "终身VIP";
        }
        return v.subscription.name;
      })(),
      status_text: SubscriptionStatusTextMap[v.subscription.status],
      expired_at_text: v.subscription.count === 9999 ? null : dayjs(v.subscription.expired_at).format("YYYY-MM-DD"),
    },
    no_account: v.no_account,
  });
}

export function validate(token: string) {
  return request.post<{ token: string }>("/api/auth/validate", { token });
}

export function update_user_profile(body: Partial<{ nickname: string; avatar_url: string }>) {
  return request.post("/api/auth/update_profile", body);
}

export function createAccount(body: { email: string; password: string }) {
  return request.post<{
    id: string;
    nickname: string;
    avatar_url: string;
    verified: string;
    token: string;
    expires_at: number;
  }>("/api/auth/create_account", body);
}
