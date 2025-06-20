/**
 * @file 固钉
 */
import { BaseDomain, Handler } from "@/domains/base";
import debounce from "lodash/fp/debounce";

enum Events {
  /** 变成固定 */
  Fixed,
  /** 取消固定 */
  UnFixed,
  Mounted,
  /** 内容位置、宽高等信息改变 */
  SizeChange,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Fixed]: void;
  [Events.UnFixed]: void;
  [Events.Mounted]: { height: number };
  [Events.SizeChange]: void;
  [Events.StateChange]: AffixState;
};
type AffixProps = {
  top: number;
  defaultHeight?: number;
  onMounted?: () => void;
};
type AffixState = {
  height: number;
  fixed: boolean;
  top: number;
  style: unknown;
};

export class AffixCore extends BaseDomain<TheTypesOfEvents> {
  height = 0;
  /** 当前 */
  curTop = 0;
  /** 当距离顶部多少距离时固定 */
  targetTop = 0;
  fixed = false;
  needRegisterAgain = true;
  shouldFixed = true;
  mounted = false;
  style: unknown = {};
  $node = null;

  get state(): AffixState {
    return {
      height: this.height,
      fixed: this.fixed,
      top: this.targetTop,
      style: this.style,
    };
  }

  constructor(props: Partial<{ _name: string }> & AffixProps) {
    super(props);

    const { top, defaultHeight = 0, onMounted = null } = props;

    // this.name = uniqueName;
    this.targetTop = top;
    this.height = defaultHeight;
    // this.needRegisterAgain = needRegisterAgain;
    // this.onMounted = onMounted;
    if (onMounted) {
      this.onMounted(onMounted);
    }
  }

  handleMounted(rect: { top: number; height: number }) {
    console.log("[DOMAIN]ui/affix/index - handleMounted", rect);
    const { top, height } = rect;
    this.curTop = top;
    this.height = height;
    // if (top === this.targetTop) {
    //   this.fix();
    // }
    // if (this.targetTop >= this.curTop) {
    //   // 如果目标距离大于实际距离，发生固定时，位置反而会往下移动，所以这里将目标距离等于实际距离
    //   this.targetTop = this.curTop;
    // }
    this.mounted = true;
    this.emit(Events.Mounted, { height });
  }
  handleScroll(values: { scrollTop: number }) {
    const { scrollTop } = values;
    const fixed = (() => {
      if (this.targetTop >= this.curTop) {
        return true;
      }
      if (scrollTop + this.targetTop >= this.curTop) {
        return true;
      }
      return false;
    })();
    this.shouldFixed = fixed;
    // if (this.name) {
    //     console.log('[COMPONENT]FixedTopForHome - scroll', this.name, scrollTop, this.targetTop, this.top, fixed);
    // }
    if (this.fixed === fixed) {
      return;
    }
    this.fixed = fixed;
    this.emit(Events.StateChange, { ...this.state });
  }

  register(size: { top: number; height: number }) {
    const { top, height } = size;
    console.log("[COMPONENT]FixedTopForHome - register", this.unique_id, this.targetTop, this.curTop, top);
    this.curTop = top;
    this.mounted = true;
    if (this.targetTop >= this.curTop) {
      // 如果目标距离大于实际距离，发生固定时，位置反而会往下移动，所以这里将目标距离等于实际距离
      this.targetTop = this.curTop;
    }
    if (this.targetTop < this.curTop && this.fixed) {
      this.fixed = false;
      this.emit(Events.StateChange, { ...this.state });
    }
    this.height = height;
    this.emit(Events.SizeChange);
  }
  registerAgain() {
    const { top, height } = this.rect();
    this.register({ top, height });
  }
  rect = () => {
    return {
      top: 0,
      height: 0,
    };
  };
  setRect(fn: () => { top: number; height: number }) {
    this.rect = fn;
  }
  fix() {
    if (this.fixed) {
      return;
    }
    if (!this.shouldFixed) {
      return;
    }
    this.fixed = true;
    this.emit(Events.Fixed);
    this.emit(Events.StateChange, { ...this.state });
  }
  unfix() {
    if (!this.fixed) {
      return;
    }
    this.fixed = false;
    this.emit(Events.UnFixed);
    this.emit(Events.StateChange, { ...this.state });
  }
  setTop = debounce(0, (top) => {
    const $el = this.$node;
    if (!$el) {
      return;
    }
    // $el.style.top = `${top}px`;
  });
  set(nextState: { fixed: boolean; top: number; style: unknown }) {
    const { fixed, top, style } = nextState;
    if (fixed !== undefined) {
      this.fixed = fixed;
    }
    if (top !== undefined) {
      this.targetTop = top;
    }
    if (style !== undefined) {
      this.style = style;
    }
    this.emit(Events.StateChange, { ...this.state });
  }
  // setNode(v) {
  //   this.$node = v;
  // }
  // updateTransformY(v) {
  //   const $el = this.$node;
  //   if (!$el) {
  //     return;
  //   }
  //   $el.style.transform = `translateY(${v}px)`;
  // }

  onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }
  onSizeChange(handler: Handler<TheTypesOfEvents[Events.SizeChange]>) {
    return this.on(Events.SizeChange, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
