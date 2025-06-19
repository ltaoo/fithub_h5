import { base, Handler } from "@/domains/base";
import { Result } from "@/domains/result";
import { BizError } from "@/domains/error";
import { remove_arr_item } from "@/utils";

import { FormInputInterface } from "./types";

type CommonRuleCore = {
  required: boolean;
};
type NumberRuleCore = {
  min: number;
  max: number;
};
type StringRuleCore = {
  minLength: number;
  maxLength: number;
  mode: "email" | "number";
};
type FieldRuleCore = Partial<
  CommonRuleCore &
    NumberRuleCore &
    StringRuleCore & {
      custom(v: any): Result<null>;
    }
>;
type FormFieldCoreProps = {
  label?: string;
  /** @deprecated */
  name?: string;
  rules?: FieldRuleCore[];
};
export function FormFieldCore<T>(props: FormFieldCoreProps) {
  const { label } = props;

  return {
    label,
    // name,
    //     input,

    setValue() {},
    validate() {},
  };
}

type FieldStatus = "normal" | "focus" | "warning" | "error" | "success";

export type FormValidateResult = {
  valid: boolean;
  value: any;
  errors: BizError[];
};

enum SingleFieldEvents {
  Change,
  StateChange,
}
type TheSingleFieldCoreEvents<T extends FormInputInterface<any>["value"]> = {
  [SingleFieldEvents.Change]: T;
  [SingleFieldEvents.StateChange]: SingleFieldCoreState<T>;
};
type SingleFieldCoreProps<T> = FormFieldCoreProps & {
  input: T;
  hidden?: boolean;
};
type SingleFieldCoreState<T> = {
  symbol: string;
  label: string;
  // name: string;
  hidden: boolean;
  focus: boolean;
  error: BizError | null;
  status: FieldStatus;
  input: {
    shape: string;
    value: T;
    type: any;
    options?: any[];
  };
};

export class SingleFieldCore<T extends FormInputInterface<any>> {
  symbol = "SingleFieldCore" as const;
  _label: string;
  // _name: string;
  _hidden = false;
  _error: BizError | null = null;
  _status: FieldStatus = "normal";
  _focus = false;
  _input: T;
  _rules: FieldRuleCore[];
  _dirty = false;
  _bus = base<TheSingleFieldCoreEvents<T>>();

  get state(): SingleFieldCoreState<T> {
    return {
      symbol: this.symbol,
      label: this._label,
      // name: this._name,
      hidden: this._hidden,
      focus: this._focus,
      error: this._error,
      status: this._status,
      input: {
        shape: this._input.shape,
        value: this._input.value,
        // @ts-ignore
        type: this._input.type,
        // @ts-ignore
        options: this._input.shape === "select" ? this._input.options : undefined,
      },
    };
  }

