import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relative_time from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";

import { Result } from "@/domains/result/index";
import { JSONObject } from "@/types/index";

import { cn as nzhcn } from "./nzh";

dayjs.extend(relative_time);
dayjs.locale("zh-cn");

export function cn(...inputs: any[]) {
  return twMerge(inputs);
}

/** 解析一段 json 字符串 */
export function parseJSONStr<T extends any>(json: string) {
  try {
    if (json[0] !== "{" && json[0] !== "[") {
      return Result.Err("不是合法的 json");
    }
    const d = JSON.parse(json);
    return Result.Ok(d as T);
  } catch (err) {
    const e = err as Error;
    return Result.Err(e);
  }
}

export function uidFactory() {
  let _uid = 0;
  return function uid() {
    _uid += 1;
    return _uid;
  };
}

export function padding_zero(str: number | string) {
  if (String(str).length === 1) {
    return `0${str}`;
  }
  return String(str);
}
export function remove_str(filename: string, index: number = 0, length: number) {
  return filename.slice(0, index) + filename.slice(index + length);
}

export function episode_to_chinese_num(str: string) {
  const regex = /(\d+)/g;
  let s = str.replace(/[eE]/g, "");
  const matches = s.match(regex);
  if (!matches) {
    return str;
  }
  for (let i = 0; i < matches.length; i++) {
    const num = parseInt(matches[i], 10);
    const chinese_num = num_to_chinese(num);
    s = s.replace(matches[i], `第${chinese_num}集`);
  }
  return s;
}
export function season_to_chinese_num(str: string) {
  const num = str.match(/[0-9]{1,}/);
  if (!num) {
    return str;
  }
  const value = parseInt(num[0]);
  const chinese_num = num_to_chinese(value);
  const correct = chinese_num.match(/^一(十.{0,1})/);
  if (correct) {
    return `第${correct[1]}季`;
  }
  return `第${chinese_num}季`;
}
/**
 * 阿拉伯数字转中文数字
 * @param num
 * @returns
 */
export function num_to_chinese(num: number) {
  return nzhcn.encodeS(num);
}
export function chinese_num_to_num(str: string) {
  return nzhcn.decodeS(str);
}

export function update_arr_item<T>(arr: T[], index: number, v2: T) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), v2, ...arr.slice(index + 1)];
}
export function remove_arr_item<T>(arr: T[], index: number) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function has_value(v: any) {
  return v !== undefined && v !== null;
}
export function has_num_value(v: any) {
  return v !== undefined && v !== null && v !== "";
}

export function calc_bottom_padding_need_add(arg: {
  keyboard: { height: number; visible: boolean };
  object: { x: number; y: number; width: number; height: number };
  screen: { width: number; height: number };
}) {
  const { keyboard, object, screen } = arg;
  const y = object.y + object.height;
  const space_height_place_keyboard = screen.height - y;
  console.log("space_height_place_keyboard", space_height_place_keyboard);
  if (keyboard.visible) {
    return 0;
  }
  if (space_height_place_keyboard < keyboard.height) {
    return keyboard.height - space_height_place_keyboard;
  }
  return 0;
}

/**
 * 将对象转成 search 字符串，前面不带 ?
 * @param query
 * @returns
 */
export function query_stringify(query?: null | JSONObject) {
  if (query === null) {
    return "";
  }
  if (query === undefined) {
    return "";
  }
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      // @ts-ignore
      return `${key}=${encodeURIComponent(query[key])}`;
    })
    .join("&");
}
export function query_parse(url: string, opt: {} = {}): Record<string, string> {
  let u = url.replace(/^\?/, "");
  const segments = u.split("&");
  const query = segments
    .map((seg) => {
      const [k, v] = seg.split("=");
      return {
        [k]: v,
      };
    })
    .reduce((a, b) => {
      return { ...a, ...b };
    }, {});
  return query;
}

