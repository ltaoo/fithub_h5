import { For } from "solid-js";

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
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    selectBodyPart(v: string) {
      (() => {
        if (_selected_parts.includes(v)) {
          _selected_parts = _selected_parts.filter((p) => p !== v);
          return;
        }
        _selected_parts.push(v);
      })();
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
  };

  let _body_parts = [
    {
      value: "手臂",
      label: "手臂",
    },
    {
      value: "肩",
      label: "肩",
    },
    {
      value: "胸",
      label: "胸",
    },
    {
      value: "背",
      label: "背",
    },
    {
      value: "臀",
      label: "臀",
    },
    {
      value: "下肢",
      label: "下肢",
    },
    {
      value: "核心",
      label: "核心",
    },
    {
      value: "心肺",
      label: "心肺",
    },
  ];
  let _selected_parts: string[] = [];
  let _state = {
    get body_parts() {
      return _body_parts.map((p) => {
        return {
          value: p.value,
          label: p.label,
          selected: _selected_parts.includes(p.value),
        };
      });
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
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

  return (
    <ScrollView store={vm.ui.$view} class="min-h-screen">
      <div class="h-full p-4">
        <div>
          <div class="grid grid-cols-3 gap-2">
            <For each={state().body_parts}>
              {(part) => {
                return (
                  <div>
                    <div
                      classList={{
                        "p-4 border rounded-md": true,
                        "bg-gray-100": part.selected,
                      }}
                      onClick={() => {
                        vm.methods.selectBodyPart(part.value);
                      }}
                    >
                      <div class="text-center">{part.label}</div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
      <div class="fixed bottom-0 w-full p-2">
        <div class="p-4 rounded-md bg-green-500">
          <div class="text-white text-center">下一步</div>
        </div>
        <div class="h-[24px]"></div>
      </div>
    </ScrollView>
  );
}
