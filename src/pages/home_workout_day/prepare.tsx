import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";

function WorkoutDayPreparingViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_action: {
      list_by_id: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
    },
    workout_day: {},
  };
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
    async ready() {
      const workout_plan_id = props.view.query.workout_plan_id;
      if (!workout_plan_id) {
        return;
      }
      const r = await request.workout_plan.profile.run({ id: Number(workout_plan_id) });
      if (r.error) {
        props.app.tip({
          text: ["获取计划内容失败"],
        });
        return;
      }
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayPreparingPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayPreparingViewModel, [props]);

  return <ScrollView store={vm.ui.$view} class="p-4"></ScrollView>;
}
