/**
 * @file 阻力输入
 */
import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SelectCore } from "@/domains/ui";
import {
  getSetValueUnit,
  RepsSetValueOptions,
  RestSetValueOptions,
  SetValueUnit,
  WeightSetValueOptions,
} from "@/biz/input_set_value";

import { InputWithKeyboardModel } from "./index";

export function RepsInputModel(props: { defaultValue: string; suffix: SetValueUnit; app: ViewComponentProps["app"] }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleSubmit() {
      ui.$dialog.hide();
    },
  };
  const $input = InputWithKeyboardModel({ defaultValue: props.defaultValue, app: props.app });
  const ui = {
    $input,
    $keyboard: $input.ui.$keyboard,
    $select: new SelectCore({
      defaultValue: getSetValueUnit("次"),
      options: RepsSetValueOptions,
    }),
    $dialog: $input.ui.$dialog,
  };
  let _state = {
    get value() {
      return {
        num: ui.$input.value ?? "",
        unit: ui.$select.value ?? getSetValueUnit("次"),
      };
    },
    get placeholder() {
      return ui.$input.state.placeholder;
    },
    get suffix() {
      return ui.$select.value;
    },
    get showSubKey() {
      return ui.$keyboard.state.showSubKey;
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$keyboard.onStateChange(() => methods.refresh());
  ui.$input.onStateChange(() => methods.refresh());
  ui.$select.onStateChange(() => methods.refresh());

  return {
    shape: "input" as const,
    methods,
    ui,
    state: _state,
    app: props.app,
    get value() {
      return _state.value;
    },
    get defaultValue() {
      return ui.$input.ui.$input.defaultValue;
    },
    setValue(v: { num: string; unit: SetValueUnit }) {
      ui.$input.setValue(v.num);
      ui.$select.select(v.unit);
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange: ui.$input.onChange.bind(ui.$input),
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export type RepsInputModel = ReturnType<typeof RepsInputModel>;
