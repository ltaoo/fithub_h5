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
import { Result } from "@/domains/result";
import { ListCore } from "@/domains/list";
import { Muscles } from "@/biz/muscle/data";

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
    // muscle: {
    //   list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
    // },
    equipment: {
      list: new ListCore(
        new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
        {
          pageSize: 36,
        }
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async fetch(params: { id: number }) {
      const r = await request.workout_plan.profile.run({ id: params.id });
      if (r.error) {
        bus.emit(Events.Error, r.error);
        return Result.Err(r.error);
      }
      const { muscle_ids, equipment_ids, steps } = r.data;
      // console.log("[BIZ]workout_plan/workout_plan - fetch - before muscle_ids.length", muscle_ids);
      if (muscle_ids.length) {
        // const r2 = await request.muscle.list.run({ ids: muscle_ids });
        // if (r2.error) {
        //   return Result.Err(r2.error);
        // }
        _muscles = Muscles.filter((v) => {
          return muscle_ids.includes(v.id);
        }).map((v) => {
          return {
            id: v.id,
            zh_name: v.name,
          };
        });
        // console.log("[BIZ]workout_plan/workout_plan - fetch - after _muscles =", _muscles);
        methods.refresh();
      }
      if (equipment_ids.length) {
        const r3 = await request.equipment.list.search({ ids: equipment_ids });
        if (r3.error) {
          return Result.Err(r3.error);
        }
        _equipments = r3.data.dataSource.map((v) => {
          return {
            id: v.id,
            zh_name: v.zh_name,
          };
        });
        methods.refresh();
      }
      return Result.Ok({
        ...r.data,
        muscles: [..._muscles],
        equipments: [..._equipments],
      });
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
        estimated_duration_text: data.estimated_duration_text,
        steps: data.steps,
        muscles: _muscles,
        equipments: _equipments,
        creator: data.creator,
        created_at: data.created_at,
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
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function buildSetAct(act: { id: number | string; zh_name: string }, extra: { uid: number; hiit: boolean }) {
  return {
    uid: extra.uid,
    id: Number(act.id),
    zh_name: act.zh_name,
    reps: extra?.hiit ? 30 : 12,
    reps_unit: extra?.hiit ? getSetValueUnit("秒") : getSetValueUnit("次"),
    weight: "12RM",
    rest_duration: 30,
  };
}
