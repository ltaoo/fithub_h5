import { base, Handler } from "@/domains/base";
import { InputCore, PopoverCore } from "@/domains/ui";

export type SetValueUnit = "公斤" | "磅" | "秒" | "分" | "次" | "千米" | "米" | "千卡";
export function getSetValueUnit(v: SetValueUnit): SetValueUnit {
  return v;
}

export function SetValueInputViewModel(props: { defaultValue?: string; placeholder?: string; unit?: SetValueUnit }) {
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
        bus.emit(Events.Change, r.v);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickUnit(unit: SetValueUnit) {
      if (_unit === unit) {
        return;
      }
      _unit = unit;
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickDot() {
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
      _text = _text.slice(0, -1);
      if (_text.length === 0) {
        _text = "0";
      }
      // if (_text[_text.length - 1] === ".") {
      //   _text = _text.slice(0, -1);
      // }
      const r = methods.checkIsValid();
      if (r.valid) {
        bus.emit(Events.Change, r.v);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    handleSubmit() {
      bus.emit(Events.Submit, _text);
    },
  };
  console.log("[BIZ]set_value_input - before ui", props.defaultValue, props.placeholder);
  const ui = {
    $input: new InputCore({
      defaultValue: props.defaultValue,
      placeholder: props.placeholder,
    }),
    $popover: new PopoverCore(),
  };
  let _text = props.defaultValue !== undefined ? props.defaultValue.toString() : "";
  let _unit: SetValueUnit = props.unit ?? getSetValueUnit("公斤");
  let _unit_options: { value: SetValueUnit; label: SetValueUnit }[] = [
    { value: getSetValueUnit("公斤"), label: "公斤" },
    { value: getSetValueUnit("磅"), label: "磅" },
  ];
  let _show_sub_key = true;
  let _state = {
    get value() {
      return ui.$input.value;
    },
    get placeholder() {
      return ui.$input.placeholder;
    },
    get text() {
      return _text;
    },
    get unit() {
      return _unit;
    },
    get unitOptions() {
      return _unit_options;
    },
    get showSubKey() {
      return _show_sub_key;
    },
  };
  enum Events {
    Cancel,
    Submit,
    Change,
    UnitChange,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Cancel]: void;
    [Events.Submit]: typeof _text;
    [Events.Change]: number;
    [Events.UnitChange]: SetValueUnit;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$input.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    shape: "input" as const,
    state: _state,
    methods,
    ui,
    get defaultValue() {
      return props.defaultValue;
    },
    get value() {
      return ui.$input.value;
    },
    get unit() {
      return _unit;
    },
    get placeholder() {
      return ui.$input.placeholder;
    },
    setValue(value: string) {
      _text = value === "" ? "" : String(value);
      ui.$input.setValue(value);
      // _unit = value.unit;
      // bus.emit(Events.StateChange, { ..._state });
    },
    setUnit(unit: SetValueUnit) {
      _unit = unit;
      // bus.emit(Events.Change, );
      // const r = methods.checkIsValid();
      // if (r.valid) {
      //   bus.emit(Events.Change, r.v);
      // }
      bus.emit(Events.UnitChange, unit);
      bus.emit(Events.StateChange, { ..._state });
    },
    setRepsOptions() {
      this.setUnitOptions([
        {
          value: getSetValueUnit("次"),
          label: "次",
        },
        {
          value: getSetValueUnit("秒"),
          label: "秒",
        },
        {
          value: getSetValueUnit("分"),
          label: "分",
        },
      ]);
    },
    setWeightOptions() {
      this.setUnitOptions([
        {
          value: getSetValueUnit("公斤"),
          label: "公斤",
        },
        {
          value: getSetValueUnit("磅"),
          label: "磅",
        },
      ]);
    },
    setUnitOptions(v: typeof _unit_options) {
      _unit_options = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    setPlaceholder(v: string) {
      ui.$input.setPlaceholder(v);
    },
    showSubKey() {
      if (_show_sub_key) {
        return;
      }
      _show_sub_key = true;
      methods.refresh();
    },
    hideSubKey() {
      if (_show_sub_key === false) {
        return;
      }
      _show_sub_key = false;
      methods.refresh();
    },
    ready() {},
    onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>) {
      return bus.on(Events.Cancel, handler);
    },
    onSubmit(handler: Handler<TheTypesOfEvents[Events.Submit]>) {
      return bus.on(Events.Submit, handler);
    },
    onUnitChange(handler: Handler<TheTypesOfEvents[Events.UnitChange]>) {
      return bus.on(Events.UnitChange, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SetValueInputViewModel = ReturnType<typeof SetValueInputViewModel>;
