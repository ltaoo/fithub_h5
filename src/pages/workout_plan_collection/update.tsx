import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Calendar } from "@/components/ui/calendar";
import { ScrollView } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";

function WorkoutPlanCollectionUpdateViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $calendar: CalendarCore({
      today: new Date(),
    }),
  };

  let _state = {
    get weekdays() {
      return ui.$calendar.state.weekdays;
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
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanCollectionUpdateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanCollectionUpdateViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view}>
      <div class="p-4">
        <div>
          <For each={state().weekdays}>
            {(day) => {
              return (
                <div class="flex items-center justify-center p-4">
                  <div>{day.text}</div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </ScrollView>
  );
}
