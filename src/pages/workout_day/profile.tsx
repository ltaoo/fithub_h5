import { For, Show } from "solid-js";
import { ChevronLeft } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutDayProfile, fetchWorkoutDayProfileProcess } from "@/biz/workout_day/services";
import { fetchWorkoutActionHistoryList, fetchWorkoutActionHistoryListProcess } from "@/biz/workout_action/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { ListCore } from "@/domains/list";
import { PageView } from "@/components/page-view";

function WorkoutDayProfileViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      profile: new RequestCore(fetchWorkoutDayProfile, {
        process: fetchWorkoutDayProfileProcess,
        client: props.client,
      }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryList, {
          process: fetchWorkoutActionHistoryListProcess,
          client: props.client,
        }),
        {
          pageSize: 1000,
        }
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
  };
  let _state = {
    get profile() {
      return request.workout_day.profile.response;
    },
    get action_histories() {
      return request.workout_action_history.list.response;
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

  request.workout_day.profile.onStateChange((v) => methods.refresh());
  request.workout_action_history.list.onStateChange((v) => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        props.app.tip({
          text: ["参数错误"],
        });
        return;
      }
      const r = await request.workout_day.profile.run({ id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      if (r.data.status !== WorkoutDayStatus.Finished) {
        return;
      }
      request.workout_action_history.list.init({ workout_day_id: id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayProfileViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <Show when={state().profile}>
          <div class="p-2 border rounded-md">
            <div class="text-xl">{WorkoutDayStatusTextMap[state().profile!.status]}</div>
            <div class="mt-2">{state().profile!.duration_text}</div>
            <div class="mt-2">{state().profile!.started_at_text}</div>
          </div>
        </Show>
        <div class="mt-4 space-y-2">
          <For each={state().action_histories.dataSource}>
            {(value) => {
              return (
                <div>
                  <div>{value.created_at}</div>
                  <div>{value.action.zh_name}</div>
                  <div class="flex text-sm">
                    <div>{value.weight}</div>
                    <div>{value.weight_unit}</div>
                    <div>x{value.reps}</div>
                    <div>{value.reps_unit}</div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </PageView>
    </>
  );
}
