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
import { BizError } from "@/domains/error/index";
import { RouteViewCore } from "@/domains/route_view";
import { RouteConfig } from "@/domains/route_view/utils";
import { HistoryCore } from "@/domains/history/index";
import { connect as connectApplication } from "@/domains/app/connect.web";
import { connect as connectHistory } from "@/domains/history/connect.web";
import { onCreateScrollView } from "@/domains/ui/scroll-view";
import { onRequestCreated, RequestCore } from "@/domains/request/index";
import { Result } from "@/domains/result/index";

import { PageKeys, routes, routesWithPathname } from "./routes";
import { client } from "./request";
import { storage } from "./storage";

if (window.location.hostname === "t.fithub.top") {
  request.setEnv("dev");
}
onRequestCreated((ins) => {
  ins.onFailed((e) => {
    app.tip({
      text: [e.message],
    });
    if (e.code === 900) {
      history.push("root.login");
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
    console.log(`My name is ${this.nickname}`);
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
export const app = new Application({
  user,
  storage,
  async beforeReady() {
    const { pathname, query } = history.$router;
    const route = routesWithPathname[pathname];
    console.log("[ROOT]onMount", pathname, route, app.$user.isLogin);
    client.appendHeaders({
      Authorization: app.$user.token,
    });
    request.appendHeaders({
      Authorization: app.$user.token,
    });
    if (!route) {
      history.push("root.notfound");
      return Result.Ok(null);
    }
    // if (!route.options?.require?.includes("login")) {
    //   if (!history.isLayout(route.name)) {
    //     history.push(route.name, query, { ignore: true });
    //     return Result.Ok(null);
    //   }
    //   return Result.Err("can't goto layout");
    // }
    // console.log("[STORE]beforeReady - before if (!app.$user.isLogin", app.$user.isLogin);
    // if (!app.$user.isLogin) {
    //   app.tip({
    //     text: ["请先登录"],
    //   });
    //   history.push("root.login", { redirect: route.pathname });
    //   return Result.Err("need login");
    // }
    console.log("before client.appendHeaders", app.$user.token);
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return Result.Ok(null);
    }
    history.push("root.home_layout.index");
    return Result.Ok(null);
  },
});

export const $workout_action_list = new ListCore(
  new RequestCore(fetchWorkoutActionList, {
    process: fetchWorkoutActionListProcess,
    client,
  })
);
export const $muscle_select = new ListCore(
  new RequestCore(fetchMuscleList, {
    process: fetchMuscleListProcess,
    client,
  })
);
export const $equipment_select = new ListCore(
  new RequestCore(fetchEquipmentList, {
    process: fetchEquipmentListProcess,
    client,
  })
);

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
  if (reason === "push") {
    history.$router.pushState(href);
  }
  if (reason === "replace") {
    history.$router.replaceState(href);
  }
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onLogin((profile) => {
  storage.set("user", profile);
  client.appendHeaders({
    Authorization: user.token,
  });
  request.appendHeaders({
    Authorization: user.token,
  });
  history.push("root.home_layout.index");
});
user.onLogout(() => {
  storage.clear("user");
  history.push("root.login");
});
user.onExpired(() => {
  storage.clear("user");
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
  history.push("root.login");
});
