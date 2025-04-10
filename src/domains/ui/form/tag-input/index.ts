import { base, Handler } from "@/domains/base";

type TagInputCoreProps = {
  defaultValue?: string[];
};
type TagInputCoreState = {
  value: string[];
  inputValue: string;
};
enum Events {
  Change,
  StateChange,
}
type TheTagInputEvents = {
  [Events.Change]: TagInputCoreState["value"];
  [Events.StateChange]: TagInputCoreState;
};
export class TagInputCore {
  shape = "tag-input" as const;

  inputValue: string = "";
  value: string[] = [];
  defaultValue: string[] = [];

  _bus = base<TheTagInputEvents>();

  constructor(props: TagInputCoreProps) {
    this.defaultValue = props.defaultValue ?? [];
    this.value = this.defaultValue;
  }

  get state(): TagInputCoreState {
    return {
      value: this.value,
      inputValue: this.inputValue,
    };
  }

  setValue(value: string[]) {
    this.value = value;
    this._bus.emit(Events.Change, this.value);
  }

  input(value: string) {
    console.log("[DOMAIN]ui/form/tag-input - input", value);
    this.inputValue = value;
  }

  addTag(tag?: string) {
    const v = tag || this.inputValue;
    console.log("[DOMAIN]ui/form/tag-input - addTag", v);
    if (!v) {
      return;
    }
    if (!this.value.includes(v)) {
      this.value.push(v);
    }
    this.inputValue = "";
    this._bus.emit(Events.Change, this.value);
    this._bus.emit(Events.StateChange, this.state);
  }

  removeTag(v: string) {
    if (!this.value.includes(v)) {
      return;
    }
    this.value = this.value.filter((item) => item !== v);
    this._bus.emit(Events.Change, this.value);
    this._bus.emit(Events.StateChange, this.state);
  }

  clear() {
    this.value = [];
    this._bus.emit(Events.Change, this.value);
  }

  onChange(handler: Handler<TheTagInputEvents[Events.Change]>) {
    return this._bus.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTagInputEvents[Events.StateChange]>) {
    return this._bus.on(Events.StateChange, handler);
  }
}
