import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { Result } from "@/domains/result";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import {
  fetchContentListOfWorkoutAction,
  fetchContentListOfWorkoutActionProcess,
  fetchWorkoutActionHistoryListOfWorkoutAction,
  fetchWorkoutActionHistoryListOfWorkoutActionProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { map_parts_with_ids, Muscles } from "@/biz/muscle/data";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { PlayerCore } from "@/domains/player";

export function WorkoutActionProfileViewModel(props: {
  ignore_history?: boolean;
  extra_body?: Record<string, any>;
  app: ViewComponentProps["app"];
  client: HttpClientCore;
}) {
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
        })
      ),
    },
    workout_action_content: {
      list: new ListCore(
        new RequestCore(fetchContentListOfWorkoutAction, {
          process: fetchContentListOfWorkoutActionProcess,
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
      ui.$tab.selectById(1);
      request.workout_action_content.list.modifyResponse((v) => {
        return {
          ...v,
          dataSource: [],
        };
      });
      request.workout_action_history.list.modifyResponse((v) => {
        return {
          ...v,
          dataSource: [],
        };
      });
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
    playVideo(v: { video_url: string; time: number }) {
      ui.$video.onCanPlay(() => {
        ui.$video.setCurrentTime(v.time);
        ui.$video.play();
      });
      ui.$video.onConnected(() => {
        // console.log("[BIZ]workout_action/workout_action_profile - ui.$video.onMounted");
        // ui.$video.loadSource({ url: v.video_url });
        ui.$video.load(v.video_url);
      });
      console.log("[BIZ]workout_action/workout_action_profile - before ui.$video.url ===", ui.$video.url, v.video_url);
      if (ui.$video.url === v.video_url && ui.$video.paused) {
        ui.$video.setCurrentTime(v.time);
        ui.$video.play();
      }
      if (ui.$video.url !== v.video_url && ui.$video._mounted) {
        ui.$video.load(v.video_url);
      }
      ui.$dialog_video.show();
    },
  };
  const ui = {
    $dialog: new DialogCore(),
    $tab: new TabHeaderCore({
      key: "id",
      options: [
        {
          id: 1,
          text: "详情",
        },
        {
          id: 2,
          text: "视频",
        },
        {
          id: 3,
          text: "最大重量记录",
        },
      ],
      onMounted() {
        ui.$tab.selectById(1);
      },
      onChange(v) {
        if (!_profile) {
          return;
        }
        if (v.id === 2) {
          request.workout_action_content.list.search({ workout_action_id: _profile.id });
        }
        if (v.id === 3 && !props.ignore_history) {
          request.workout_action_history.list.search({
            ..._extra_body,
            workout_action_id: _profile.id,
            order_by: "weight DESC",
          });
        }
      },
    }),
    $muscle: HumanBodyViewModel({
      highlighted: [],
    }),
    $dialog_video: new DialogCore({}),
    $view_action_content: new ScrollViewCore({}),
    $video: new PlayerCore({ app: props.app }),
  };

  let _profile: (TheWorkoutActionProfile & { muscles: { name: string }[] }) | null = null;
  let _extra_body = props.extra_body ?? {};
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
    get contents() {
      return request.workout_action_content.list.response.dataSource;
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
  request.workout_action_content.list.onStateChange(() => methods.refresh());
  ui.$tab.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    app: props.app,
    setExtraBody(v: Record<string, any>) {
      _extra_body = v;
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WorkoutActionProfileViewModel = ReturnType<typeof WorkoutActionProfileViewModel>;
