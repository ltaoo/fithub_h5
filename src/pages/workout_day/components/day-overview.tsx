/**
 * @file 训练内容概览
 */
import { For, Show } from "solid-js";
import { ChevronDown, CircleCheck, Info } from "lucide-solid";

import { useViewModelStore } from "@/hooks";

import { HomeWorkoutDayUpdateViewModel } from "../update";
import { PageView } from "@/components/page-view";
import { Button } from "@/components/ui";

export function WorkoutDayOverviewView(props: { store: HomeWorkoutDayUpdateViewModel }) {
  const [state, vm] = useViewModelStore(props.store, { silence: true });

  return (
    <>
      <div class="flex flex-col h-[100vh] bg-w-bg-0">
        <div class="flex-1 overflow-y-auto">
          <div class="p-2">
            <div class="text-3xl text-w-fg-0">{state().stats.finished_at}</div>
            <div class="text-w-fg-1">
              <div class="flex">
                <div>开始时间</div>
                <div>{state().stats.started_at}</div>
              </div>
              <div class="flex">
                <div>总耗时</div>
                <div>{state().stats.duration}</div>
              </div>
            </div>
            <Show
              when={!!state().stats.uncompleted_actions.length}
              fallback={
                <div class="flex items-center mt-4 border border-green-600 bg-green-100 p-4 rounded-md">
                  <div>
                    <CircleCheck class="w-6 h-6 text-green-600" />
                  </div>
                  <div class="ml-2 text-green-600">所有动作已完成</div>
                </div>
              }
            >
              <div class="flex items-center mt-4 border border-red-600 bg-red-100 p-4 rounded-md">
                <div>
                  <Info class="w-6 h-6 text-red-600" />
                </div>
                <div class="ml-2 text-red-600">有 {state().stats.uncompleted_actions.length} 组未完成动作</div>
              </div>
            </Show>
            <div class="mt-4">
              <div class="rounded-md">
                <div class="space-y-1">
                  <For each={state().stats.sets}>
                    {(set, b) => {
                      return (
                        <div class="flex">
                          <div class="w-[36px]">{b() + 1}</div>
                          <div class="space-y-1">
                            <For each={set.actions}>
                              {(act, c) => {
                                return (
                                  <div class="flex items-center  text-w-fg-1">
                                    <div class="w-[120px] text-sm">{act.zh_name}</div>
                                    <div class="w-[68px]">
                                      {act.weight}
                                      <span class="ml-1 text-sm">{act.weight_unit}</span>
                                    </div>
                                    <span class="text-sm">x</span>
                                    <div>
                                      {act.reps}
                                      <span class="ml-1 text-sm">{act.reps_unit}</span>
                                    </div>
                                  </div>
                                );
                              }}
                            </For>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div>总容量</div>
              <div class="relative inline-block">
                <div class="text-3xl">{state().stats.total_volume}</div>
                <div class="absolute -right-6 bottom-1 text-sm">KG</div>
              </div>
            </div>
            <div class="mt-4">
              <div></div>
            </div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between gap-2 p-2 border-t-2 border-w-fg-3 bg-w-bg-1">
            <div
              class="w-[40px] p-2 bg-w-bg-5 rounded-full"
              onClick={() => {
                vm.ui.$dialog_confirm_complete.hide();
              }}
            >
              <ChevronDown class="w-6 h-6 text-w-fg-1" />
            </div>
            <div class="flex-1 flex items-center gap-2">
              <Button class="w-full" store={vm.ui.$btn_workout_day_give_up}>
                放弃
              </Button>
              <Button class="w-full" store={vm.ui.$btn_workout_day_submit}>
                提交
              </Button>
            </div>
          </div>
          <div class="safe-height"></div>
        </div>
      </div>
    </>
  );
}
