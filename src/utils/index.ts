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

export function toFixed(v: any, n: number = 2) {
  return Number(Number(v).toFixed(n));
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

const defaultRandomAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export function random_key(length: number) {
  return random_string_with_alphabet(length, defaultRandomAlphabet);
}
function random_string_with_alphabet(length: number, alphabet: string) {
  let b = new Array(length);
  let max = alphabet.length;
  for (let i = 0; i < b.length; i++) {
    let n = Math.floor(Math.random() * max);
    b[i] = alphabet[n];
  }
  return b.join("");
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

export function seconds_to_hour_minute_seconds(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = Math.floor(value - hours * 3600 - minutes * 60);
  return {
    hours,
    minutes,
    seconds,
  };
}
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
  const { hours, minutes, seconds } = seconds_to_hour_minute_seconds(value);
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

export function hour_text_to_seconds(text: string) {
  const matched = text.match(/[0-9]{1,}:[0-9]{1,}$/);
  if (!matched) {
    return 0;
  }
  const parts = text.split(":");
  const { hours, minutes, seconds } = (() => {
    if (parts.length === 3) {
      return {
        hours: Number(parts[0]),
        minutes: Number(parts[1]),
        seconds: Number(parts[2]),
      };
    }
    return {
      hours: 0,
      minutes: Number(parts[0]),
      seconds: Number(parts[1]),
    };
  })();
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export function seconds_to_hour_text(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = Math.floor(value - hours * 3600 - minutes * 60);
  if (hours > 0) {
    return hours + ":" + padding_zero(minutes) + ":" + padding_zero(seconds);
  }
  return padding_zero(minutes) + ":" + padding_zero(seconds);
}
export function seconds_to_minutes(value: number) {
  // const hours = Math.floor(value / 3600);
  const minutes = Math.floor(value / 60);
  // const seconds = Math.floor(value - hours * 3600 - minutes * 60);
  return padding_zero(minutes);
}

export function relative_time_from_now(time: string) {
  const date = dayjs(time);
  const now = dayjs();
  const diffMonths = now.diff(date, "month");
  const diffWeeks = now.diff(date, "week");
  const diffDays = now.diff(date, "day");
  const diffHours = now.diff(date, "hour");
  const diffMinutes = now.diff(date, "minute");
  const diffSeconds = now.diff(date, "second");

  let str;
  if (diffMonths >= 6) {
    // 半年以上，显示完整时间
    str = date.format("YYYY-MM-DD HH:mm");
  } else if (diffMonths >= 1) {
    // 1个月以上，显示几个月前
    str = `${diffMonths}个月前`;
  } else if (diffWeeks >= 1) {
    // 1周以上，显示几周前
    str = `${diffWeeks}周前`;
  } else if (diffDays >= 1) {
    // 1天以上，显示几天前
    str = `${diffDays}天前`;
  } else if (diffHours >= 1) {
    // 1小时以上，显示几小时前
    str = `${diffHours}小时前`;
  } else if (diffMinutes >= 1) {
    // 1分钟以上，显示几分钟前
    str = `${diffMinutes}分钟前`;
  } else {
    // 1分钟内，显示"刚刚"
    str = "刚刚";
  }
  return str;
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
