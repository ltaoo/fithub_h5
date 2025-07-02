/**
 * @file 日期选择
 */

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

import { ClockModel } from "./clock";

export function DatePickerModel(props: { $clock: ClockModel }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    selectYear(v: number) {
      _year = v;
      methods.refresh();
    },
    selectMonth(v: number) {
      _month = v;
      methods.refresh();
    },
    selectDate(v: number) {
      _date = v;
      methods.refresh();
    },
  };
  const ui = {
    $clock: props.$clock,
    $popover: new PopoverCore({}),
    $view_hour: new ScrollViewCore({}),
    $view_minute: new ScrollViewCore({}),
    $btn_confirm_year: new ButtonCore({
      onClick() {
        ui.$clock.methods.setYearMonthDate(_year, _month, _date);
        ui.$popover.hide();
      },
    }),
    $btn_set_today: new ButtonCore({
      onClick() {
        const { year, month, date } = ui.$clock.methods.getToday();
        _year = year;
        _month = month;
        _date = date;
        ui.$view_hour.scrollTo({ top: 40 * (_month - 1) });
        ui.$view_minute.scrollTo({ top: 40 * (_date - 2) });
        methods.refresh();
      },
    }),
  };

  let _year = ui.$clock.state.year;
  let _month = ui.$clock.state.month;
  let _date = ui.$clock.state.date;
  let _state = {
    get value() {
      return ui.$clock.$dayjs;
    },
    get year() {
      return ui.$clock.state.year;
    },
    get month() {
      return ui.$clock.state.month;
    },
    get month_text() {
      return ui.$clock.state.month_text;
    },
    get date() {
      return ui.$clock.state.date;
    },
    get date_text() {
      return ui.$clock.state.date_text;
    },
    get time_text() {
      return ui.$clock.state.time_text;
    },
    get hour() {
      return ui.$clock.state.hours;
    },
    get hour_text() {
      return ui.$clock.state.hours_text;
    },
    get minute() {
      return ui.$clock.state.minutes;
    },
    get minute_text() {
      return ui.$clock.state.minutes_text;
    },
    get second() {
      return ui.$clock.state.seconds;
    },
    get second_text() {
      return ui.$clock.state.seconds_text;
    },
    get ms() {
      return ui.$clock.state.ms;
    },
    get options_year() {
      return [2022, 2023, 2024, 2025].map((y) => {
        return {
          label: `${y}`,
          value: y,
          selected: y === _year,
        };
      });
    },
    get options_month() {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
        return {
          label: `${m + 1}月`,
          value: m,
          selected: m === _month,
        };
      });
    },
    get options_date() {
      const first_date = ui.$clock.methods.startOf("month").date();
      const last_date = ui.$clock.methods.endOf("month").date();
      const result: { label: string; value: number; selected: boolean }[] = [];
      for (let i = first_date; i < last_date + 1; i += 1) {
        result.push({
          label: `${i}`,
          value: i,
          selected: i === _date,
        });
      }
      return result;
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: void;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$clock.onStateChange(() => methods.refresh());
  ui.$popover.onShow(() => {
    ui.$view_hour.scrollTo({ top: 40 * (_month - 1) });
    ui.$view_minute.scrollTo({ top: 40 * (_date - 2) });
  });
  ui.$popover.onHide(() => {
    _year = ui.$clock.state.year;
    _month = ui.$clock.state.month;
    _date = ui.$clock.state.date;
    methods.refresh();
  });

  return {
    shape: "select" as const,
    methods,
    ui,
    state: _state,
    get defaultValue() {
      return _state.date;
    },
    get value() {
      return _state.date;
    },
    setValue(v: number) {
      //...
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export type DatePickerModel = ReturnType<typeof DatePickerModel>;
