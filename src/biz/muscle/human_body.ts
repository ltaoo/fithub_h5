import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";

export function HumanBodyViewModel(props: { highlighted: string[]; disabled?: boolean }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    highlight_muscles(muscles: string[]) {
      if (_mounted === false) {
        _pending_highlighted_muscles = muscles;
        return;
      }
      _highlighted_muscles = muscles;
      bus.emit(Events.HighlightChange, { muscles });
      methods.refresh();
    },
    setMounted() {
      _mounted = true;
      if (_pending_highlighted_muscles.length) {
        methods.highlight_muscles(_pending_highlighted_muscles);
        _pending_highlighted_muscles = [];
      }
    },
  };
  const ui = {};

  let _highlighted_muscles: string[] = props.highlighted;
  let _pending_highlighted_muscles: string[] = [];
  let _disabled = props.disabled;
  let _mounted = false;
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
  let _uid = bus.uid();

  return {
    methods,
    ui,
    state: _state,
    get uid() {
      return `m${_uid}`;
    },
    get highlighted_muscles() {
      return _highlighted_muscles;
    },
    get disabled() {
      return _disabled;
    },
    highlight_muscles: methods.highlight_muscles,
    setMounted: methods.setMounted,
    ready() {},
    onHighlightChange(handler: Handler<TheTypesOfEvents[Events.HighlightChange]>) {
      return bus.on(Events.HighlightChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type HumanBodyViewModel = ReturnType<typeof HumanBodyViewModel>;
