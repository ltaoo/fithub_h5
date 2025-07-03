import { base, Handler } from "@/domains/base";
import { InputCore, PopoverCore } from "@/domains/ui";

export type SetValueUnit =
  | "公斤"
  | "磅"
  | "自重"
  | "RM"
  | "%1RM"
  | "RPE"
  | "RIR"
  | "次"
  | "ToFail" // To Fail 是计数单位啊，表示做到 力竭
  | "秒"
  | "分"
  | "小时"
  | "千米"
  | "米"
  | "千卡";
export function getSetValueUnit(v: SetValueUnit): SetValueUnit {
  return v;
}
export const RepsSetValueOptions = [
  {
    label: "次",
    value: getSetValueUnit("次"),
  },
  // {
  //   label: "力竭",
  //   value: getSetValueUnit("ToFail"),
  // },
  {
    label: "秒",
    value: getSetValueUnit("秒"),
  },
  {
    label: "分",
    value: getSetValueUnit("分"),
  },
  {
    label: "小时",
    value: getSetValueUnit("小时"),
  },
  {
    label: "米",
    value: getSetValueUnit("米"),
  },
  {
    label: "千米",
    value: getSetValueUnit("千米"),
  },
  {
    label: "KCal",
    value: getSetValueUnit("千卡"),
  },
];
export const WeightSetValueOptions = [
  {
    label: "RM",
    value: getSetValueUnit("RM"),
  },
  {
    label: "%1RM",
    value: getSetValueUnit("%1RM"),
  },
  {
    label: "RPE",
    value: getSetValueUnit("RPE"),
  },
  {
    label: "RIR",
    value: getSetValueUnit("RIR"),
  },
  {
    label: "自重",
    value: getSetValueUnit("自重"),
  },
];
export const RestSetValueOptions = [
  {
    label: "秒",
    value: getSetValueUnit("秒"),
  },
  {
    label: "分",
    value: getSetValueUnit("分"),
  },
];

export function SetValueInputModel(props: { defaultValue?: string; placeholder?: string; unit?: SetValueUnit }) {
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
        bus.emit(Events.Change, r.v);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    handleSubmit() {
      bus.emit(Events.Submit, _text);
    },
  };
  // console.log("[BIZ]set_value_input - before ui", props.defaultValue, props.placeholder);
  const ui = {
    $input: new InputCore({
      defaultValue: props.defaultValue,
      placeholder: props.placeholder,
    }),
    $popover: new PopoverCore(),
  };
  let _text = ui.$input.value ?? "0";
  let _unit: SetValueUnit = props.unit ?? getSetValueUnit("公斤");
  let _disabled = false;
  const DefaultWeightOptions: { value: SetValueUnit; label: SetValueUnit }[] = [
    { value: getSetValueUnit("公斤"), label: "公斤" },
    { value: getSetValueUnit("磅"), label: "磅" },
    { value: getSetValueUnit("自重"), label: "自重" },
  ];
  const DefaultRepsOptions: { value: SetValueUnit; label: SetValueUnit }[] = [
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
  ];
  let _unit_options = [...DefaultWeightOptions];
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
    get options() {
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
      return _state.value;
    },
    get unit() {
      return _unit;
    },
    get placeholder() {
      return ui.$input.placeholder;
    },
    setValue(value: string) {
      _text = (() => {
        if (_unit === getSetValueUnit("自重")) {
          return "";
        }
        return value === "" ? "0" : String(value);
      })();
      ui.$input.setValue(value);
    },
    setUnit(unit: SetValueUnit, value?: string) {
      _unit = unit;
      console.log("[BIZ]input_set_value - setUnit", unit, value);
      if (value) {
        _text = (() => {
          if (_unit === getSetValueUnit("自重")) {
            return "";
          }
          return value === "" ? "0" : String(value);
        })();
        ui.$input.setValue(_text);
      }
      _disabled = false;
      if (unit === getSetValueUnit("自重")) {
        _text = "";
        // ui.$input.setValue("0");
        _disabled = true;
      }
      // bus.emit(Events.Change, );
      // const r = methods.checkIsValid();
      // if (r.valid) {
      //   bus.emit(Events.Change, r.v);
      // }
      bus.emit(Events.UnitChange, unit);
      methods.refresh();
    },
    setRepsOptions() {
      this.setUnitOptions([...DefaultRepsOptions]);
    },
    setWeightOptions() {
      this.setUnitOptions([...DefaultWeightOptions]);
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

export type SetValueInputModel = ReturnType<typeof SetValueInputModel>;
