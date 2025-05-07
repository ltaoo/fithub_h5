import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";
import { BizError } from "@/domains/error";

import { fetchMuscleList, fetchMuscleListProcess } from "@/biz/muscle/services";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { getSetValueUnit } from "@/biz/set_value_input";
import {
  fetchWorkoutActionList,
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
} from "@/biz/workout_action/services";

import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "./services";

export function WorkoutPlanViewModel(props: { client: HttpClientCore }) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        loading: true,
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_action: {
      list: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
    },
    muscle: {
      list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
    },
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async fetch(params: { id: number | string }) {
      const r = await request.workout_plan.profile.run({ id: params.id });
      if (r.error) {
        bus.emit(Events.Error, r.error);
        return;
      }
      const { muscle_ids, equipment_ids, action_ids, steps } = r.data;
      //       if (action_ids.length) {
      //         const r2 = await request.workout_action.list.run({ ids: muscle_ids });
      //         if (r2.error) {
      //           return;
      //         }
      //         _actions = r2.data.list.map((v) => {
      //           return {
      //             id: v.id,
      //             zh_name: v.zh_name,
      //           };
      //         });
      //         for (let a = 0; a < steps.length; a += 1) {
      //           const step = steps[a];
      //           for (let c = 0; c < step.actions.length; c += 1) {
      //             const act = step.actions[c];
      //             const profile = _actions.find((v) => v.id === act.action.id);
      //             if (profile && profile.zh_name !== act.action.zh_name) {
      //             }
      //           }
      //         }
      //       }
      if (muscle_ids.length) {
        const r2 = await request.muscle.list.run({ ids: muscle_ids });
        if (r2.error) {
          return;
        }
        _muscles = r2.data.list.map((v) => {
          return {
            id: v.id,
            zh_name: v.zh_name,
          };
        });
        methods.refresh();
      }
      if (equipment_ids.length) {
        const r3 = await request.equipment.list.run({ ids: equipment_ids });
        if (r3.error) {
          return;
        }
        _equipments = r3.data.list.map((v) => {
          return {
            id: v.id,
            zh_name: v.zh_name,
          };
        });
        methods.refresh();
      }
    },
  };
  let _muscles: { id: number; zh_name: string }[] = [];
  let _equipments: { id: number; zh_name: string }[] = [];
  let _actions: { id: number; zh_name: string }[] = [];
  let _state = {
    get loading() {
      return request.workout_plan.profile.loading;
    },
    get error() {
      return request.workout_plan.profile.error;
    },
    get profile() {
      const data = request.workout_plan.profile.response;
      if (!data) {
        return null;
      }
      return {
        title: data.title,
        overview: data.overview,
        level: data.level,
        tags: data.tags,
        suggestions: data.suggestions,
        points: data.points,
        estimated_duration_text: data.estimated_duration_text,
        steps: data.steps,
        muscles: _muscles,
        equipments: _equipments,
      };
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

  request.workout_plan.profile.onStateChange(() => methods.refresh());

  return {
    methods,
    request,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function buildSetAct(act: { id: number | string; zh_name: string }, extra: Partial<{ hiit: boolean }> = {}) {
  return {
    id: Number(act.id),
    zh_name: act.zh_name,
    reps: extra?.hiit ? 30 : 12,
    reps_unit: extra?.hiit ? getSetValueUnit("秒") : getSetValueUnit("次"),
    weight: "12RM",
    rest_duration: 30,
  };
}
