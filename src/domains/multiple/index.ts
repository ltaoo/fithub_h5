/**
 * @file 列表中多选
 */
import { BaseDomain, Handler } from "@/domains/base";

enum Events {
  Change,
  StateChange,
}
type TheTypesOfEvents<T> = {
  [Events.Change]: T[];
  [Events.StateChange]: MultipleSelectionState<T>;
};
type SelectionProps<T> = {
  defaultValue: T[];
  options: { label: string; value: T }[];
  onChange?: (v: T[]) => void;
};
type MultipleSelectionState<T> = {
  value: T[];
  options: { label: string; value: T }[];
};
export class MultipleSelectionCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  shape = "multiple-select" as const;

  value: T[] = [];
  defaultValue: T[] = [];

  options: { label: string; value: T }[] = [];

  get state(): MultipleSelectionState<T> {
    return {
      value: this.value,
      options: this.options,
    };
  }

  constructor(props: SelectionProps<T>) {
    super(props);

    const { defaultValue, options, onChange } = props;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
    this.options = options;

    if (onChange) {
      this.onChange(onChange);
    }
  }

  setValue(value: T[]) {
    this.value = value;
    this.emit(Events.Change, [...this.value]);
  }
  toggle(value: T) {
    if (this.value.includes(value)) {
      this.remove(value);
      return;
    }
    this.select(value);
  }
  select(value: T) {
    if (this.value.includes(value)) {
      return;
    }
    this.value.push(value);
    this.emit(Events.Change, [...this.value]);
    this.emit(Events.StateChange, { ...this.state });
  }
  remove(value: T) {
    if (!this.value.includes(value)) {
      return;
    }
    this.value = this.value.filter((v) => v !== value);
    this.emit(Events.Change, [...this.value]);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 暂存的值是否为空 */
  isEmpty() {
    return this.value.length === 0;
  }
  clear() {
    this.value = [];
    this.emit(Events.Change, [...this.value]);
    this.emit(Events.StateChange, { ...this.state });
  }

  onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
