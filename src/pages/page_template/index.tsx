import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";

function PageTemplateViewModel(props: ViewComponentProps) {
  let _state = {};
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
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function PageTemplateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(PageTemplateViewModel, [props]);

  return <div>Hello</div>;
}
