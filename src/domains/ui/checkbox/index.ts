import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";

enum Events {
  StateChange,
  Change,
}
type TheTypesOfEvents = {
  [Events.StateChange]: CheckboxState;
  [Events.Change]: boolean;
};
type CheckboxProps = {
  label?: string;
  checked?: boolean;
  value?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (checked: boolean) => void;
};
type CheckboxState = CheckboxProps & {
  // value: boolean;
};

export class CheckboxCore extends BaseDomain<TheTypesOfEvents> {
  shape = "checkbox" as const;

  label: string;
  disabled: CheckboxProps["disabled"];
  checked: boolean;
  // value: boolean;
  defaultChecked: boolean;

  presence: PresenceCore;

  get state(): CheckboxState {
    return {
      label: this.label,
      checked: this.checked,
      value: this.checked,
      disabled: this.disabled,
    };
  }
  get value() {
    return this.state.value;
  }
  get defaultValue() {
    return this.defaultChecked;
  }

  prev_checked = false;

  constructor(props: { _name?: string } & CheckboxProps = {}) {
    super(props);

    const { label = "", disabled = false, checked = false, onChange } = props;
    this.label = label;
    this.disabled = disabled;
    this.checked = checked;
    // this.value = checked;
    this.defaultChecked = checked;

    this.presence = new PresenceCore();
    if (onChange) {
      this.onChange(onChange);
    }
  }

  /** 切换选中状态 */
  toggle() {
    const prev_checked = this.checked;
    // console.log("[DOMAIN]checkbox - check", prevChecked);
    (() => {
      if (prev_checked) {
        this.presence.hide();
        return;
      }
      this.presence.show();
    })();
    this.checked = true;
    if (prev_checked) {
      this.checked = false;
    }
    this.prev_checked = prev_checked;
    this.emit(Events.Change, this.checked);
    this.emit(Events.StateChange, { ...this.state });
  }
  check() {
    if (this.checked === true) {
      return;
    }
    this.presence.show();
    this.prev_checked = this.checked;
    this.checked = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  uncheck() {
    if (this.checked === false) {
      return;
    }
    this.presence.hide();
    this.prev_checked = this.checked;
    this.checked = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  reset() {
    this.checked = this.defaultChecked;
  }
  setValue(v: boolean) {
    this.checked = v;
  }

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
