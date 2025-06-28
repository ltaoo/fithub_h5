/**
 * @file 带键盘的输入框
 */
import { Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";
import { DragSelectView } from "@/components/drag-select";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore } from "@/domains/ui";
import { DragSelectViewModel } from "@/biz/drag_select";
import { calc_bottom_padding_need_add } from "@/biz/input_with_keyboard/utils";
import { InputWithKeyboardModel } from "@/biz/input_with_keyboard";

import { KeyboardUnitView } from "./unit";

// export function InputWithKeyboardViewModel(props: { app: ViewComponentProps["app"] }) {
//   const methods = {
//     refresh() {
//       bus.emit(Events.StateChange, { ..._state });
//     },
//     handleClickInput(opt: { rect: { x: number; y: number; width: number; height: number } }) {
//       const v = calc_bottom_padding_need_add({
//         keyboard: {
//           height: 480,
//           visible: ui.$dialog.state.open,
//           prev_padding: _height,
//         },
//         object: opt.rect,
//         screen: props.app.screen,
//       });
//       (() => {
//         if (v === 0) {
//           return;
//         }
//         // 需要把页面底部撑起来
//       })();
//       ui.$dialog.show();
//     },
//     handleInputValue1(v: string) {},
//     handleInputValue2(v: string) {},
//   };
//   const ui = {
//     $dialog: new DialogCore({}),
//     $input_unit: DragSelectViewModel({
//       direction: "vertical",
//       defaultValue: "RM",
//       options: [
//         {
//           label: "RM",
//           value: "RM",
//         },
//         {
//           label: "%1RM",
//           value: "%1RM",
//         },
//         {
//           label: "RIR",
//           value: "RIR",
//         },
//       ],
//       onChange(v) {
//         _unit = v;
//         methods.refresh();
//       },
//     }),
//   };

//   let _value = "";
//   let _unit = "";
//   let _placeholder = "请输入";
//   let _height = 0;
//   let _state = {
//     get value() {
//       return _value;
//     },
//     get unit() {
//       return _unit;
//     },
//     get placeholder() {
//       return _placeholder;
//     },
//   };
//   enum Events {
//     StateChange,
//     Error,
//   }
//   type TheTypesOfEvents = {
//     [Events.StateChange]: typeof _state;
//     [Events.Error]: BizError;
//   };
//   const bus = base<TheTypesOfEvents>();

//   return {
//     methods,
//     ui,
//     state: _state,
//     app: props.app,
//     ready() {},
//     destroy() {
//       bus.destroy();
//     },
//     onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
//       return bus.on(Events.StateChange, handler);
//     },
//   };
// }
// export type InputWithKeyboardViewModel = ReturnType<typeof InputWithKeyboardViewModel>;

export function InputWithKeyboardView(props: { store: InputWithKeyboardModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div
        onClick={(event) => {
          const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
          vm.methods.handleClickField({
            x,
            y,
            width,
            height,
          });
        }}
      >
        <Show when={state().value} fallback={<div>{state().placeholder}</div>}>
          <div>{state().value}</div>
        </Show>
      </div>
      <Sheet store={vm.ui.$dialog} app={vm.app}>
      </Sheet>
    </>
  );
}
