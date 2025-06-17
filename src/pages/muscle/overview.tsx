import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { BodyMusclePreview } from "@/components/body-muscle-preview";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { BodyPartWithMuscles } from "@/biz/muscle/types";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";

function MuscleInPersonViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickBodyPart(part: BodyPartWithMuscles) {
      _part = part;
      const muscles = part.muscles;
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $muscle: HumanBodyViewModel({
      highlighted: [],
    }),
  };
  let _part: BodyPartWithMuscles | null = null;
  let _state = {
    get part() {
      return _part;
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

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export function MuscleInPersonView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MuscleInPersonViewModel, [props]);

  return (
    <PageView store={vm} no_extra_bottom>
      <div class="flex flex-col h-full">
        <div class="h-[348px] bg-w-bg-0">
          <BodyMusclePreview
            store={vm.ui.$muscle}
            onClick={(part) => {
              vm.methods.handleClickBodyPart(part);
            }}
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <Show when={state().part}>
            <div class="grid grid-cols-2 gap-2">
              <For each={state().part?.muscles}>
                {(muscle) => {
                  return (
                    <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-0">
                      <div>{muscle.name}</div>
                      <div class="text-sm">{muscle.en_name}</div>
                    </div>
                  );
                }}
              </For>
            </div>
            <div class="h-[32px]"></div>
          </Show>
        </div>
      </div>
    </PageView>
  );
}
