import dayjs from "dayjs";

import { SetValueUnit } from "@/biz/input_set_value";
import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    avatar: "",
    token: "",
    expires_at: 0,
  },
  theme: "",
  dialog_flags: {} as Record<string, { show_at: number }>,
};
const key = "a_global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: globalThis.localStorage,
});

export const dialogs: Record<
  string,
  Partial<{
    /**
     * 弹窗间隔
     * "always" 忽略间隔，每次都弹
     * "weekly" 自然周，每周只能弹一次
     * "daily"  自然天，每天只能弹一次
     * number   指定间隔小时，如 24，即当天 12 点弹过，只有到了明天 12 点之后，才能再次弹
     */
    interval: "always" | "weekly" | "daily" | "hourly" | number;
    /** 优先级 */
    priority: number;
  }>
> = {
  today_workout_schedule_tip: {
    priority: 100,
    interval: "daily",
  },
};
function get_dialog(name: keyof typeof dialogs) {
  const matched = dialogs[name];
  if (!matched) {
    return null;
  }
  return matched;
}
export function check_can_show_dialog(name: keyof typeof dialogs) {
  const now = dayjs().valueOf();
  const option = get_dialog(name);
  if (!option) {
    return false;
  }
  const { interval } = option;
  if (interval === "always") {
    return true;
  }
  const prev_showed_time = (() => {
    const v = storage.get("dialog_flags")[name];
    if (v) {
      return v.show_at;
    }
    return null;
  })();
  if (!prev_showed_time) {
    return true;
  }
  if (interval === "daily") {
    const range = [dayjs(now).clone().startOf("day"), dayjs(now).clone().endOf("day")];
    const isToday =
      dayjs(prev_showed_time).clone().isAfter(range[0]) && dayjs(prev_showed_time).clone().isBefore(range[1]);
    return !isToday;
  }
  if (interval === "hourly") {
    const range = [dayjs(now).clone().startOf("hour"), dayjs(now).clone().endOf("hour")];
    const isHour =
      dayjs(prev_showed_time).clone().isAfter(range[0]) && dayjs(prev_showed_time).clone().isBefore(range[1]);
    return !isHour;
  }
  return false;
}
export function mark_dialog_has_show(name: keyof typeof dialogs) {
  const now = dayjs().valueOf();
  storage.merge("dialog_flags", {
    [name]: {
      show_at: now,
    },
  });
}
export const qiniu_storage = new StorageCore(
  (() => {
    const QINIU_DEFAULT_CACHE_VALUES = {
      token: "",
    };
    const key = "qiniu";
    const existing = globalThis.localStorage.getItem(key);
    return {
      key,
      defaultValues: QINIU_DEFAULT_CACHE_VALUES,
      values: existing ? JSON.parse(existing) : QINIU_DEFAULT_CACHE_VALUES,
      client: globalThis.localStorage,
    };
  })()
);
