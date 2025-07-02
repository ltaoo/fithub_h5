/**
 * @file 阻力输入
 */
import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SelectCore } from "@/domains/ui";
import { getSetValueUnit, SetValueUnit, WeightSetValueOptions } from "@/biz/input_set_value";

import { InputWithKeyboardModel } from "./index";

export function WeightInputModel(props: {
  defaultValue: string;
  suffix: SetValueUnit;
  app: ViewComponentProps["app"];
  onChange?: (v: { num: string; unit: SetValueUnit }) => void;
  onPaddingHeightChange?: (v: number) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleSubmit() {
      ui.$dialog.hide();
    },
  };
  const $input = InputWithKeyboardModel({
    defaultValue: props.defaultValue,
    app: props.app,
    onPaddingHeightChange: props.onPaddingHeightChange,
  });
  const ui = {
    $input,
    $keyboard: $input.ui.$keyboard,
    $select: new SelectCore({
      defaultValue: props.suffix ?? getSetValueUnit("RM"),
      options: WeightSetValueOptions,
      onChange(v) {
        if (v === getSetValueUnit("自重")) {
          ui.$keyboard.disable();
        } else {
          ui.$keyboard.enable();
        }
      },
    }),
    $dialog: $input.ui.$dialog,
  };
  let _state = {
    get value() {
      return {
        num: ui.$input.value ?? "",
        unit: ui.$select.value ?? getSetValueUnit("RM"),
      };
    },
    get placeholder() {
      return ui.$input.state.placeholder;
    },
    get suffix() {
      return ui.$select.value;
    },
    get status() {
      return ui.$input.state.status;
    },
    get showSubKey() {
      return ui.$keyboard.state.showSubKey;
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _state.value;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$keyboard.onStateChange(() => methods.refresh());
  ui.$input.onStateChange(() => methods.refresh());
  ui.$input.onChange(() => {
    bus.emit(Events.Change, _state.value);
  });
  ui.$select.onStateChange(() => methods.refresh());
  if (props.onChange) {
    bus.on(Events.Change, props.onChange);
  }

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
      if (v.unit === getSetValueUnit("自重")) {
        ui.$keyboard.disable();
      } else {
        ui.$keyboard.enable();
      }
      methods.refresh();
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

export type WeightInputModel = ReturnType<typeof WeightInputModel>;
