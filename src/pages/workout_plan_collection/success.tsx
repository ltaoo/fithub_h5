import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { CheckCircle2 } from "lucide-solid";
import { WorkoutPlanCollectionViewModel } from "@/biz/workout_plan/workout_plan_collection";
import { For, Show } from "solid-js";

function WorkoutPlanCollectionCreateSuccessViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $profile: WorkoutPlanCollectionViewModel({ client: props.client }),
  };

  let _state = {
    get loading() {
      return ui.$profile.state.loading;
    },
    get profile() {
      return ui.$profile.state.profile;
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
    ui,
    methods,
    state: _state,
    ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        props.app.tip({
          text: ["参数异常"],
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

export function WorkoutPlanCollectionCreateSuccessView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanCollectionCreateSuccessViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view}>
      <div class="p-4 space-y-2">
        <div class="flex flex-col items-center">
          <CheckCircle2 class="w-24 h-24 text-green-500" />
          <div class="mt-2 text-xl text-gray-800 text-center">创建成功</div>
        </div>
        <div>
          <Show when={state().profile}>
            <div>
              <div>{state().profile?.title}</div>
              <div>
                <div>{state().profile?.overview}</div>
              </div>
            </div>
            <div>周期安排</div>
            <div class="mt-2 space-y-2">
              <For each={state().profile?.workout_plans}>
                {(plan) => {
                  return (
                    <div class="relative p-2 border rounded-md">
                      <div>
                        <div class="absolute right-2 top-2">
                          <div class="rounded-md p-1 bg-blue-500 text-sm text-white">{plan.weekday_text}</div>
                        </div>
                        <div>{plan.title}</div>
                        <div class="mt-2">预计{plan.estimated_duration_text}</div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </ScrollView>
  );
}
