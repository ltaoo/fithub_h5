import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";

import { fetchWorkoutPlanCollectionProfile, fetchWorkoutPlanCollectionProfileProcess } from "./services";

export function WorkoutPlanCollectionViewModel(props: { client: HttpClientCore }) {
  const request = {
    workout_plan_collection: {
      profile: new RequestCore(fetchWorkoutPlanCollectionProfile, {
        process: fetchWorkoutPlanCollectionProfileProcess,
        client: props.client,
      }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    fetch(arg: { id: number }) {
      request.workout_plan_collection.profile.run(arg);
    },
  };

  let _state = {
    get loading() {
      return request.workout_plan_collection.profile.loading;
    },
    get profile() {
      return request.workout_plan_collection.profile.response;
    },
    get error() {
      return request.workout_plan_collection.profile.error;
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

  request.workout_plan_collection.profile.onStateChange(() => methods.refresh());
  request.workout_plan_collection.profile.onError((e) => {
    bus.emit(Events.Error, e);
  });

  return {
    methods,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutPlanCollectionViewModel = ReturnType<typeof WorkoutPlanCollectionViewModel>;

export function map_weekday_text(d: number) {
  if (d === 0) {
    return "周天";
  }
  if (d === 1) {
    return "周一";
  }
  if (d === 2) {
    return "周二";
  }
  if (d === 3) {
    return "周三";
  }
  if (d === 4) {
    return "周四";
  }
  if (d === 5) {
    return "周五";
  }
  if (d === 6) {
    return "周六";
  }
  return "other";
}
