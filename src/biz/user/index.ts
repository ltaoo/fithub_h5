import dayjs, { Dayjs } from "dayjs";

import { BaseDomain, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { Result } from "@/domains/result/index";

import { login, register, validate, fetch_user_profile, refresh_token } from "./services";

export enum Events {
  Tip,
  Error,
  Login,
  Logout,
  /** 身份凭证失效 */
  Expired,
  /** 凭证刷新 */
  TokenRefresh,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Tip]: string[];
  [Events.Error]: Error;
  [Events.Login]: UserState & { token: string; expires_at: number };
  [Events.Logout]: void;
  [Events.Expired]: void;
  [Events.TokenRefresh]: UserState & { token: string; expires_at: number };
  [Events.StateChange]: UserState;
};

type UserProps = {
  id: string;
  username: string;
  avatar: string;
  token: string;
  expires_at: number;
};
type UserState = UserProps & {
  // id: string;
  // username: string;
  // avatar: string;
  // token: string;
};

export class UserCore extends BaseDomain<TheTypesOfEvents> {
  name = "UserCore";
  debug = false;

  id = "";
  nickname = "Anonymous";
  avatar_url = "";
  token = "";
  expires_at: null | Dayjs = null;
  isLogin = false;
  needRegister = false;

  get state(): UserState {
    return {
      id: this.id,
      username: this.nickname,
      avatar: this.avatar_url,
      token: this.token,
      expires_at: this.expires_at ? this.expires_at.unix() : 0,
    };
  }
  values: Partial<{ email: string; password: string }> = {};
  $client: HttpClientCore;

  static Events = Events;

  constructor(props: Partial<{ _name: string }> & UserProps, client: HttpClientCore) {
    super(props);

    const { id, username, avatar, token, expires_at } = props;
    // console.log("[DOMAIN]user/index - initialize", props);
    this.id = id;
    this.nickname = username;
    this.avatar_url = avatar;
    this.isLogin = !!token;
    this.token = token;
    if (expires_at) {
      this.expires_at = dayjs(expires_at * 1000);
    }
    this.$client = client;
  }
  inputEmail(value: string) {
    this.values.email = value;
  }
  inputPassword(value: string) {
    this.values.password = value;
  }
  /** 校验用户凭证是否有效 */
  async validate() {
    if (!this.token) {
      this.emit(Events.Expired);
      return Result.Err("缺少 token");
    }
    const r = await new RequestCore(validate).run(this.token);
    if (r.error) {
      if (r.error.code === 900) {
        this.isLogin = false;
        this.emit(Events.Expired);
      }
      return Result.Err(r.error);
    }
    return Result.Ok(null);
  }
  /** 用户名密码登录 */
  async login() {
    const { email, password } = this.values;
    if (!email) {
      const msg = this.tip({ text: ["请输入邮箱"] });
      return Result.Err(msg);
    }
    if (!password) {
      const msg = this.tip({ text: ["请输入密码"] });
      return Result.Err(msg);
    }
    const r = await new RequestCore(login).run({ email, password });
    if (r.error) {
      this.tip({ text: ["登录失败", r.error.message] });
      return Result.Err(r.error);
    }
    this.values = {};
    this.isLogin = true;
    const { id, nickname, avatar_url, token, expires_at } = r.data;
    this.id = id;
    this.nickname = nickname;
    this.avatar_url = avatar_url;
    this.token = token;
    this.expires_at = dayjs(expires_at * 1000);
    this.emit(Events.Login, { ...this.state, token: this.token, expires_at: expires_at });
    return Result.Ok(r.data);
  }
  /** 退出登录 */
  logout() {
    this.isLogin = false;
    this.emit(Events.Logout);
  }
  async register() {
    console.log("[DOMAIN]user/index - register", this.values);
    const { email, password } = this.values;
    if (!email) {
      const msg = this.tip({ text: ["请输入邮箱"] });
      return Result.Err(msg);
    }
    if (!password) {
      const msg = this.tip({ text: ["请输入密码"] });
      return Result.Err(msg);
    }
    const r = await new RequestCore(register).run({ email, password });
    if (r.error) {
      this.tip({ text: ["注册失败", r.error.message] });
      return Result.Err(r.error);
    }
    this.values = {};
    this.isLogin = true;
    const { id, nickname, avatar_url, token, expires_at } = r.data;
    this.id = id;
    this.nickname = nickname;
    this.avatar_url = avatar_url;
    this.token = token;
    this.expires_at = dayjs(expires_at * 1000);
    this.needRegister = false;
    this.emit(Events.Login, { ...this.state, token: this.token, expires_at: expires_at });
    return Result.Ok(r.data);
  }
  async fetchProfile() {
    if (!this.isLogin) {
      return Result.Err("请先登录");
    }
    const r = await new RequestCore(fetch_user_profile).run();
    if (r.error) {
      return r;
    }
    return Result.Ok(r.data);
  }
  _refreshing = false;
  async refreshToken() {
    // console.log("[BIZ]user/index - refreshToken - before ", this._refreshing, this.expires_at);
    if (this._refreshing) {
      return;
    }
    if (!this.expires_at) {
      return;
    }
    const expires_at = dayjs(this.expires_at).subtract(8, "hour");
    const need_refresh = dayjs().isAfter(expires_at);
    // console.log(
    //   "[BIZ]user/index - refreshToken - before ",
    //   this.expires_at.format("YYYY-MM-DD HH:mm:ss"),
    //   expires_at.format("YYYY-MM-DD HH:mm:ss"),
    //   need_refresh
    // );
    if (need_refresh) {
      this._refreshing = true;
      const r = await new RequestCore(refresh_token, { client: this.$client, onFailed() {} }).run();
      this._refreshing = false;
      if (r.error) {
        return;
      }
      const { token, expires_at } = r.data;
      this.token = token;
      this.expires_at = dayjs(expires_at * 1000);
      this.emit(Events.TokenRefresh, { ...this.state, token: this.token, expires_at: expires_at });
    }
  }
  setToken(v: string) {
    this.token = v;
    this.isLogin = !!v;
  }

  onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
    return this.on(Events.Error, handler);
  }
  onLogin(handler: Handler<TheTypesOfEvents[Events.Login]>) {
    return this.on(Events.Login, handler);
  }
  onLogout(handler: Handler<TheTypesOfEvents[Events.Logout]>) {
    return this.on(Events.Logout, handler);
  }
  onExpired(handler: Handler<TheTypesOfEvents[Events.Expired]>) {
    return this.on(Events.Expired, handler);
  }
  onTokenRefresh(handler: Handler<TheTypesOfEvents[Events.TokenRefresh]>) {
    return this.on(Events.TokenRefresh, handler);
  }
}
