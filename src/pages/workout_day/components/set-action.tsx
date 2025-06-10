import { Show } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { base, Handler } from "@/domains/base";

export function SetActionViewModel(props: { id: number | string; zh_name: string }) {
  let _id = props.id;
  let _zh_name = props.zh_name;

  let _state = {
    get id() {
      return _id;
    },
    get zh_name() {
      return _zh_name;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    change(act: { id: number | string; zh_name: string }) {
      _id = act.id;
      _zh_name = act.zh_name;
      bus.emit(Events.StateChange, { ..._state });
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type SetActionViewModel = ReturnType<typeof SetActionViewModel>;

export function SetActionView(props: {
  store: SetActionViewModel;
  highlight?: boolean;
  idx?: number;
  onClick?: () => void;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="relative flex items-center gap-2">
      {/* <div class="absolute top-1/2 -left-2 -bottom-0 -translate-y-1/2 w-[4px] h-[18px] bg-blue-500"></div> */}
      <Show when={props.idx}>
        <div
          classList={{
            "flex items-center justify-center px-2 rounded-full": true,
            "bg-blue-500": !props.highlight,
            "bg-w-green": props.highlight,
          }}
        >
          <div class="text-sm">{props.idx}</div>
        </div>
      </Show>
      <div
        class="relative left-[4px] text-w-fg-0"
        onClick={(event) => {
          if (props.onClick) {
            props.onClick();
          }
        }}
      >
        {state().zh_name}
      </div>
    </div>
  );
}
