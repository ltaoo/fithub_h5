/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";

enum Events {
  BeforeShow,
  Show,
  BeforeHidden,
  Hidden,
  OpenChange,
  AnimationStart,
  AnimationEnd,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHidden]: void;
  [Events.Hidden]: void;
  [Events.OpenChange]: boolean;
  [Events.AnimationStart]: void;
  [Events.AnimationEnd]: void;
  [Events.StateChange]: ToastState;
};
type ToastProps = {
  delay: number;
};

type ToastState = {
  mask: boolean;
  icon?: unknown;
  texts: string[];
  enter: boolean;
  visible: boolean;
  exit: boolean;
};

export class ToastCore extends BaseDomain<TheTypesOfEvents> {
  name = "ToastCore";

  present = new PresenceCore();
  delay = 1200;
  timer: NodeJS.Timeout | null = null;
  open = false;
  _mask = false;
  _icon: unknown = null;
  _texts: string[] = [];

  get state(): ToastState {
    return {
      mask: this._mask,
      icon: this._icon,
      texts: this._texts,
      enter: this.present.state.enter,
      visible: this.present.state.visible,
      exit: this.present.state.exit,
    };
  }

  constructor(options: Partial<{ _name: string } & ToastProps> = {}) {
    super(options);

    const { delay } = options;
    if (delay) {
      this.delay = delay;
    }
    this.present.onShow(() => {
      // console.log("[]ToastCore - this.present.onShow");
      this.open = true;
      this.emit(Events.OpenChange, true);
    });
    this.present.onHidden(() => {
      // console.log("[]ToastCore - this.present.onHide");
      this.open = false;
      this.emit(Events.OpenChange, false);
    });
    this.present.onStateChange(() => this.emit(Events.StateChange, { ...this.state }));
  }

  /** 显示弹窗 */
  async show(params: { mask?: boolean; icon?: unknown; texts: string[] }) {
    const { mask = false, icon, texts } = params;
    this._mask = mask;
    this._icon = icon;
    this._texts = texts;
    this.emit(Events.StateChange, { ...this.state });
    if (this.timer !== null) {
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.hide();
        this.clearTimer();
        this._mask = false;
      }, this.delay);
      return;
    }
    this.present.show();
    this.timer = setTimeout(() => {
      this.hide();
      this.clearTimer();
    }, this.delay);
  }
  clearTimer() {
    if (this.timer === null) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
  }
  /** 隐藏弹窗 */
  hide() {
    this.present.hide();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onOpenChange(handler: Handler<TheTypesOfEvents[Events.OpenChange]>) {
    return this.on(Events.OpenChange, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "ToastCore";
  }
}
