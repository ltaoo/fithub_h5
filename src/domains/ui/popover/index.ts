/**
 * @file 气泡
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
import { PopperCore, Align, Side } from "@/domains/ui/popper";
import { DismissableLayerCore } from "@/domains/ui/dismissable-layer";

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;
// export type Align = (typeof ALIGN_OPTIONS)[number];
// export type Side = (typeof SIDE_OPTIONS)[number];

enum Events {
  Show,
  Hidden,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.StateChange]: PopoverState;
};
type PopoverState = {
  isPlaced: boolean;
  x: number;
  y: number;
  visible: boolean;
  enter: boolean;
  exit: boolean;
};
type PopoverProps = {
  side?: Side;
  align?: Align;
  strategy?: "fixed" | "absolute";
};

export class PopoverCore extends BaseDomain<TheTypesOfEvents> {
  popper: PopperCore;
  present: PresenceCore;
  layer: DismissableLayerCore;

  _side: Side;
  _align: Align;

  visible = false;
  enter = false;
  exit = false;
  get state(): PopoverState {
    return {
      // visible: this.visible,
      // enter: this.enter,
      // exit: this.exit,
      isPlaced: this.popper.state.isPlaced,
      x: this.popper.state.x,
      y: this.popper.state.y,

      enter: this.present.state.enter,
      visible: this.present.state.visible,
      exit: this.present.state.exit,
    };
  }

  constructor(props: { _name?: string } & PopoverProps = {}) {
    super();

    const { side = "bottom", align = "end", strategy } = props;
    this._side = side;
    this._align = align;

    this.popper = new PopperCore({
      side,
      align,
      strategy,
    });
    this.present = new PresenceCore();
    this.layer = new DismissableLayerCore();
    this.layer.onDismiss(() => {
      console.log("[DOMAIN/ui]popover/index - onDismiss");
      this.hide();
    });
    this.present.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    this.popper.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
  }

  ready() {}
  destroy() {}
  toggle(position?: Partial<{ x: number; y: number; width: number; height: number }>) {
    console.log("[DOMAIN/ui]popover/index - toggle");
    const { visible } = this;
    if (visible) {
      this.hide();
      return;
    }
    if (position) {
      const { x, y, width = 8, height = 8 } = position;
      this.popper.updateReference({
        // @ts-ignore
        getRect() {
          return {
            width,
            height,
            x,
            y,
          };
        },
      });
    }
    this.show();
  }
  show(position?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  }) {
    console.log(this.popper.reference?.getRect());
    if (position) {
      this.popper.updateReference({
        getRect() {
          const { x = 0, y = 0, width = 0, height = 0, left = 0, top = 0, right = 0, bottom = 0 } = position;
          return {
            width,
            height,
            x,
            y,
            left,
            top,
            right,
            bottom,
          };
        },
      });
    }
    this.visible = true;
    this.present.show();
    this.popper.place();
    this.emit(Events.Show);
  }
  hide() {
    if (this.visible === false) {
      return;
    }
    this.visible = false;
    this.present.hide();
    this.emit(Events.Hidden);
  }
  unmount() {
    super.destroy();
    this.layer.destroy();
    this.popper.destroy();
    this.present.unmount();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "PopoverCore";
  }
}
