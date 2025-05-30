import { For, Show } from "solid-js";

import { Select } from "@/components/ui/select";
import { Button, Input, ListView, ScrollView } from "@/components/ui";
import { useViewModelStore } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";

export function WorkoutActionSelect2ViewModel() {
  const request = {};
  const methods = {};
  const ui = {};

  let _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type WorkoutActionSelect2ViewModel = ReturnType<typeof WorkoutActionSelect2ViewModel>;

export function WorkoutActionSelect2View(props: { store: WorkoutActionSelectDialogViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <div class="flex gap-2">
        <div class="w-[180px]">
          <Select store={vm.ui.$input_type_select} />
        </div>
        <Input store={vm.ui.$input_keyword} />
        <Button class="w-20" store={vm.ui.$btn_search_submit}>
          搜索
        </Button>
        <Button variant="subtle" store={vm.ui.$btn_search_reset}>
          重置
        </Button>
      </div>

      <div class="mt-2 h-[480px] overflow-y-auto">
        <ScrollView store={vm.ui.$view}>
          <ListView store={vm.request.action.list} class="space-y-2">
            <For each={state().actions}>
              {(action) => {
                return (
                  <div
                    class="p-2 flex justify-between items-center border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      vm.methods.select(action);
                    }}
                  >
                    <div>
                      <div class="">{action.zh_name}</div>
                      <div class="text-sm">{action.name}</div>
                    </div>
                    <Show when={state().value.find((act) => act.id === action.id)}>
                      <div class="text-sm text-green-500">已选</div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </ListView>
        </ScrollView>
      </div>
    </div>
  );
}
