/**
 * 健身动作录入
 */
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ScrollView } from "@/components/ui";
import {
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
  updateWorkoutAction,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";

import { WorkoutActionValuesView } from "./action_form";
import { WorkoutActionEditorViewModel } from "./model";

function HomeActionUpdatePageViewModel(props: ViewComponentProps) {
  let _loading = false;
  let _state = {
    get loading() {
      return _loading;
    },
  };
  const request = {
    action: {
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
      update: new RequestCore(updateWorkoutAction, { client: props.client }),
    },
  };
  const { $values, toBody } = WorkoutActionEditorViewModel(props);
  const ui = {
    $view: new ScrollViewCore({}),
    $values,
    $back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $submit: new ButtonCore({
      async onClick() {
        const r = await toBody();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        const body = r.data;
        const r2 = await request.action.update.run(body);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        props.history.back();
      },
    }),
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: {
      state: typeof _state;
    };
  };

  const bus = base<TheTypesOfEvents>();

  const _methods = {
    setState(state: Partial<typeof _state>) {
      _state = { ..._state, ...state };
      bus.emit(Events.StateChange, { state: _state });
    },
  };
  return {
    state: _state,
    methods: _methods,
    ui,
    async ready() {
      const action_id = props.view.query.id;
      const r = await request.action.profile.run({ id: action_id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const action = r.data;
      console.log("[PAGE]home_action_update - action before setValue", action);
      $values.setValue(action);
      $values.refresh();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeActionUpdatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeActionUpdatePageViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="p-4">
      <div class="bg-white p-4 rounded-lg">
        <div class="flex flex-col gap-4">
          <WorkoutActionValuesView store={vm.ui.$values} />
        </div>
      </div>
      <div class="h-[68px]"></div>
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div class="flex gap-2">
          <Button variant="subtle" store={vm.ui.$back}>
            返回
          </Button>
          <Button store={vm.ui.$submit}>提交</Button>
        </div>
      </div>
    </ScrollView>
  );
}