export function bytes_to_size(bytes: number) {
  if (!bytes) {
    return "0KB";
  }
  if (bytes === 0) {
    return "0KB";
  }
  const symbols = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let exp = Math.floor(Math.log(bytes) / Math.log(1024));
  if (exp < 1) return bytes + " " + symbols[0];
  bytes = Number((bytes / Math.pow(1024, exp)).toFixed(2));
  const size = bytes;
  const unit = symbols[exp];
  if (Number.isInteger(size)) {
    return `${size}${unit}`;
  }
  function remove_zero(num: number | string) {
    let result = Number(num);
    if (String(num).indexOf(".") > -1) {
      result = parseFloat(num.toString().replace(/0+?$/g, ""));
    }
    return result;
  }
  return `${remove_zero(size.toFixed(2))}${unit}`;
}

export const seconds_to_hour_template1 = {
  hours(v: { value: number; text: string }) {
    return `${v.text}小时`;
  },
  minutes(v: { value: number; text: string; hours: string }) {
    return v.hours ? `${v.text}分钟` : `${v.value}分钟`;
  },
  seconds(v: { value: number; text: string }) {
    return "";
  },
};
/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export function seconds_to_hour_with_template(
  value: number,
  templates: {
    hours: (v: { value: number; text: string }) => string;
    minutes: (v: { value: number; text: string; hours: string }) => string;
    seconds: (v: { value: number; text: string }) => string;
  }
) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = Math.floor(value - hours * 3600 - minutes * 60);

  let str = "";
  let hours_text = "";
  if (hours > 0 && templates.hours) {
    hours_text = templates.hours({
      value: hours,
      text: String(hours),
    });
    str += hours_text;
  }
  if (templates.minutes) {
    str += templates.minutes({
      value: minutes,
      text: padding_zero(minutes),
      hours: hours_text,
    });
  }
  if (templates.seconds) {
    str += templates.seconds({
      value: seconds,
      text: padding_zero(seconds),
    });
  }
  return str;
}

/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export function seconds_to_hour(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = Math.floor(value - hours * 3600 - minutes * 60);
  if (hours > 0) {
    return hours + ":" + padding_zero(minutes) + ":" + padding_zero(seconds);
  }
  return padding_zero(minutes) + ":" + padding_zero(seconds);
}

export function relative_time_from_now(time: string) {
  const date = dayjs(time);
  const now = dayjs();
  const minute_diff = now.diff(date, "minute");
  let relativeTimeString;
  if (minute_diff >= 7 * 24 * 60) {
    relativeTimeString = "7天前";
  } else if (minute_diff >= 24 * 60) {
    relativeTimeString = now.diff(date, "day") + "天前"; // 显示天数级别的时间差
  } else if (minute_diff >= 60) {
    relativeTimeString = now.diff(date, "hour") + "小时前"; // 显示小时级别的时间差
  } else if (minute_diff > 0) {
    relativeTimeString = minute_diff + "分钟前"; // 显示分钟级别的时间差
  } else {
    relativeTimeString = "刚刚"; // 不到1分钟，显示“刚刚”
  }
  return relativeTimeString;
}

export function noop() {}
export function promise_noop() {
  return Promise.resolve();
}

/**
 * 延迟指定时间
 * @param delay 要延迟的时间，单位毫秒
 * @returns
 */
export function sleep(delay: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, delay);
  });
}

export function buildRegexp(value: string) {
  try {
    const regexp = new RegExp(value);
    return Result.Ok(regexp);
  } catch (err) {
    const e = err as Error;
    return Result.Err(e.message);
  }
}

export const video_file_type_regexp =
  /\.[mM][kK][vV]$|\.[mM][pP]4$|\.[tT][sS]$|\.[fF][lL][vV]$|\.[rR][mM][vV][bB]$|\.[mM][oO][vV]$/;
export function is_video_file(filename: string) {
  return video_file_type_regexp.test(filename);
}
