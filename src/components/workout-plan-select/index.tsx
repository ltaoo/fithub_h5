import { For } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { Button, Input, ListView, ScrollView } from "@/components/ui";

import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";

export function WorkoutPlanSelectView(props: { store: WorkoutPlanSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <div class="flex flex-col border-t">
        <div class="h-[56px] pt-2 px-4">
          <div class="flex gap-2">
            <Input store={vm.ui.$search_input_title} />
            <Button store={vm.ui.$search_btn_submit}>搜索</Button>
          </div>
        </div>
        <div class="flex-1 p-4">
          <ListView store={vm.request.workout_plan.list}>
            <ScrollView store={vm.ui.$view}>
              <div class="space-y-2">
                <For each={state().response.dataSource}>
                  {(plan) => {
                    return (
                      <div
                        classList={{
                          "p-4 rounded-md border": true,
                          "border-green-300": !!state().selected && state().selected?.id === plan.id,
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
            </ScrollView>
          </ListView>
        </div>
      </div>
    </div>
  );
}
