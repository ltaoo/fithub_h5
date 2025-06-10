/**
 * @file 带键盘的输入框
 */
import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";
import { DragSelectView } from "@/components/drag-select";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore } from "@/domains/ui";
import { DragSelectViewModel } from "@/biz/drag_select";
import { Show } from "solid-js";
import { KeyboardUnitView } from "./unit";

/**
 * 弹出键盘时，希望指定元素不被键盘遮挡，将整个页面向上移动一定距离
 * 该方法用于计算所需要移动的「一定距离」
 */
export function calc_bottom_padding_need_add(arg: {
  keyboard: {
    height: number;
    visible: boolean;
    /** 键盘处于展示状态，已经将页面移动了多少距离 */
    prev_padding: number;
  };
  /** 要避免被键盘遮挡的元素 */
  object: { x: number; y: number; width: number; height: number };
  screen: { width: number; height: number };
}) {
  const { keyboard, object, screen } = arg;
  if (keyboard.visible) {
    object.y = object.y + keyboard.prev_padding;
  }
  const y = object.y + object.height;
  /** 页面底部可以用于放置键盘的剩余高度 */
  const space_height_place_keyboard = screen.height - y;
  // console.log("[UTILS]space_height_place_keyboard", space_height_place_keyboard, keyboard.height, object);
  if (space_height_place_keyboard < keyboard.height) {
    return keyboard.height - space_height_place_keyboard;
  }
  return 0;
}

export function InputWithKeyboardViewModel(props: { app: ViewComponentProps["app"] }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickInput(opt: { rect: { x: number; y: number; width: number; height: number } }) {
      const v = calc_bottom_padding_need_add({
        keyboard: {
          height: 480,
          visible: ui.$dialog.state.open,
          prev_padding: _height,
        },
        object: opt.rect,
        screen: props.app.screen,
      });
      (() => {
        if (v === 0) {
          return;
        }
        // 需要把页面底部撑起来
      })();
      ui.$dialog.show();
    },
    handleInputValue1(v: string) {},
    handleInputValue2(v: string) {},
  };
  const ui = {
    $dialog: new DialogCore({}),
    $input_unit: DragSelectViewModel({
      direction: "vertical",
      defaultValue: "RM",
      options: [
        {
          label: "RM",
          value: "RM",
        },
        {
          label: "%1RM",
          value: "%1RM",
        },
        {
          label: "RIR",
          value: "RIR",
        },
      ],
      onChange(v) {
        _unit = v;
        methods.refresh();
      },
    }),
  };

  let _value = "";
  let _unit = "";
  let _placeholder = "请输入";
  let _height = 0;
  let _state = {
    get value() {
      return _value;
    },
    get unit() {
      return _unit;
    },
    get placeholder() {
      return _placeholder;
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    app: props.app,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type InputWithKeyboardViewModel = ReturnType<typeof InputWithKeyboardViewModel>;

export function InputWithKeyboardView(props: { store: InputWithKeyboardViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div
        onClick={(event) => {
          const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
          vm.methods.handleClickInput({
            rect: { x, y, width, height },
          });
        }}
      >
        <Show when={state().value} fallback={<div>{state().placeholder}</div>}>
          <div>{state().value}</div>
        </Show>
      </div>
      <Sheet store={vm.ui.$dialog} app={vm.app}>
        <div class="flex">
          <div class="flex-1">
            <div class="p-4">1</div>
            <div class="p-4">2</div>
            <div class="p-4">3</div>
          </div>
          <div class="w-[32%]">
            <KeyboardUnitView store={vm.ui.$input_unit}></KeyboardUnitView>
          </div>
        </div>
      </Sheet>
    </>
  );
}
