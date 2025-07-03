/**
 * @file 日期+时间选择
 */
import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

import { ClockModel } from "./clock";
import { TimePickerModel } from "./time";
import { DatePickerModel } from "./date";

export function DateTimePickerModel(props: { $clock: ClockModel; app: ViewComponentProps["app"]; onOk?: () => void }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $clock: props.$clock,
    $dialog: new DialogCore({
      onOk: props.onOk,
    }),
    $input_date: DatePickerModel({ $clock: props.$clock, app: props.app }),
    $input_time: TimePickerModel({ $clock: props.$clock, app: props.app }),
  };

  let _state = {
    get value() {
      return ui.$clock.$dayjs;
    },
    get full_date_text() {
      return `${ui.$input_date.state.full_date_text}`;
    },
    get tmp_full_date_text() {
      return `${ui.$input_date.state.tmp_full_date_text}`;
    },
    get full_time_text() {
      return `${ui.$input_time.state.full_time_text}`;
    },
    get tmp_full_time_text() {
      return `${ui.$input_time.state.tmp_full_time_text}`;
    },
    get time_text() {
      return ui.$clock.state.time_text;
    },
    get options_year() {
      return ui.$input_date.state.options_year;
    },
    get options_month() {
      return ui.$input_date.state.options_month;
    },
    get options_date() {
      return ui.$input_date.state.options_date;
    },
    get options_hour() {
      return ui.$input_time.state.options_hour;
    },
    get options_minute() {
      return ui.$input_time.state.options_minute;
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

  ui.$input_date.onStateChange(() => methods.refresh());
  ui.$input_time.onStateChange(() => methods.refresh());

  return {
    shape: "select" as const,
    methods,
    ui,
    app: props.app,
    state: _state,
    get defaultValue() {
      return _state.value;
    },
    get value() {
      return _state.value;
    },
    setValue(v: number) {
      console.log("[BIZ]time_picker - setValue", v);
      ui.$clock.methods.setTimestamp(v);
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

export type DateTimePickerModel = ReturnType<typeof DateTimePickerModel>;
