/**
 * @file 日期选择
 */
import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

import { ClockModel } from "./clock";

export function DatePickerModel(props: { $clock: ClockModel; app: ViewComponentProps["app"]; onOk?: () => void }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    selectYear(v: number) {
      ui.$tmp_clock.methods.setYear(v);
      methods.refresh();
    },
    selectMonth(v: number) {
      ui.$tmp_clock.methods.setMonth(v);
      methods.refresh();
    },
    selectDate(v: number) {
      ui.$tmp_clock.methods.setDate(v);
      methods.refresh();
    },
    handleClickInput() {
      ui.$dialog.show();
    },
  };
  const ui = {
    $clock: props.$clock,
    $tmp_clock: ClockModel({
      time: props.$clock.$dayjs.valueOf(),
    }),
    $dialog: new DialogCore({}),
    $view_year: new ScrollViewCore({}),
    $view_month: new ScrollViewCore({}),
    $view_date: new ScrollViewCore({}),
    $btn_confirm: new ButtonCore({
      onClick() {
        const { year, month, date } = ui.$tmp_clock.state;
        ui.$clock.methods.setYearMonthDate(year, month, date);
        ui.$dialog.hide();
      },
    }),
    $btn_set_today: new ButtonCore({
      onClick() {
        const { year, month, date } = ui.$clock.methods.getToday();
        ui.$tmp_clock.methods.setYearMonthDate(year, month, date);
        ui.$view_year.scrollTo({ top: 40 * (year - 1) });
        ui.$view_month.scrollTo({ top: 40 * (month - 2) });
        ui.$view_date.scrollTo({ top: 40 * (date - 2) });
        methods.refresh();
      },
    }),
  };

  // let _year = ui.$clock.state.year;
  // let _month = ui.$clock.state.month;
  // let _date = ui.$clock.state.date;
  let _state = {
    get value() {
      return ui.$tmp_clock.$dayjs;
    },
    get full_date_text() {
      return ui.$clock.state.full_date_text;
    },
    get tmp_full_date_text() {
      return ui.$tmp_clock.state.full_date_text;
    },
    get options_year() {
      return [2022, 2023, 2024, 2025].map((y) => {
        return {
          label: `${y}`,
          value: y,
          selected: y === ui.$tmp_clock.state.year,
        };
      });
    },
    get options_month() {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
        return {
          label: `${m}月`,
          value: m,
          selected: m === ui.$tmp_clock.state.month,
        };
      });
    },
    get options_date() {
      const first_date = ui.$tmp_clock.methods.startOf("month").date();
      const last_date = ui.$tmp_clock.methods.endOf("month").date();
      const result: { label: string; value: number; selected: boolean }[] = [];
      for (let i = first_date; i < last_date + 1; i += 1) {
        result.push({
          label: `${i}`,
          value: i,
          selected: i === ui.$tmp_clock.state.date,
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
  ui.$tmp_clock.onStateChange(() => methods.refresh());
  ui.$dialog.onShow(() => {
    const { year, month, date } = ui.$clock.state;
    // console.log("[]before tmp_clock .setYearMonthDate", year, month, date);
    ui.$view_year.scrollTo({ top: 40 * (year - 1) });
    ui.$view_month.scrollTo({ top: 40 * (month - 2) });
    ui.$view_date.scrollTo({ top: 40 * (date - 2) });
  });
  ui.$dialog.onHidden(() => {
    const { year, month, date } = ui.$clock.state;
    console.log("[]before .setYearMonthDate", year, month, date);
    ui.$tmp_clock.methods.setYearMonthDate(year, month, date);
    methods.refresh();
  });

  return {
    shape: "select" as const,
    methods,
    ui,
    state: _state,
    app: props.app,
    get defaultValue() {
      return _state.value;
    },
    get value() {
      return _state.value;
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
