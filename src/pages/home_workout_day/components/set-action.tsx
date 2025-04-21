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
    ready() {},
    change(act: { id: number | string; zh_name: string }) {
      _id = act.id;
      _zh_name = act.zh_name;
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type SetActionViewModel = ReturnType<typeof SetActionViewModel>;

export function SetActionView(props: { store: SetActionViewModel; onClick?: () => void }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div
      onClick={(event) => {
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      {state().zh_name}
    </div>
  );
}
