import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { Plus } from "lucide-solid";

function WorkoutPlanMineViewModel(props: ViewComponentProps) {
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanMineView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanMineViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div class="p-4">
          <div class="flex items-center justify-between"></div>
          <div></div>
        </div>
      </ScrollView>
      <div class="absolute bottom-4 right-4">
        <div
          onClick={() => {
            props.history.push("root.workout_plan_create");
          }}
        >
          <div class="flex items-center justify-center px-4 h-10 rounded-lg border border-gray-300  bg-white">
            <Plus class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </>
  );
}
