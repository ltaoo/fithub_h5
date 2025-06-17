/**
 * @file 动作执行历史记录
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { ScrollView } from "@/components/ui";
import { useViewModel } from "@/hooks";

import {
  fetchWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDayProcess,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { PageView } from "@/components/page-view";

function WorkoutActionHistoryViewModel(props: ViewComponentProps) {
  const request = {
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutDay, {
          process: fetchWorkoutActionHistoryListOfWorkoutDayProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.workout_action_history.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $history: props.history,
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
    methods,
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

export function WorkoutActionHistoryListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutActionHistoryViewModel, [props]);

  return (
    <PageView store={vm}>
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
                <div class="text-sm text-gray-600">{v.created_at}</div>
              </div>
            );
          }}
        </For>
      </div>
    </PageView>
  );
}