  constructor(props: SingleFieldCoreProps<T>) {
    const { label = "", rules = [], input, hidden = false } = props;

    this._label = label;
    // this._name = name;
    this._input = input;
    this._rules = rules;
    this._hidden = hidden;

    // console.log("[]before this._input.onChange", this._input);
    setTimeout(() => {
      this._input.onChange(() => {
        // console.log("the input change in SingleFieldCore", this._input.value);
        this._bus.emit(SingleFieldEvents.Change, this._input.value);
      });
      // 必需要800，为什么？少了也不行
    }, 800);
  }
  get label() {
    return this._label;
  }
  // get name() {
  //   return this._name;
  // }
  get hidden() {
    return this._hidden;
  }
  get dirty() {
    return this._dirty;
  }
  get input() {
    return this._input;
  }
  get value() {
    return this._input.value as T["value"];
  }
  hide() {
    this._hidden = true;
  }
  show() {
    this._hidden = false;
  }
  showField(key: string) {
    this._hidden = false;
  }
  hideField(key: string) {
    this._hidden = true;
  }
  setFieldValue(key: string, v: any) {
    // ...
  }
  clear() {
    this.setValue(this._input.defaultValue);
  }
  async validate() {
    const value = this._input.value;
    const errors: string[] = [];
    for (let i = 0; i < this._rules.length; i += 1) {
      const rule = this._rules[i];
      if (rule.required && !value) {
        errors.push(`${this._label}不能为空`);
      }
      if (rule.maxLength && value) {
        if (String(value).length > rule.maxLength) {
          errors.push(`${this._label}长度不能超过${rule.maxLength}`);
        }
      }
      if (rule.minLength && value) {
        if (String(value).length < rule.minLength) {
          errors.push(`${this._label}长度不能小于${rule.minLength}`);
        }
      }
      if (rule.max) {
        if (typeof value === "number" && value > rule.max) {
          errors.push(`${this._label}不能大于${rule.max}`);
        }
      }
      if (rule.min) {
        if (typeof value === "number" && value < rule.min) {
          errors.push(`${this._label}不能小于${rule.min}`);
        }
      }
      if (rule.mode && value) {
        if (rule.mode === "email") {
          const is_valid_email = (value as string).match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
          if (!is_valid_email) {
            errors.push(`${this._label}格式错误`);
          }
        }
        if (rule.mode === "number") {
          const is_valid_num = !Number.isNaN(Number(value));
          if (!is_valid_num) {
            errors.push(`${this._label}格式错误`);
          }
        }
      }
      if (rule.custom) {
        const r = rule.custom(value);
        if (r.error) {
          errors.push(...r.error.messages);
        }
      }
    }
    if (errors.length > 0) {
      return Result.Err(new BizError(errors));
    }
    return Result.Ok(value);
  }
  setValue(value: T["value"], extra: Partial<{ key: string; idx: number; silence: boolean }> = {}) {
    const v = (() => {
      if (value !== undefined) {
        return value;
      }
      return this._input.defaultValue;
    })();
    // console.log("[DOMAIN]formv2 - SingleField - setValue", v);
    this._input.setValue(v);
    // this._bus.emit(SingleFieldEvents.StateChange, { ...this.state });
  }
  setStatus(status: FieldStatus) {
    this._status = status;
    this._bus.emit(SingleFieldEvents.StateChange, { ...this.state });
  }
  setFocus(v: boolean) {
    this._focus = v;
    this._bus.emit(SingleFieldEvents.StateChange, { ...this.state });
  }
  handleValueChange(value: T["value"]) {
    this._dirty = true;
    this._input.setValue(value);
  }
  ready() {}
  destroy() {
    if (this._input.destroy) {
      this._input.destroy();
    }
    this._bus.destroy();
  }
  onChange(handler: Handler<TheSingleFieldCoreEvents<T>[SingleFieldEvents.Change]>) {
    return this._bus.on(SingleFieldEvents.Change, handler);
  }
  onStateChange(handler: Handler<TheSingleFieldCoreEvents<T>[SingleFieldEvents.StateChange]>) {
    return this._bus.on(SingleFieldEvents.StateChange, handler);
  }
}

type ArrayFieldCoreProps<
  T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> = FormFieldCoreProps & {
  field: T;
  hidden?: boolean;
};
type ArrayFieldValue<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> =
  ReturnType<T>["value"];
