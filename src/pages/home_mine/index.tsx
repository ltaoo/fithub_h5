import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { ScrollView } from "@/components/ui";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionHistoryList, fetchWorkoutActionHistoryListProcess } from "@/biz/workout_action/services";

function HomeMineViewModel(props: ViewComponentProps) {
  const request = {
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryList, {
          process: fetchWorkoutActionHistoryListProcess,
          client: props.client,
        })
      ),
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
  };
  let _state = {
    get response() {
      return request.workout_action_history.list.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_action_history.list.onStateChange((v) => bus.emit(Events.StateChange, { ..._state }));

  return {
    ui,
    state: _state,
    ready() {
      request.workout_action_history.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeMineView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeMineViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="h-full">
      <div class="p-4">
        <div class="space-y-2">
          <For each={state().response.dataSource}>
            {(v) => {
              return (
                <div class=" p-4 border rounded-md">
                  <div>
                    <div>{v.action.zh_name}</div>
                  </div>
                  <div class="flex">
                    <div class="flex">
                      {v.weight}
                      {v.weight_unit}
                    </div>
                    <div class="ml-4">x</div>
                    <div class="flex">
                      {v.reps}
                      {v.reps_unit}
                    </div>
                  </div>
                  <div>{v.created_at}</div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </ScrollView>
  );
}
