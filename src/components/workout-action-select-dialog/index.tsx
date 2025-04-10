/**
 * @file 动作多选面板
 */
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { Check } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";
import { Button, Dialog, Input, ListView, ScrollView } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { useViewModelStore } from "@/hooks";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { cn } from "@/utils/index";

export function WorkoutActionSelectDialogView(props: { store: WorkoutActionSelectDialogViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Dialog store={vm.ui.$dialog}>
      <div class="w-[520px]">
        <div class="flex gap-2">
          <div class="w-[180px]">
            <Select store={vm.ui.$search_type_select} />
          </div>
          <Input store={vm.ui.$search_input} />
          <Button class="w-20" store={vm.ui.$search_submit_btn}>
            搜索
          </Button>
          <Button variant="subtle" store={vm.ui.$search_reset_btn}>
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
    </Dialog>
  );
}
