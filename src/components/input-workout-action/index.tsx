import { For } from "solid-js";
import { Repeat, SwitchCamera } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { WorkoutActionInputModel } from "@/biz/input_workout_action/input_workout_action";

export function WorkoutActionInput(props: { store: WorkoutActionInputModel; onShow?: () => void }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <For
        each={state().value}
        fallback={
          <div
            class="border-2 border-w-fg-3 rounded-lg p-4 text-center"
            onClick={() => {
              vm.ui.$select.init();
              vm.ui.$select.ui.$dialog.show();
              props.onShow?.();
            }}
          >
            <div class="text-w-fg-0">选择</div>
          </div>
        }
      >
        {(v) => {
          return (
            <Flex class="border-2 border-w-fg-3 rounded-lg p-4 justify-between">
              <div class="text-w-fg-0">{v.zh_name}</div>
              <IconButton
                onClick={() => {
                  if (vm.ui.$select.request.action.list.response.initial) {
                    vm.ui.$select.init();
                  }
                  vm.ui.$select.setValue(vm.value);
                  vm.ui.$select.ui.$dialog.show();
                  props.onShow?.();
                }}
              >
                <Repeat class="w-4 h-4 text-w-fg-0" />
              </IconButton>
            </Flex>
          );
        }}
      </For>
    </div>
  );
}
