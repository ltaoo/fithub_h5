/**
 * @file 时间选择
 */
import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

import { ClockModel } from "./clock";

export function TimePickerModel(props: { $clock: ClockModel; app: ViewComponentProps["app"]; onOk?: () => void }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    selectHour(v: number) {
      _hour = v;
      ui.$clock.methods.setHourAndMinute(_hour, _minute);
      methods.refresh();
    },
    selectMinute(v: number) {
      _minute = v;
      ui.$clock.methods.setHourAndMinute(_hour, _minute);
      methods.refresh();
    },
    handleClickInput() {
//       _manually = true;
      ui.$dialog.show();
    },
  };
  const ui = {
    $clock: props.$clock,
    $dialog: new DialogCore({
      onOk: props.onOk,
    }),
    $view_hour: new ScrollViewCore({}),
    $view_minute: new ScrollViewCore({}),
    $btn_confirm: new ButtonCore({
      onClick() {
        ui.$clock.methods.setHourAndMinute(_hour, _minute);
        if (props.onOk) {
          props.onOk();
          return;
        }
        ui.$dialog.hide();
      },
    }),
    $btn_set_today: new ButtonCore({
      onClick() {
        const { hour, minute } = ui.$clock.methods.getTime();
        _hour = hour;
        _minute = minute;
        ui.$view_hour.scrollTo({ top: 40 * (_hour - 1) });
        ui.$view_minute.scrollTo({ top: 40 * (_minute - 2) });
        ui.$clock.methods.setHourAndMinute(_hour, _minute);
        methods.refresh();
      },
    }),
  };

//   let _manually = false;
  let _hour = ui.$clock.state.hours;
  let _minute = ui.$clock.state.minutes;
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
    get options_hour() {
      return Array.from({ length: 24 }, (_, i) => {
        return {
          label: `${i + 1}`,
          value: i + 1,
          selected: i + 1 === _hour,
        };
      });
    },
    get options_minute() {
      return Array.from({ length: 60 }, (_, i) => {
        return {
          label: `${i}`,
          value: i,
          selected: i === _minute,
        };
      });
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

  ui.$clock.onStateChange(() => {
    _hour = ui.$clock.state.hours;
    _minute = ui.$clock.state.minutes;
    methods.refresh();
  });
  ui.$dialog.onShow(() => {
    console.log("[]", _hour, _minute);
    ui.$view_hour.scrollTo({ top: 40 * (_hour - 1) });
    ui.$view_minute.scrollTo({ top: 40 * (_minute - 2) });
  });
  ui.$dialog.onHidden(() => {
    _hour = ui.$clock.state.hours;
    _minute = ui.$clock.state.minutes;
    methods.refresh();
  });

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

export type TimePickerModel = ReturnType<typeof TimePickerModel>;
