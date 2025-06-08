import { Bird, Loader2 } from "lucide-solid";
import { For, Show } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { WorkoutActionCard } from "@/components/workout-action-card";
import { SetValueView } from "@/components/set-value-view";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { Divider } from "@/components/divider";
import { TabHeader } from "@/components/ui/tab-header";

import { WorkoutActionProfileViewModel } from "@/biz/workout_action/workout_action";

import { WorkoutActionProfileTabHeader } from "./tabs";

export function WorkoutActionProfileView(props: { store: WorkoutActionProfileViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="relative flex flex-col h-screen">
      <Show when={state().loading}>
        <div class="absolute inset-0">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex items-center justify-center p-4 rounded-lg text-w-fg-0 bg-w-bg-5">
              <Loader2 class="w-8 h-8 animate-spin" />
            </div>
          </div>
        </div>
      </Show>
      <Show when={state().profile}>
        <div>
          <div class="p-4">
            <WorkoutActionCard {...state().profile!} />
          </div>
          <WorkoutActionProfileTabHeader store={vm.ui.$tab} />
        </div>
        <div class="flex-1 h-0 overflow-y-auto scroll--hidden">
          <Show when={state().curTabId === 1}>
            <div class="space-y-4 mt-4 p-2">
              <For each={state().profile?.steps}>
                {(step, index) => {
                  return (
                    <div class="relative pl-6">
                      {/* Timeline dot and line */}
                      <div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-w-fg-0"></div>
                      {index() < state().profile!.steps.length - 1 && (
                        <div
                          class="absolute left-[7px] top-4 w-0.5 h-full bg-w-fg-3"
                          // classList={{
                          //   "h-[80%]": index() === state().profile!.steps.length - 1,
                          // }}
                        ></div>
                      )}
                      <div class="rounded-lg">
                        <div class="flex flex-wrap gap-2">
                          <For each={step.tips}>
                            {(tip) => {
                              return <div class="bg-w-bg-3 rounded text-sm text-w-fg-0">{tip}</div>;
                            }}
                          </For>
                        </div>
                        <div class="text-w-fg-0">{step.text}</div>
                        <Show when={step.imgs.length}>
                          <div class="overflow-x-auto mt-4 pb-2">
                            <div class="flex gap-3 min-w-min">
                              <For each={step.imgs}>
                                {(img) => {
                                  return (
                                    <div class="flex-shrink-0 w-[180px] h-[120px] rounded-lg overflow-hidden">
                                      <img class="w-full h-full object-cover" src={img} />
                                    </div>
                                  );
                                }}
                              </For>
                            </div>
                          </div>
                        </Show>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
            <Divider />
            <div class="p-4">
              <BodyMusclePreview store={vm.ui.$muscle} />
            </div>
          </Show>
          <Show when={state().curTabId === 2}>
            <Show
              when={state().histories.length}
              fallback={
                <div class="flex items-center justify-center p-4">
                  <div>
                    <Bird class="w-12 h-12 text-w-fg-1" />
                  </div>
                </div>
              }
            >
              <div class="space-y-2 mt-2">
                <div class="border-2 border-w-fg-3 rounded-lg">
                  <div class="flex items-center justify-between p-2 border-b-2 border-w-fg-3">
                    <div class="text-w-fg-0">最大重量</div>
                  </div>
                  <div class="p-2 space-y-2">
                    <For each={state().histories}>
                      {(v) => {
                        return (
                          <div class="">
                            <SetValueView
                              reps={v.reps}
                              reps_unit={v.reps_unit}
                              weight={v.weight}
                              weight_unit={v.weight_unit}
                            />
                            <div class="text-sm text-w-fg-1">{v.created_at}</div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
            </Show>
          </Show>
          <div class="h-[68px]"></div>
        </div>
      </Show>
    </div>
  );
}
