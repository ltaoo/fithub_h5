import { Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ScrollView } from "@/components/ui";
import { useViewModel } from "@/hooks";
import { WorkoutActionProfileCore } from "@/biz/workout_action/workout_action";
import { Loader } from "lucide-solid";

function WorkoutActionProfileViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $profile: WorkoutActionProfileCore({ client: props.client }),
  };
  let _state = {
    get profile() {
      return ui.$profile.state.profile;
    },
    get loading() {
      return ui.$profile.state.loading;
    },
    get error() {
      return ui.$profile.state.error;
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

  ui.$profile.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        props.app.tip({
          text: ["异常数据"],
        });
        return;
      }
      ui.$profile.methods.fetch({ id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutActionProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutActionProfileViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view}>
      <div class="relative p-4">
        <Show when={state().profile}>
          <div class="text-2xl">{state().profile?.zh_name}</div>
        </Show>
        <Show when={state().loading}>
          <div class="fixed inset-0">
            <Loader class="w-12 h-12 animate animate-spin" />
          </div>
        </Show>
      </div>
    </ScrollView>
  );
}
