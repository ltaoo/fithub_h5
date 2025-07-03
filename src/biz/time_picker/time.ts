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
      ui.$tmp_clock.methods.setHour(v);
      methods.refresh();
    },
    selectMinute(v: number) {
      ui.$tmp_clock.methods.setMinute(v);
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
    $dialog: new DialogCore({
      onOk: props.onOk,
    }),
    $view_hour: new ScrollViewCore({}),
    $view_minute: new ScrollViewCore({}),
    $btn_confirm: new ButtonCore({
      onClick() {
        const { hours, minutes } = ui.$tmp_clock.state;
        ui.$clock.methods.setHourAndMinute(hours, minutes);
        if (props.onOk) {
          props.onOk();
          return;
        }
        ui.$dialog.hide();
      },
    }),
    $btn_set_today: new ButtonCore({
      onClick() {
        const { hour, minute } = ui.$clock.methods.getNowTime();
        ui.$tmp_clock.methods.setHourAndMinute(hour, minute);
        ui.$view_hour.scrollTo({ top: 40 * (hour - 1) });
        ui.$view_minute.scrollTo({ top: 40 * (minute - 2) });
        methods.refresh();
      },
    }),
  };

  let _state = {
    get value() {
      return ui.$clock.$dayjs;
    },
    get full_time_text() {
      return ui.$clock.state.full_time_text;
    },
    get tmp_full_time_text() {
      return ui.$tmp_clock.state.full_time_text;
    },
    get options_hour() {
      return Array.from({ length: 24 }, (_, i) => {
        return {
          label: `${i}`,
          value: i,
          selected: i === ui.$tmp_clock.state.hours,
        };
      });
    },
    get options_minute() {
      return Array.from({ length: 60 }, (_, i) => {
        return {
          label: `${i}`,
          value: i,
          selected: i === ui.$tmp_clock.state.minutes,
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

  ui.$clock.onStateChange(() => methods.refresh());
  ui.$tmp_clock.onStateChange(() => methods.refresh());
  ui.$dialog.onShow(() => {
    const { hours, minutes } = ui.$clock.state;
    ui.$view_hour.scrollTo({ top: 40 * (hours - 1) });
    ui.$view_minute.scrollTo({ top: 40 * (minutes - 2) });
  });
  ui.$dialog.onHidden(() => {
    const { hours, minutes } = ui.$clock.state;
    ui.$tmp_clock.methods.setHourAndMinute(hours, minutes);
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
