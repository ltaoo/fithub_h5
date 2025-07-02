import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";

export function NumKeyboardModel(props: { defaultValue?: string }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    checkIsValid() {
      const v = Number(_text);
      if (isNaN(v)) {
        return {
          valid: false,
          v: 0,
        };
      }
      return {
        valid: true,
        v,
      };
    },
    handleClickNumber(num: string) {
      if (_disabled) {
        return;
      }
      (() => {
        if (_text === "0") {
          _text = num;
          return;
        }
        if (_text.includes(".")) {
          const [integer, decimal] = _text.split(".");
          if (decimal.length >= 2) {
            return;
          }
          _text = _text + num;
          return;
        }
        if (_text.length >= 4) {
          return;
        }
        _text = _text + num;
      })();
      const r = methods.checkIsValid();
      if (r.valid) {
        _value = r.v;
        bus.emit(Events.Change, r.v);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    //     handleClickUnit(unit: SetValueUnit) {
    //       if (_unit === unit) {
    //         return;
    //       }
    //       _unit = unit;
    //       bus.emit(Events.StateChange, { ..._state });
    //     },
    handleClickDot() {
      if (_disabled) {
        return;
      }
      if (_text[_text.length - 1] === ".") {
        return;
      }
      if (_text.includes(".")) {
        return;
      }
      _text = _text + ".";
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickSub() {
      if (_disabled) {
        return;
      }
      if (!_show_sub_key) {
        return;
      }
      if (_text !== "" && _text !== "0") {
        return;
      }
      _text = "-";
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickDelete() {
      if (_disabled) {
        return;
      }
      _text = _text.slice(0, -1);
      if (_text.length === 0) {
        _text = "0";
      }
      // if (_text[_text.length - 1] === ".") {
      //   _text = _text.slice(0, -1);
      // }
      const r = methods.checkIsValid();
      if (r.valid) {
        _value = r.v;
        bus.emit(Events.Change, r.v);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    handleSubmit() {
      //       bus.emit(Events.Submit, _text);
    },
  };
  const ui = {};

  let _text = props.defaultValue !== undefined ? props.defaultValue.toString() : "";
  let _value = props.defaultValue ?? 0;
  let _show_sub_key = false;
  let _disabled = false;
  let _state = {
    get value() {
      return _value;
    },
    get disabled() {
      return _disabled;
    },
    get showSubKey() {
      return _show_sub_key;
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: number;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    disable() {
      if (_disabled === true) {
        return;
      }
      _disabled = true;
      methods.refresh();
    },
    enable() {
      if (_disabled === false) {
        return;
      }
      _disabled = false;
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