// type ArrayFieldValue<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> = {
//   [K in keyof ReturnType<T>]: ReturnType<T>[K] extends SingleFieldCore<any>
//     ? ReturnType<T>[K]["value"]
//     : ReturnType<T>[K] extends ArrayFieldCore<any>
//     ? ReturnType<T>[K]["value"]
//     : ReturnType<T>[K] extends ObjectFieldCore<any> ? ReturnType<T>[K]["value"] : never;
// };
type ArrayFieldCoreState = {
  label: string;
  hidden: boolean;
  fields: { id: number; label: string }[];
};
enum ArrayFieldEvents {
  Change,
  StateChange,
}
type TheArrayFieldCoreEvents<
  T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> = {
  [ArrayFieldEvents.Change]: { idx: number; id: number };
  [ArrayFieldEvents.StateChange]: ArrayFieldValue<T>;
};
export class ArrayFieldCore<
  T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> {
  symbol = "ArrayFieldCore" as const;
  _label: string;
  // _name: string;
  _hidden = false;
  fields: { id: number; idx: number; field: ReturnType<T> }[] = [];
  _field: T;
  _bus = base<TheArrayFieldCoreEvents<T>>();

  get state(): ArrayFieldCoreState {
    return {
      label: this._label,
      hidden: this._hidden,
      fields: this.fields.map((field) => {
        return {
          id: field.id,
          idx: field.idx,
          label: field.field.label,
        };
      }),
    };
  }

  constructor(props: ArrayFieldCoreProps<T>) {
    const { label = "", field, hidden = false } = props;
    this._label = label;
    // this._name = name;
    this._field = field;
    this._hidden = hidden;
    this.fields = [];
  }

  mapFieldWithIndex(index: number) {
    const field = this.fields[index];
    if (!field) {
      return null;
    }
    return field;
  }
  getFieldWithId(id: number) {
    const matched = this.fields.find((f) => f.id === id);
    return matched ?? null;
  }
  showField(key: string) {
    console.log("[BIZ]formv2/field - showField", key, this.fields);
    for (let i = 0; i < this.fields.length; i += 1) {
      (() => {
        let field = this.fields[i];
        if (!field) {
          return;
        }
        field.field.showField(key);
        // if (field.field.name === key) {
        //   console.log("before show field", field.field.name);
        //   field.field.show();
        // }
      })();
    }
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  hideField(key: string) {
    for (let i = 0; i < this.fields.length; i += 1) {
      (() => {
        let field = this.fields[i];
        if (!field) {
          return;
        }
        field.field.hideField(key);
      })();
    }
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  setFieldValue(key: string, v: any) {
    for (let i = 0; i < this.fields.length; i += 1) {
      (() => {
        let field = this.fields[i];
        if (!field) {
          return;
        }
        field.field.setFieldValue(key, v);
      })();
    }
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }

  get label() {
    return this._label;
  }
  // get name() {
  //   return this._name;
  // }
  get hidden() {
    return this._hidden;
  }
  // get dirty() {
  //   return this._dirty;
  // }
  get value(): ArrayFieldValue<T>[] {
    const r: ArrayFieldValue<T>[] = this.fields.map((field) => {
      return field.field.value;
    });
    return r;
  }
  refresh() {
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  hide() {
    this._hidden = true;
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  show() {
    this._hidden = false;
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  setValue(values: any[], extra: Partial<{ key: string; idx: number; silence: boolean }> = {}) {
    console.log("[DOMAIN]ArrayFieldCore - setValue", extra.key, values, this.fields);
    for (let i = 0; i < values.length; i += 1) {
      (() => {
        const v = values[i];
        let field = this.fields[i];
        if (!field) {
          const vvv = this._field(i);
          // vvv.onChange(() => {
          //   console.log(111);
          //   this._bus.emit(ArrayFieldEvents.Change, {
          //     id: i,
          //     idx: i,
          //   });
          // });
          field = {
            id: this.fields.length,
            idx: i,
            // @ts-ignore
            field: vvv,
          };
          this.fields[i] = field;
        }
        field.field.setValue(v, { idx: i, silence: extra.silence, key: extra.key });
      })();
    }
    console.log("[DOMAIN]ArrayFieldCore - after setValue", this.fields);
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  clear() {
    this.setValue([]);
  }
  async validate(): Promise<Result<ArrayFieldValue<T>[]>> {
    const results: ArrayFieldValue<T>[] = [];
    const errors: string[] = [];
    for (let i = 0; i < this.fields.length; i += 1) {
      await (async () => {
        const field = this.fields[i];
        const r = await field.field.validate();
        if (r.error) {
          errors.push(...r.error.messages);
          return;
        }
        results.push(r.data);
      })();
    }
    if (errors.length > 0) {
      return Result.Err(errors);
    }
    return Result.Ok(results);
  }
  insertBefore(id: number): ReturnType<T> {
    const field_idx = this.fields.findIndex((field) => field.id === id) ?? 0;
    const field = this._field(this.fields.length);
    const v_id = this.fields.length;
    let v_idx = field_idx;
    if (v_idx < 0) {
      v_idx = 0;
    }
    field.onChange(() => {
      this._bus.emit(ArrayFieldEvents.Change, {
        id: v_id,
        idx: v_idx,
      });
    });
    this.fields.splice(v_idx, 0, {
      id: this.fields.length,
      idx: v_idx,
      // @ts-ignore
      field,
    });
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
    // @ts-ignore
    return field;
  }
  insertAfter(id: number): ReturnType<T> {
    const field_idx = this.fields.findIndex((field) => field.id === id) ?? this.fields.length - 1;
    const field = this._field(this.fields.length);
    const v_id = this.fields.length;
    let v_idx = field_idx + 1;
    if (v_idx > this.fields.length) {
      v_idx = this.fields.length;
    }
    field.onChange(() => {
      this._bus.emit(ArrayFieldEvents.Change, {
        id: v_id,
        idx: v_idx,
      });
    });
    this.fields.splice(v_idx, 0, {
      id: v_id,
      idx: v_idx,
      // @ts-ignore
      field,
    });
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
    // @ts-ignore
    return field;
  }
  append(opt: Partial<{ silence: boolean }> = {}): ReturnType<T> {
    let field = this._field(this.fields.length);
    const v_id = this.fields.length;
    const v_idx = this.fields.length;
    setTimeout(() => {
      field.onChange(() => {
        // console.log('field onChange')
        this._bus.emit(ArrayFieldEvents.Change, {
          id: v_id,
          idx: v_idx,
        });
      });
    }, 800);
    this.fields.push({
      id: v_id,
      idx: v_idx,
      // @ts-ignore
      field,
    });
    if (!opt.silence) {
      this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
    }
    // @ts-ignore
    return field;
  }
  remove(id: number) {
    const matched_idx = this.fields.findIndex((field) => field.id === id);
    console.log("[BIZ]formv2/field - remove", id, matched_idx);
    if (matched_idx === -1) {
      return;
    }
    const v = this.fields[matched_idx];
    if (v && v.field.symbol === "SingleFieldCore") {
      v.field.input.destroy();
    }
    this.fields = remove_arr_item(this.fields, matched_idx);
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  removeByIndex(idx: number) {
    const v = this.fields[idx];
    console.log("[BIZ]formv2/field - remove", idx, v);
    if (v && v.field.symbol === "SingleFieldCore") {
      v.field.destroy();
    }
    this.fields = remove_arr_item(this.fields, idx);
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  /** 将指定的元素，向前移动一个位置 */
  upIdx(id: number) {
    const field_idx = this.fields.findIndex((field) => field.id === id);
    if (field_idx === -1) {
      return;
    }
    if (field_idx === 0) {
      return;
    }
    const prev_idx = this.fields[field_idx - 1];
    if (!prev_idx) {
      return;
    }
    this.fields[field_idx - 1] = this.fields[field_idx];
    this.fields[field_idx] = prev_idx;
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  /** 将指定的元素，向后移动一个位置 */
  downIdx(id: number) {
    const field_idx = this.fields.findIndex((field) => field.id === id);
    if (field_idx === -1) {
      return;
    }
    if (field_idx === this.fields.length - 1) {
      return;
    }
    const next_idx = this.fields[field_idx + 1];
    if (!next_idx) {
      return;
    }
    this.fields[field_idx + 1] = this.fields[field_idx];
    this.fields[field_idx] = next_idx;
    this._bus.emit(ArrayFieldEvents.StateChange, { ...this.state });
  }
  ready() {}
  destroy() {
    for (let i = 0; i < this.fields.length; i += 1) {
      const f = this.fields[i];
      f.field.destroy();
    }
    this._bus.destroy();
  }
  onChange(handler: Handler<TheArrayFieldCoreEvents<T>[ArrayFieldEvents.Change]>) {
    return this._bus.on(ArrayFieldEvents.Change, handler);
  }
  onStateChange(handler: Handler<TheArrayFieldCoreEvents<T>[ArrayFieldEvents.StateChange]>) {
    return this._bus.on(ArrayFieldEvents.StateChange, handler);
  }
}
type ObjectValue<O extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>> = {
  [K in keyof O]: O[K] extends SingleFieldCore<any>
    ? O[K]["value"]
    : O[K] extends ArrayFieldCore<any>
    ? O[K]["value"]
    : O[K] extends ObjectFieldCore<any>
    ? O[K]["value"]
    : never;
};
type ObjectFieldCoreProps<T> = FormFieldCoreProps & {
  fields: T;
  hidden?: boolean;
};
type ObjectFieldCoreState = {
  label: string;
  hidden: boolean;
  fields: {
    symbol: string;
    label: string;
    name: string;
    hidden: boolean;
  }[];
};
enum ObjectFieldEvents {
  Change,
  StateChange,
}
type TheObjectFieldCoreEvents<
  T extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>
> = {
  [ObjectFieldEvents.Change]: ObjectValue<T>;
  [ObjectFieldEvents.StateChange]: ObjectFieldCoreState;
};

function buildFieldsState<T extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>>(
  fields: T
) {
  const state: {
    symbol: string;
    label: string;
    name: string;
    hidden: boolean;
  }[] = Object.keys(fields).map((key) => {
    const field = fields[key];
    return {
      symbol: field.symbol,
      label: field.label,
      name: key,
      hidden: field.hidden,
    };
  });
  return state;
}

export class ObjectFieldCore<
  T extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>
> {
  symbol = "ObjectFieldCore" as const;
  _label: string;
  // _name: string;
  _hidden = false;
  _dirty = false;
  fields: T;
  rules: FieldRuleCore[];
  _bus = base<TheObjectFieldCoreEvents<T>>();

  get state(): ObjectFieldCoreState {
    const fields = buildFieldsState(this.fields);
    return {
      label: this._label,
      hidden: this._hidden,
      fields,
    };
  }

  constructor(props: ObjectFieldCoreProps<T>) {
    const { label = "", hidden = false, fields, rules = [] } = props;
    this._label = label;
    // this._name = name;
    this._hidden = hidden;
    this.fields = fields;
    this.rules = rules;

    setTimeout(() => {
      const _fields = Object.values(fields);
      for (let i = 0; i < _fields.length; i += 1) {
        const f = _fields[i];
        f.onChange(() => {
          // console.log("the object value change in ObjectFieldCore", f.label, f.value);
          this._bus.emit(ObjectFieldEvents.Change);
        });
      }
    }, 800);
  }
  get label() {
    return this._label;
  }
  // get name() {
  //   return this._name;
  // }
  get hidden() {
    return this._hidden;
  }
  get dirty() {
    return this._dirty;
  }
  get value(): ObjectValue<T> {
    const keys = Object.keys(this.fields) as Array<keyof T>;
    const result = keys.reduce((acc, key) => {
      acc[key] = this.fields[key].value;
      return acc;
    }, {} as ObjectValue<T>);
    return result;
  }
  mapFieldWithName(name: string) {
    const field = this.fields[name];
    if (!field) {
      return null;
    }
    return field;
  }
  setField(name: string, field: SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>) {
    // @ts-ignore
    this.fields[name] = field;
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  showField(name: string) {
    const field = this.fields[name];
    if (!field) {
      return;
    }
    field.show();
  }
  hideField(name: string) {
    const field = this.fields[name];
    if (!field) {
      return;
    }
    field.hide();
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  setFieldValue(key: string, v: any) {
    const field = this.fields[key];
    if (!field) {
      return;
    }
    field.setValue(v);
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  hide() {
    this._hidden = true;
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  show() {
    this._hidden = false;
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  setValue(
    values: Partial<Record<keyof T, any>>,
    extra: Partial<{ key: keyof T; idx: number; silence: boolean }> = {}
  ) {
    // console.log("[DOMAIN]formv2 - setValue", values, extra, this.fields);
    if (extra.key) {
      const field = this.fields[extra.key];
      // console.log("[DOMAIN]formv2 - ObjectFieldCore setValue", field);
      if (field) {
        field.setValue(values[extra.key]);
      }
      return;
    }
    const keys = Object.keys(this.fields);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const field = this.fields[key];
      // console.log("[DOMAIN]ObjectFieldCore - before field.setValue", key, values[key], field);
      // @ts-ignore
      field.setValue(values[key]);
    }
  }
  refresh() {
    this._bus.emit(ObjectFieldEvents.StateChange, { ...this.state });
  }
  clear() {
    const keys = Object.keys(this.fields);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const field = this.fields[key];
      field.clear();
    }
  }
  async validate(): Promise<Result<ObjectValue<T>>> {
    const results: ObjectValue<T> = {} as ObjectValue<T>;
    const errors: string[] = [];
    const keys = Object.keys(this.fields);
    for (let i = 0; i < keys.length; i += 1) {
      await (async () => {
        const key = keys[i];
        const field = this.fields[key];
        const r = await field.validate();
        if (r.error) {
          errors.push(...r.error.messages);
          return;
        }
        // @ts-ignore
        results[key] = r.data;
      })();
    }
    if (errors.length > 0) {
      return Result.Err(errors);
    }
    const errors2: string[] = [];
    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      if (rule.custom) {
        const r = await rule.custom(results);
        if (r.error) {
          errors2.push(...r.error.messages);
        }
      }
    }
    if (errors2.length > 0) {
      return Result.Err(errors2);
    }
    return Result.Ok(results);
  }
  handleValueChange(path: string, value: any) {
    this._dirty = true;
    const field = this.fields[path];
    if (!field) {
      return;
    }
    field.setValue(value, { key: path });
    this._bus.emit(ObjectFieldEvents.Change, this.value);
  }
  toJSON() {
    return Object.keys(this.fields)
      .map((key) => {
        return {
          [key]: this.fields[key].value,
        };
      })
      .reduce((a, b) => {
        return { ...a, ...b };
      }, {});
  }
  ready() {}
  destroy() {
    const _fields = Object.values(this.fields);
    for (let i = 0; i < _fields.length; i += 1) {
      const f = _fields[i];
      f.destroy();
    }
    this._bus.destroy();
  }
  onChange(handler: Handler<TheObjectFieldCoreEvents<T>[ObjectFieldEvents.Change]>) {
    return this._bus.on(ObjectFieldEvents.Change, handler);
  }
  onStateChange(handler: Handler<TheObjectFieldCoreEvents<T>[ObjectFieldEvents.StateChange]>) {
    return this._bus.on(ObjectFieldEvents.StateChange, handler);
  }
}
