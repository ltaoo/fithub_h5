/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
import { ButtonCore } from "@/domains/ui/button";

enum Events {
  BeforeShow,
  Show,
  BeforeHidden,
  Hidden,
  Unmounted,
  VisibleChange,
  Cancel,
  OK,
  AnimationStart,
  AnimationEnd,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHidden]: void;
  [Events.Hidden]: void;
  [Events.Unmounted]: void;
  [Events.VisibleChange]: boolean;
  [Events.OK]: void;
  [Events.Cancel]: void;
  [Events.AnimationStart]: void;
  [Events.AnimationEnd]: void;
  [Events.StateChange]: DialogState;
};
export type DialogProps = {
  title?: string;
  footer?: boolean;
  closeable?: boolean;
  mask?: boolean;
  open?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  onUnmounted?: () => void;
};

type DialogState = {
  open: boolean;
  title: string;
  footer: boolean;
  /** 能否手动关闭 */
  closeable: boolean;
  mask: boolean;
  enter: boolean;
  visible: boolean;
  exit: boolean;
};

export class DialogCore extends BaseDomain<TheTypesOfEvents> {
  open = false;
  title = "";
  footer = true;
  closeable = true;
  mask = true;

  present = new PresenceCore();
  okBtn = new ButtonCore();
  cancelBtn = new ButtonCore();

  get state(): DialogState {
    return {
      open: this.open,
      title: this.title,
      footer: this.footer,
      closeable: this.closeable,
      mask: this.mask,
      enter: this.present.state.enter,
      visible: this.present.state.visible,
      exit: this.present.state.exit,
    };
  }

  constructor(props: Partial<{ _name: string }> & DialogProps = {}) {
    super(props);

    const { title, footer = true, open = false, mask = true, closeable = true, onOk, onCancel, onUnmounted } = props;
    if (title) {
      this.title = title;
    }
    this.footer = footer;
    this.closeable = closeable;
    this.mask = mask;
    this.open = open;
    if (open) {
      this.present.show();
    }
    if (onOk) {
      this.onOk(onOk);
    }
    if (onCancel) {
      this.onCancel(onCancel);
    }
    if (onUnmounted) {
      this.onUnmounted(onUnmounted);
    }
    this.present.onShow(async () => {
      this.open = true;
      this.emit(Events.VisibleChange, true);
      this.emit(Events.StateChange, { ...this.state });
    });
    this.present.onHidden(async () => {
      this.open = false;
      this.emit(Events.Cancel);
      this.emit(Events.VisibleChange, false);
      this.emit(Events.StateChange, { ...this.state });
    });
    this.present.onUnmounted(() => {
      this.emit(Events.Unmounted);
    });
    this.present.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    this.okBtn.onClick(() => {
      this.ok();
    });
    this.cancelBtn.onClick(() => {
      this.hide();
    });
  }
  toggle() {
    if (this.open) {
      this.present.hide();
      return;
    }
    this.present.show();
  }
  /** 显示弹窗 */
  show() {
    // if (this.open) {
    //   return;
    // }
    // this.emit(Events.BeforeShow);
    this.present.show();
  }
  /** 隐藏弹窗 */
  hide(opt: Partial<{ destroy: boolean }> = {}) {
    // if (this.open === false) {
    //   return;
    // }
    // this.emit(Events.Cancel);
    this.present.hide(opt);
  }
  ok() {
    this.emit(Events.OK);
  }
  cancel() {
    this.emit(Events.Cancel);
  }
  setTitle(title: string) {
    this.title = title;
    this.emit(Events.StateChange, { ...this.state });
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>) {
    return this.on(Events.Unmounted, handler);
  }
  onVisibleChange(handler: Handler<TheTypesOfEvents[Events.VisibleChange]>) {
    return this.on(Events.VisibleChange, handler);
  }
  onOk(handler: Handler<TheTypesOfEvents[Events.OK]>) {
    return this.on(Events.OK, handler);
  }
  onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>) {
    return this.on(Events.Cancel, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "Dialog";
  }
}
