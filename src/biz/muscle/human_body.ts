import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";

export function HumanBodyViewModel(props: { highlighted: string[]; disabled?: boolean }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {};

  let _highlighted_muscles: string[] = props.highlighted;
  let _disabled = props.disabled;
  let _state = {
    get highlighted_muscles() {
      return _highlighted_muscles;
    },
  };
  enum Events {
    HighlightChange,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.HighlightChange]: { muscles: string[] };
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    get highlighted_muscles() {
      return _highlighted_muscles;
    },
    get disabled() {
      return _disabled;
    },
    ready() {},
    highlight_muscles(muscles: string[]) {
      _highlighted_muscles = muscles;
      bus.emit(Events.HighlightChange, { muscles });
    },
    onHighlightChange(handler: Handler<TheTypesOfEvents[Events.HighlightChange]>) {
      return bus.on(Events.HighlightChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type HumanBodyViewModel = ReturnType<typeof HumanBodyViewModel>;
