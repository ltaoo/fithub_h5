import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { debounce } from "@/utils/lodash/debounce";

interface DragInputViewProps<T extends { label: string; value: string | number }> {
  options: T[];
  defaultValue: string | number;
  visible_count?: number;
  item_height?: number;
  direction: "horizontal" | "vertical";
  onChange?: (value: string) => void;
}
export type DragSelectOpt = { label: string; value: number | string };

export function DragSelectViewModel<T extends DragSelectOpt>(props: DragInputViewProps<T>) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    bindNode(node: unknown) {
      _$node = node;
    },
    scrollToIdx(idx: number) {
      if (_$node === null) {
        console.warn("the $container is waiting mount");
        return;
      }
      const $node = _$node as HTMLDivElement;
      const vv = idx * _cell_height;
      if (props.direction === "vertical") {
        $node.scrollTo({
          top: vv,
        });
      }
      if (props.direction === "horizontal") {
        $node.scrollTo({
          left: vv,
        });
      }
    },
    setValue(v: DragSelectOpt["value"]) {
      const matched_idx = _options.findIndex((opt) => opt.value === v);
      if (matched_idx === -1) {
        _idx = 0;
        return;
      }
      _idx = matched_idx;
      methods.scrollToIdx(_idx);
      methods.refresh();
    },
    handleMounted() {
      if (_mounted) {
        return;
      }
      _mounted = true;
      // console.log("[BIZ]drag_select - handleMounted", props.defaultValue);
      if (props.defaultValue === null) {
        return;
      }
      methods.setValue(props.defaultValue);
      methods.scrollToIdx(_idx);
    },
    handleScroll: debounce(300, (event: { top: number; left: number }) => {
      if (!_mounted) {
        return;
      }
      // 取消之前的动画帧
      if (_scroll_animation_frame) {
        clearTimeout(_scroll_animation_frame);
      }
      // 设置新的动画帧
      _scroll_animation_frame = setTimeout(() => {
        // 这里可以处理滚动停止后的逻辑
        // console.log("[BIZ]drag_select - handleScroll before methods.handleTouchEnd", _mounted, event);
        methods.handleTouchEnd({ ...event });
      }, 100);
    }),
    handleTouchEnd(event: { top: number; left: number }) {
      const distance = props.direction === "vertical" ? event.top : event.left;
      const idx = (() => {
        if (distance <= _cell_height / 2) {
          return 0;
        }
        const idx = Math.round(distance / _cell_height);
        return idx;
      })();
      _idx = idx;
      // console.log("[BIZ]drag_select/handleTouchEnd - _idx", _idx, distance, distance % _cell_height);
      const v = _options[idx];
      bus.emit(Events.Change, v);
      if (distance % _cell_height !== 0) {
        methods.scrollToIdx(idx);
      }
    },
  };
  const ui = {};

  let _$node: unknown | null = null;
  let _options = props.options;
  let _cell_height = props.item_height ?? 40;
  let _visible_count = props.visible_count ?? 7;
  let _idx = 0;
  let _mounted = false;
  let _scroll_animation_frame: any | null = null;
  let _state = {
    get options() {
      return _options;
    },
    get visible_count() {
      return _visible_count;
    },
    get top_padding_count() {
      return Math.ceil((_visible_count - 1) / 2);
    },
    get bottom_padding_count() {
      return Math.ceil((_visible_count - 1) / 2);
    },
  };
  enum Events {
    StateChange,
    Error,
    Change,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
    [Events.Change]: T;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "drag-select" as const,
    methods,
    state: _state,
    get options() {
      return _options;
    },
    get visible_count() {
      return _visible_count;
    },
    get cell_height() {
      return _cell_height;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    get value() {
      // console.log("[BIZ]drag_select - in get value()", _options, _idx, _options[_idx], props.defaultValue);
      return _options[_idx].value ?? props.defaultValue;
    },
    setValue: methods.setValue,
    ready() {
      // methods.setValue(props.defaultValue);
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
  };
}
export type DragSelectViewModel<T extends { label: string; value: number | string }> = ReturnType<
  typeof DragSelectViewModel<T>
>;
