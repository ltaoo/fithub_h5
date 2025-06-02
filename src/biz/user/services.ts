import { request } from "@/biz/requests";

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
  }>("/api/coach/login", {
    provider_type: "email_password",
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
  }>("/api/coach/register", {
    provider_type: "email_password",
    email: body.email,
    password: body.password,
  });
}

export function logout(body: { email: string; password: string }) {
  return request.post("/api/admin/user/logout", body);
}

export function get_token() {
  return request.post("/api/token", {});
}

/**
 * 获取当前登录用户信息详情
 * @returns
 */
export function fetch_user_profile() {
  return request.get<{
    nickname: string;
    avatar_url: string;
    subscription: {
      visible: boolean;
      text: string;
    };
  }>("/api/mine/profile");
}

/**
 * 成员通过授权链接访问首页时，验证该链接是否有效
 */
export function validate(token: string) {
  return request.post<{ token: string }>("/api/admin/user/validate", { token });
}
