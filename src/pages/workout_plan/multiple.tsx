import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui";

export function HomeWorkoutMultiplePlanViewModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore(),
  };

  let _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
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

export function HomeWorkoutMultiplePlanPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutMultiplePlanViewModel, [props]);

  return <ScrollView store={vm.ui.$view}>
	<div>
		
	</div>
  </ScrollView>;
}
