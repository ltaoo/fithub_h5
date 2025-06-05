/**
 * @file 训练计划选择
 */
import { For } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { Button, Input, ListView, ScrollView } from "@/components/ui";

import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";

export function WorkoutPlanSelectView(props: { store: WorkoutPlanSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <div class="flex flex-col">
        <div class="h-[56px] p-2">
          <div class="flex gap-2">
            <Input store={vm.ui.$input_keyword} />
            <Button store={vm.ui.$btn_search} size="sm">
              搜索
            </Button>
          </div>
        </div>
        <div class="flex-1 p-2">
          <ScrollView store={vm.ui.$scroll}>
            <ListView store={vm.request.workout_plan.list}>
              <div class="space-y-2">
                <For each={state().list}>
                  {(plan) => {
                    return (
                      <div
                        classList={{
                          "relative p-2 flex justify-between border-2 border-w-fg-3 rounded-md text-w-fg-0": true,
                          "border-w-fg-2 bg-w-bg-5 text-w-fg-0": plan.selected,
                        }}
                        onClick={() => {
                          vm.methods.select(plan);
                        }}
                      >
                        <div>
                          <div>{plan.title}</div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </ListView>
          </ScrollView>
        </div>
      </div>
    </div>
  );
}
