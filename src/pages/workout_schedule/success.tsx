import { For, Show } from "solid-js";
import { CheckCircle2, Divide } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { WorkoutScheduleViewModel } from "@/biz/workout_plan/workout_schedule";
import { WorkoutScheduleDayType } from "@/biz/workout_plan/constants";

function WorkoutScheduleCreateSuccessViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $profile: WorkoutScheduleViewModel({ client: props.client }),
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

export function WorkoutScheduleCreateSuccessView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutScheduleCreateSuccessViewModel, [props]);

  return (
    <PageView store={vm}>
      <div class="space-y-2">
        <div class="flex flex-col items-center py-4">
          <CheckCircle2 class="w-12 h-12 text-green-500" />
          <div class="mt-2 text-w-fg-0 text-center">创建成功</div>
        </div>
        <Divider />
        <div>
          <Show when={state().profile}>
            <div class="mt-4 text-w-fg-0">
              <div class="text-xl text-center">{state().profile?.title}</div>
              <div>
                <div class="mt-2 text-w-fg-1 text-sm text-center">{state().profile?.overview}</div>
              </div>
            </div>
            {/* <div class="text-w-fg-0">周期安排</div> */}
            <div class="mt-4 space-y-2">
              <For each={state().profile?.schedules}>
                {(schedule) => {
                  return (
                    <div class="relative p-4 border-2 border-w-fg-3 rounded-lg">
                      <div></div>
                      <Show
                        when={schedule.type === WorkoutScheduleDayType.Workout}
                        fallback={
                          <div class="flex items-center gap-2">
                            <div class="rounded-full px-2 bg-w-bg-5 text-sm text-white">{schedule.day_text}</div>
                            <div class="text-w-fg-1 text-sm">休息</div>
                          </div>
                        }
                      >
                        <div class="flex items-center gap-2">
                          <div class="rounded-full px-2 bg-blue-500 text-sm text-white">{schedule.day_text}</div>
                          <div class="text-w-fg-0">{schedule.title}</div>
                        </div>
                        <div class="mt-2 text-w-fg-1 text-sm">预计{schedule.estimated_duration_text}</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </PageView>
  );
}
