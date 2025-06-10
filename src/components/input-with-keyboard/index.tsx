/**
 * @file 带键盘的输入框
 */
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { useViewModelStore } from "@/hooks";

function InputWithKeyboardViewModel() {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {};

  let _state = {};
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
  const [] = useViewModelStore(props.store);

  return (
    <div>
      <div>{}</div>
    </div>
  );
}
