import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore, TheResponseOfFetchFunction, TheResponseOfRequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";

import {
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
  fetchMyWorkoutPlanList,
  fetchMyWorkoutPlanListProcess,
} from "@/biz/workout_plan/services";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore } from "@/domains/ui";

export function WorkoutPlanSelectViewModel(props: { client: HttpClientCore }) {
  const request = {
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchMyWorkoutPlanList, {
          process: fetchMyWorkoutPlanListProcess,
          client: props.client,
        })
      ),
    },
  };
  type ThePlanSelect = TheResponseOfRequestCore<typeof request.workout_plan.list.request>["list"][number];
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    error(err: BizError) {
      bus.emit(Events.Error, err);
    },
    select(v: ThePlanSelect) {
      _selected = v;
      methods.refresh();
    },
    clear() {
      _selected = null;
      methods.refresh();
    },
  };
  const ui = {
    $dialog: new DialogCore(),
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.workout_plan.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $search_input_title: new InputCore({ defaultValue: "" }),
    $search_btn_submit: new ButtonCore({
      async onClick() {
        const title = ui.$search_input_title.value;
        if (!title) {
          methods.error(new BizError("请输入标题"));
          return;
        }
        const r = await request.workout_plan.list.search({
          title,
        });
      },
    }),
  };
  let _mode = "single";
  let _selected: ThePlanSelect | null = null;
  let _state = {
    get response() {
      return request.workout_plan.list.response;
    },
    get selected() {
      return _selected;
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

  request.workout_plan.list.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    request,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutPlanSelectViewModel = ReturnType<typeof WorkoutPlanSelectViewModel>;
