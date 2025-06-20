/**
 * @file 应用实例，也可以看作启动入口，优先会执行这里的代码
 * 应该在这里进行一些初始化操作、全局状态或变量的声明
 */
import { request } from "@/biz/requests";
import { UserCore } from "@/biz/user/index";
import { fetchWorkoutActionList, fetchWorkoutActionListProcess } from "@/biz/workout_action/services";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { fetchMuscleList, fetchMuscleListProcess } from "@/biz/muscle/services";
import { ListCore } from "@/domains/list/index";
import { ImageCore } from "@/domains/ui/index";
import { Application } from "@/domains/app/index";
import { NavigatorCore } from "@/domains/navigator/index";
import { RouteViewCore } from "@/domains/route_view";
import { RouteConfig } from "@/domains/route_view/utils";
import { HistoryCore } from "@/domains/history/index";
import { connect as connectApplication } from "@/domains/app/connect.web";
import { connect as connectHistory } from "@/domains/history/connect.web";
import { onCreateScrollView } from "@/domains/ui/scroll-view";
import { onRequestCreated, RequestCore } from "@/domains/request/index";
import { Result } from "@/domains/result/index";
import { query_stringify } from "@/utils";

import { PageKeys, routes, routesWithPathname } from "./routes";
import { client } from "./request";
import { storage } from "./storage";

// if (window.location.hostname === "t.fithub.top") {
//   request.setEnv("dev");
// }
onRequestCreated((ins) => {
  ins.beforeRequest(() => {
    user.refreshToken();
  });
  ins.onFailed((e) => {
    // console.log("[STORE]store/index - onRequestCreated ins.onFailed", e.code);
    app.tip({
      text: [e.message ?? "未知错误"],
    });
    if (e.code === 900) {
      user.logout();
    }
    if (e.code === 401) {
      user.logout();
    }
  });
  if (!ins.client) {
    ins.client = client;
  }
});
onCreateScrollView((ins) => ins.os === app.env);
NavigatorCore.prefix = import.meta.env.BASE_URL;
ImageCore.prefix = window.location.origin;

class ExtendsUser extends UserCore {
  say() {
    console.log(`Hello, My name is ${this.nickname}`);
  }
}
const user = new ExtendsUser(storage.get("user"), client);
const router = new NavigatorCore({
  location: window.location,
});
const view = new RouteViewCore({
  name: "root",
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
});
view.isRoot = true;
export const history = new HistoryCore<PageKeys, RouteConfig<PageKeys>>({
  view,
  router,
  routes,
  views: {
    root: view,
  } as Record<PageKeys, RouteViewCore>,
});
// @todo 临时解决方案
let _pending_redirect: null | { name: PageKeys; pathname: string; query: Record<string, string> } = null;
export const app = new Application({
  user,
  storage,
  async beforeReady() {
    const { pathname, query } = history.$router;
    const route = routesWithPathname[pathname];
    console.log("[ROOT]onMount", pathname, query, route, app.$user.isLogin);
    client.appendHeaders({
      Authorization: app.$user.token,
    });
    request.appendHeaders({
      Authorization: app.$user.token,
    });
    if (query.token) {
      user.setToken(`Bearer ${query.token}`);
      request.appendHeaders({
        Authorization: user.token,
      });
    }
    if (!route) {
      history.push("root.notfound");
      return Result.Ok(null);
    }
    if (!route.options?.require?.includes("login")) {
      if (!history.isLayout(route.name)) {
        history.push(route.name, query, { ignore: true });
        return Result.Ok(null);
      }
      history.push("root.home_layout.index");
      return Result.Ok(null);
    }
    console.log("[STORE]beforeReady - before if (!app.$user.isLogin", app.$user.isLogin, route.pathname);
    if (!app.$user.isLogin) {
      app.tip({
        text: ["请先登录"],
      });
      if (route.name !== "root.home_layout.index" && route.name !== "root") {
        _pending_redirect = {
          name: route.name,
          pathname,
          query,
        };
      }
      history.push("root.login");
      return Result.Ok(null);
    }
    console.log("before client.appendHeaders", app.$user.token);
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return Result.Ok(null);
    }
    history.push("root.home_layout.index");
    return Result.Ok(null);
  },
});

// setTimeout(() => {
//   user.refreshToken();
// }, 1000 * 60 * 10);

export const $workout_action_list = new ListCore(
  new RequestCore(fetchWorkoutActionList, {
    process: fetchWorkoutActionListProcess,
    client,
  }),
  {
    pageSize: 24,
  }
);
// export const $muscle_select = new ListCore(
//   new RequestCore(fetchMuscleList, {
//     process: fetchMuscleListProcess,
//     client,
//   })
// );
// export const $equipment_select = new ListCore(
//   new RequestCore(fetchEquipmentList, {
//     process: fetchEquipmentListProcess,
//     client,
//   })
// );

app.setEnv({
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
});
connectApplication(app);
connectHistory(history);
history.onClickLink(({ href, target }) => {
  const { pathname, query } = NavigatorCore.parse(href);
  const route = routesWithPathname[pathname];
  // console.log("[ROOT]history.onClickLink", pathname, query, route);
  if (!route) {
    app.tip({
      text: ["没有匹配的页面"],
    });
    return;
  }
  if (target === "_blank") {
    const u = history.buildURLWithPrefix(route.name, query);
    window.open(u);
    return;
  }
  history.push(route.name, query);
  return;
});
history.onRouteChange(({ ignore, reason, view, href }) => {
  // console.log("[ROOT]rootView.onRouteChange", href);
  const { title } = view;
  app.setTitle(title);
  if (ignore) {
    return;
  }
  if (app.env.ios) {
    return;
  }
  // if (reason === "push") {
  //   history.$router.pushState(href);
  // }
  // if (reason === "replace") {
  //   history.$router.replaceState(href);
  // }
});
user.onLogin((profile) => {
  storage.set("user", profile);
  client.appendHeaders({
    Authorization: user.token,
  });
  request.appendHeaders({
    Authorization: user.token,
  });
  // console.log("before history.destroyAllAndPush", history.routes)
  if (_pending_redirect) {
    history.replace(_pending_redirect.name, _pending_redirect.query);
    _pending_redirect = null;
    return;
  }
  history.destroyAllAndPush("root.home_layout.index");
});
user.onTokenRefresh((profile) => {
  storage.set("user", profile);
  client.appendHeaders({
    Authorization: user.token,
  });
  request.appendHeaders({
    Authorization: user.token,
  });
});
user.onLogout(() => {
  storage.clear("user");
  history.destroyAllAndPush("root.login");
});
user.onExpired(() => {
  storage.clear("user");
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
  history.destroyAllAndPush("root.login");
});
user.onError((e) => {
  app.tip({
    text: [e.message],
  });
});
