import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";

export function OSSManager() {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    compress() {

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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
