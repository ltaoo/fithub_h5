import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore, InputCore } from "@/domains/ui";

import { calc_bottom_padding_need_add } from "./utils";
import { NumKeyboardModel } from "./keyboard";

export function InputWithKeyboardModel(props: {
  defaultValue?: string;
  placeholder?: string;
  app: ViewComponentProps["app"];
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    updatePaddingHeight(opt: { rect: { x: number; y: number; width: number; height: number } }) {
      const v = calc_bottom_padding_need_add({
        keyboard: {
          height: 480,
          visible: ui.$dialog.state.open,
          prev_padding: _height,
        },
        object: opt.rect,
        screen: props.app.screen,
      });
      // console.log("[PAGE]workout_day/update - beforeShowNumInput", v);
      if (v > 0) {
        _height = v;
        bus.emit(Events.PaddingHeightChange, v);
      }
    },
    setValue(v: string) {
      ui.$input.setValue(v);
    },
    handleClickField(rect: { x: number; y: number; width: number; height: number }) {
      _status = "focus";
      methods.refresh();
      ui.$dialog.show();
      methods.updatePaddingHeight({ rect });
    },
    handleSubmit() {
      ui.$dialog.hide();
    },
  };
  const ui = {
    $input: new InputCore({ defaultValue: props.defaultValue, placeholder: props.placeholder }),
    $keyboard: NumKeyboardModel({ defaultValue: props.defaultValue }),
    $dialog: new DialogCore({}),
  };

  let _status: "normal" | "focus" | "error" = "normal";
  let _height = 0;
  let _state = {
    get status() {
      return _status;
    },
    get height() {
      return _height;
    },
    get value() {
      return ui.$input.value ?? "0";
    },
    get defaultValue() {
      return ui.$input.defaultValue;
    },
    get placeholder() {
      return ui.$input.placeholder;
    },
    get showSubKey() {
      return ui.$keyboard.state.showSubKey;
    },
  };
  enum Events {
    PaddingHeightChange,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
    [Events.PaddingHeightChange]: number;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$keyboard.onChange((v) => {
    ui.$input.setValue(String(v));
  });
  ui.$dialog.onCancel(() => {
    _height = 0;
    bus.emit(Events.PaddingHeightChange, 0);
  });

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
      return _state.defaultValue;
    },
    setValue: ui.$input.setValue.bind(ui.$input),
    ready() {},
    destroy() {
      bus.destroy();
    },
    onPaddingHeightChange(handler: Handler<TheTypesOfEvents[Events.PaddingHeightChange]>) {
      return bus.on(Events.PaddingHeightChange, handler);
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

export type InputWithKeyboardModel = ReturnType<typeof InputWithKeyboardModel>;
