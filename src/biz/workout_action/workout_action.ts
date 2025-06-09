import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { Result } from "@/domains/result";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import {
  fetchWorkoutActionHistoryListOfWorkoutAction,
  fetchWorkoutActionHistoryListOfWorkoutActionProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { map_parts_with_ids, Muscles } from "@/biz/muscle/data";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { DialogCore } from "@/domains/ui";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { TabHeaderCore } from "@/domains/ui/tab-header";

export function WorkoutActionProfileViewModel(props: { ignore_history?: boolean; client: HttpClientCore }) {
  const request = {
    workout_action: {
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutAction, {
          process: fetchWorkoutActionHistoryListOfWorkoutActionProcess,
          client: props.client,
        }),
        { pageSize: 3 }
      ),
    },
  };
  type TheWorkoutActionProfile = NonNullable<typeof request.workout_action.profile.response>;
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async fetch(v: { id: number }) {
      if (request.workout_action.profile.response && request.workout_action.profile.response.id === v.id) {
        return;
      }
      if (!props.ignore_history) {
        request.workout_action_history.list.init({
          workout_action_id: v.id,
        });
      }
      const r = await request.workout_action.profile.run({ id: v.id });
      if (r.error) {
        return Result.Err(r.error);
      }
      ui.$muscle.highlight_muscles(
        map_parts_with_ids(
          r.data.muscles.map((v) => {
            return v.id;
          })
        )
      );
      _profile = {
        ...r.data,
        muscles: r.data.muscles.map((m) => {
          const matched = Muscles.find((vv) => vv.id === m.id);
          return {
            id: m.id,
            name: matched ? matched.name : String(m.id),
          };
        }),
      };
      methods.refresh();
    },
    cancel() {
      ui.$dialog.hide();
    },
  };
  const ui = {
    $dialog: new DialogCore(),
    $tab: new TabHeaderCore({
      key: 1,
      options: [
        {
          id: 1,
          text: "详情",
        },
        {
          id: 2,
          text: "动作历史",
        },
      ],
      onMounted() {
        ui.$tab.selectById(1);
      },
    }),
    $muscle: HumanBodyViewModel({
      highlighted: [],
    }),
  };

  let _profile: (TheWorkoutActionProfile & { muscles: { name: string }[] }) | null = null;
  let _state = {
    get profile() {
      return _profile;
    },
    get loading() {
      return request.workout_action.profile.loading;
    },
    get error() {
      return request.workout_action.profile.error;
    },
    get histories() {
      return request.workout_action_history.list.response.dataSource;
    },
    get curTabId() {
      return Number(ui.$tab.state.curId);
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
  request.workout_action_history.list.onStateChange(() => methods.refresh());
  ui.$tab.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutActionProfileViewModel = ReturnType<typeof WorkoutActionProfileViewModel>;
