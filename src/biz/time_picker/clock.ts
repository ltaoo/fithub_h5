/**
 * @file 时间
 */
import dayjs, { OpUnitType } from "dayjs";
// import dayjs from "@/packages/dayjs/index";

import { base, Handler } from "@/domains/base";
import { padding_zero } from "@/utils";

export function ClockModel(props: {
  /** 时间戳 */
  time: number;
  onRefresh?: (text: string) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setStartedAt(v: number) {
      //       console.log("[BIZ]countdown - setStartedAt", v);
      _started_at = v;
    },
    startOf(...args: Parameters<typeof _$date.startOf>) {
      return _$date.startOf(...args);
    },
    endOf(...args: Parameters<typeof _$date.endOf>) {
      return _$date.endOf(...args);
    },
    format(...args: Parameters<typeof _$date.format>) {
      return _$date.format(...args);
    },
    add(...args: Parameters<typeof _$date.add>) {
      return _$date.add(...args);
    },
    subtract(...args: Parameters<typeof _$date.subtract>) {
      return _$date.subtract(...args);
    },
    set(...args: Parameters<typeof _$date.set>) {
      return _$date.set(...args);
    },
    isBefore(...args: Parameters<typeof _$date.isBefore>) {
      return _$date.isBefore(...args);
    },
    isAfter(...args: Parameters<typeof _$date.isAfter>) {
      return _$date.isAfter(...args);
    },
    setYear(y: number) {
      // @ts-ignore
      _$date.$set("year", y);
      refresh_time_text();
    },
    setMonth(m: number) {
      // @ts-ignore
      _$date.$set("month", m - 1);
      refresh_time_text();
    },
    setDate(d: number) {
      // @ts-ignore
      _$date.$set("date", d);
      refresh_time_text();
    },
    setYearMonthDate(y: number, m: number, d: number) {
      // @ts-ignore
      _$date.$set("year", y);
      // @ts-ignore
      _$date.$set("month", m - 1);
      // @ts-ignore
      _$date.$set("date", d);
      //       console.log(_$date.format("YYYY-MM-DD HH:mm:ss"), y, m, d);
      refresh_time_text();
    },
    setHourAndMinute(h: number, m: number) {
      // @ts-ignore
      _$date.$set("hour", h);
      // @ts-ignore
      _$date.$set("minute", m);
      refresh_time_text();
    },
    setHour(v: number) {
      // @ts-ignore
      _$date.$set("hour", v);
      refresh_time_text();
    },
    setMinute(v: number) {
      // @ts-ignore
      _$date.$set("minute", v);
      refresh_time_text();
    },
    setTimestamp(v: number) {
      const t = dayjs(v);
      const full_year = t.year();
      const month = t.month() + 1;
      const date = t.date();
      const hours = t.hour();
      const minutes = t.minute();
      methods.setYearMonthDate(full_year, month, date);
      methods.setHourAndMinute(hours, minutes);
    },
    getToday() {
      const $today = dayjs();
      return {
        year: $today.year(),
        month: $today.month() + 1,
        date: $today.date(),
      };
    },
    setToday() {
      const $today = dayjs();
      _full_year = $today.year();
      _month = $today.month() + 1;
      _date = $today.date();
      methods.setYearMonthDate(_full_year, _month, _date);
    },
    getNowTime() {
      const $today = dayjs();
      return {
        hour: $today.hour(),
        minute: $today.minute(),
      };
    },
    setTime() {
      //       const $today = dayjs();
      //       _full_year = $today.year();
      //       _month = $today.month();
      //       _date = $today.date();
      //       methods.setYearMonthDate(_full_year, _month, _date);
    },
  };

  const _$date = dayjs(props.time);
  let _full_year = _$date.year();
  let _month = _$date.month() + 1;
  let _date = _$date.date();
  /** 小时 */
  let _hours = _$date.hour();
  /** 分 */
  let _minutes = _$date.minute();
  /** 秒 */
  let _seconds = _$date.second();
  /** 毫秒 */
  let _ms = _$date.millisecond();

  let _started_at = 0;
  let _time = props.time;
  let _time_text = "00:00:00.000";
  let _animation_frame_id: number | NodeJS.Timer;

  let _state = {
    get full_date_text() {
      return [_state.year, _state.month_text, _state.date_text].join("-");
    },
    get full_time_text() {
      return [_state.hours_text, _state.minutes_text].join(":");
    },
    get time() {
      return _time;
    },
    get time_text() {
      return _time_text;
    },
    get year() {
      return _full_year;
    },
    get month() {
      return _month;
    },
    get month_text() {
      return padding_zero(_month);
    },
    get date() {
      return _date;
    },
    get date_text() {
      return padding_zero(_date);
    },
    get hours() {
      return _hours;
    },
    get hours_text() {
      return padding_zero(_hours);
    },
    get minutes() {
      return _minutes;
    },
    get minutes_text() {
      return padding_zero(_minutes);
    },
    get seconds() {
      return _seconds;
    },
    get seconds_text() {
      return padding_zero(_seconds);
    },
    get ms() {
      return _ms;
    },
  };

  enum Events {
    Start,
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  function refresh_time_text() {
    _full_year = _$date.year();
    _month = _$date.month() + 1;
    _date = _$date.date();
    _hours = _$date.hour();
    _minutes = _$date.minute();
    _seconds = _$date.second();
    _ms = _$date.millisecond();
    //     const h = _hours;
    //     _hours = h;
    //     const m = _minutes;
    //     _minutes = m;
    //     const s = _seconds;
    //     _seconds = s;
    _time_text = `${padding_zero(_hours)}:${padding_zero(_minutes)}`;
    console.log("[BIZ]time_picker/clock - refresh_time_text", _time_text);
    methods.refresh();
  }

  refresh_time_text();

  return {
    methods,
    state: _state,
    get $dayjs() {
      return _$date;
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ClockModel = ReturnType<typeof ClockModel>;
