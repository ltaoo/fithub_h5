/**
 * @file 训练计划选择
 */
import { For, Show } from "solid-js";
import { Check, ChevronDown } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Button, Input, ListView, ScrollView } from "@/components/ui";

import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";

export function WorkoutPlanSelectView(props: { store: WorkoutPlanSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="flex flex-col h-w-screen bg-w-bg-0 border-w-fg-3">
      <div class="flex gap-2 p-2">
        <Input store={vm.ui.$input_keyword} />
        <Button store={vm.ui.$btn_search_submit} size="sm">
          搜索
        </Button>
      </div>
      <div class="flex-1 flex h-0 border-t-2 border-w-fg-3">
        <ScrollView store={vm.ui.$scroll}>
          <ListView store={vm.request.data.list} class="space-y-2 p-2">
            <For each={state().list}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "relative p-2 flex justify-between border-2 rounded-md": true,
                      "border-w-fg-2 text-w-fg-0 bg-w-bg-5": v.selected,
                      "border-w-fg-3 text-w-fg-1": !v.selected,
                    }}
                    onClick={() => {
                      vm.select(v);
                    }}
                  >
                    <div>
                      <div>{v.title}</div>
                    </div>
                    <Show when={v.selected}>
                      <div class="absolute top-1/2 -translate-y-1/2 right-4">
                        <Check class="w-4 h-4 text-green-500" />
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </ListView>
        </ScrollView>
      </div>
      <div>
        <div class="flex items-center gap-2 p-2 bg-w-bg-1 border-t border-w-fg-3">
          <div class="w-[40px] p-2 rounded-full bg-w-bg-5" onClick={() => vm.methods.cancel()}>
            <ChevronDown class="w-6 h-6 text-w-fg-0" />
          </div>
          <div class="flex-1 flex items-center gap-2">
            <Button store={vm.ui.$btn_confirm} class="w-full">
              确定
            </Button>
          </div>
        </div>
        <div class="safe-height"></div>
      </div>
    </div>
  );
}
