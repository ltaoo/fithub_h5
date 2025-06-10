import { StorageCore } from "@/domains/storage/index";
import { Result } from "@/domains/result/index";

import { Application } from "./index";
import { ThemeTypes } from "./types";

export function connect<T extends { storage: StorageCore<any> }>(app: Application<T>) {
  const ownerDocument = globalThis.document;
  app.getComputedStyle = (el: HTMLElement) => {
    return window.getComputedStyle(el);
  };
  app.setTitle = (title: string) => {
    document.title = title;
  };
  app.copy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };
  window.addEventListener("DOMContentLoaded", () => {
    // 1
    const { innerWidth, innerHeight } = window;
    app.setSize({ width: innerWidth, height: innerHeight });
  });
  window.addEventListener("orientationchange", function () {
    app.handleScreenOrientationChange(window.orientation);
  });
  window.addEventListener("load", () => {
    // console.log("2");
  });
  window.addEventListener("beforeunload", (event) => {
    // // 取消事件
    // event.preventDefault();
    // // Chrome 以及大部分浏览器需要返回值
    // event.returnValue = "";
    // // 弹出提示框
    // const confirmationMessage = "确定要离开页面吗？";
    // (event || window.event).returnValue = confirmationMessage;
    // return confirmationMessage;
  });
  window.addEventListener("resize", () => {
    const { innerWidth, innerHeight } = window;
    const size = {
      width: innerWidth,
      height: innerHeight,
    };
    // 旋转屏幕/进入全屏会触发这里（安卓）
    // app.handleResize(size);
  });
  window.addEventListener("blur", () => {
    app.emit(app.Events.Blur);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      app.emit(app.Events.Hidden);
      return;
    }
    app.emit(app.Events.Show);
  });
  /**
   * 环境变量 ------------
   */
  const userAgent = navigator.userAgent;
  const ua = userAgent.toLowerCase();
  const ios = /iPad|iPhone|iPod/.test(userAgent);
  const android = /Android/.test(userAgent);
  app.setEnv({
    wechat: ua.indexOf("micromessenger") !== -1,
    ios,
    android,
    pc: !ios && !android,
  });
  console.log("[DOMAIN]app/connect - after app.setEnv", app.env);
  /**
   * 主题 ——-------------
   */
  const MediaColorSchemeDarkText = "(prefers-color-scheme: dark)";
  // const media = window.matchMedia(MediaColorSchemeDarkText);
  // let cur_theme = "light";

  /**
   * 获取系统的主题色
   */
  function get_system_theme() {
    try {
      console.log("[Domain]app/connect - handleMediaQuery");
      const r = window.matchMedia(MediaColorSchemeDarkText);
      // 看别人代码，还判断了 m.media != r，打印 m.media 就是 MediaColorSchemeDarkText 文本
      // 如果不相同，应该是 light，但是别人代码是 dark，搞不懂
      if (r.matches) {
        return "dark";
      }
      return "light";
    } catch (err) {
      const e = err as Error;
      // return Result.Err(e.message);
      return "light";
    }
  }
  function get_theme(): ThemeTypes {
    // const existing_theme = app.$storage.get("theme");
    const existing_theme = localStorage.getItem("theme") as ThemeTypes;
    if (!existing_theme || existing_theme === "system") {
      return get_system_theme();
    }
    if (color_schemes.includes(existing_theme)) {
      return existing_theme;
    }
    return "light";
  }
  const theme_attribute_key = "data-theme";
  function set_theme(theme: ThemeTypes) {
    if (theme === "system") {
      const v = get_system_theme();
      set_theme(v);
      return;
    }
    const d = document.documentElement;
    // 设置主题，核心就这两行代码
    d.setAttribute(theme_attribute_key, theme);
    d.style.colorScheme = theme;
    return Result.Ok(null);
  }
  const color_schemes = ["light", "dark"];
  app.theme = get_theme();

  app.setTheme = (theme: ThemeTypes) => {
    set_theme(theme);
    app.theme = theme;
    app.emit(app.Events.StateChange, { ...app.state });
    localStorage.setItem("theme", theme);
    // app.$storage.set("theme", theme);
    return Result.Ok(null);
  };
  app.getTheme = get_theme;
  const { availHeight, availWidth } = window.screen;
  if (window.navigator.userAgent.match(/iphone/i)) {
    const matched = [
      // iphonex iphonexs iphone12mini
      "375-812",
      // iPhone XS Max iPhone XR
      "414-896",
      // iPhone pro max iPhone14Plus
      "428-926",
      // iPhone 12/pro 13/14  753
      "390-844",
      // iPhone 14Pro
      "393-852",
      // iPhone 14ProMax
      "430-932",
    ].includes(`${availWidth}-${availHeight}`);
    app.safeArea = !!matched;
  }
  ownerDocument.addEventListener("keydown", (event) => {
    const { key } = event;
    app.keydown({ key });
  });

  const originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
  app.disablePointer = () => {
    ownerDocument.body.style.pointerEvents = "none";
  };
  app.enablePointer = () => {
    ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
  };
}
