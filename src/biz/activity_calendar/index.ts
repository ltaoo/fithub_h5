import dayjs, { Dayjs } from "dayjs";

import { base, Handler } from "@/domains/base";
import { update_arr_item } from "@/utils/index";

export function ActivityCalendar<T extends { day: string }>(props: { x: number; min: number }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setData(data: T[]) {
      for (let i = 0; i < _weeks.length; i += 1) {
        let _week = _weeks[i];
        for (let j = 0; j < _week.days.length; j += 1) {
          const day = _week.days[j];
          const matched = data.find((d) => d.day === day.day);
          if (matched) {
            _week.days = update_arr_item(_week.days, j, {
              ...day,
              payload: matched,
            });
            _weeks = update_arr_item(_weeks, i, {
              ..._week,
              days: _week.days,
            });
          }
        }
      }
      methods.refresh();
    },
    setMinDate(min: number) {
      const r = methods.getPastWeeks(_today, _x, min);
      _weeks = r.weeks;
      _day_count = r.day_count;
      return _day_count;
    },
    /**
     * @param today 当前日期
     * @param count 周数
     * @param min 最小日期，时间戳
     * @returns
     */
    getPastWeeks(today: Dayjs, count: number, min: number) {
      let day_count = 0;
      const weeks = [];
      // 当前时间是周几
      const day_of_week = today.day();
      // 当前时间所在周的周一
      const cur_monday = dayjs(_today).startOf("week");
      // console.log("min", dayjs(min * 1000).format("YYYY/MM/DD"));
      for (let i = 0; i < count; i++) {
        (() => {
          const days = [];
          const week_num = i + 1;
          for (let j = 0; j < 7; j++) {
            // j 表达的是周几，或者说一周的第几天 0第一天 1第二天 这样类推
            (() => {
              // 就是当周的天，从周一开始。比如当天是 2024/09/20周五，那么根据 j 获取到的分别是
              // 2024/09/16周一 2024/09/17周二 2024/09/18周三 2024/09/19周四 2024/09/20周五 2024/09/21周六 2024/09/22周日
              const date = cur_monday.clone().add(j - i * 7, "day");
              // console.log("[BIZ]activity_calendar - date", dayjs(date).format("YYYY/MM/DD"));
              if (i === 0 && j >= day_of_week) {
                return;
              }
              days.push({
                day: date.format("YYYY-MM-DD"),
                payload: null as null | T,
                hidden: (() => {
                  if (!min) {
                    return false;
                  }
                  return date.isBefore(
                    dayjs(min * 1000)
                      .set("hour", 0)
                      .set("minute", 0)
                      .set("second", 0)
                  );
                })(),
              });
              day_count += 1;
            })();
          }
          if (days.length) {
            weeks.unshift({ index: week_num, days: days });
          }
        })();
      }
      return {
        weeks,
        day_count,
      };
    },
  };

  // let _today = new Date("2024/09/18");
  let _today = dayjs();
  let _x = props.x;
  let r = methods.getPastWeeks(_today, _x, props.min);
  let _weeks = r.weeks;
  let _day_count = r.day_count;
  const _state = {
    get weeks() {
      return _weeks;
    },
    get day_count() {
      return _day_count;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    state: _state,
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ActivityCalendar = ReturnType<typeof ActivityCalendar>;
