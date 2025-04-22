import { For } from "solid-js";
import { Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ListView, ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchMyWorkoutPlanList, fetchMyWorkoutPlanListProcess } from "@/biz/workout_plan/services";

function WorkoutPlanMineViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      mine_list: new ListCore(
        new RequestCore(fetchMyWorkoutPlanList, { process: fetchMyWorkoutPlanListProcess, client: props.client })
      ),
    },
  };
  const methods = {
    handleClickPlan(plan: { id: string | number }) {
      props.history.push("root.workout_plan_profile", {
        id: String(plan.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
  };

  let _state = {
    get response() {
      return request.workout_plan.mine_list.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_plan.mine_list.onStateChange(() => bus.emit(Events.StateChange, { ..._state }));

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.workout_plan.mine_list.init();
    },
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
          <ListView store={vm.request.workout_plan.mine_list}>
            <For each={state().response.dataSource}>
              {(plan) => {
                return (
                  <div
                    class="p-4 border rounded-md"
                    onClick={() => {
                      vm.methods.handleClickPlan(plan);
                    }}
                  >
                    <div>{plan.title}</div>
                  </div>
                );
              }}
            </For>
          </ListView>
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
