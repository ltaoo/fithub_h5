import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionProfile, fetchWorkoutActionProfileProcess } from "@/biz/workout_action/services";
import { HttpClientCore } from "@/domains/http_client";

export function WorkoutActionProfileCore(props: { client: HttpClientCore }) {
  const request = {
    workout_action: {
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async fetch(v: { id: number | string }) {
      const r = await request.workout_action.profile.run({ id: v.id });
    },
  };

  let _state = {
    get profile() {
      return request.workout_action.profile.response;
    },
    get loading() {
      return request.workout_action.profile.loading;
    },
    get error() {
      return request.workout_action.profile.error;
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

  request.workout_action.profile.onStateChange(() => methods.refresh());
  request.workout_action.profile.onError((err) => {
    bus.emit(Events.Error, err);
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

export type WorkoutActionProfileCore = ReturnType<typeof WorkoutActionProfileCore>;
