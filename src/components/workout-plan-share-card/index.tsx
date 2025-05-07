import { Show, For, Match, Switch } from "solid-js";

import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { WorkoutPlanPreviewPayload } from "@/biz/workout_plan/types";

type WorkoutPlanPreviewCardProps = {} & WorkoutPlanPreviewPayload;
export function WorkoutPlanPreviewCard(props: WorkoutPlanPreviewCardProps) {
  const { title, overview, timeline, sets_count, actions_count } = props;

  return (
    <div class="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900/95 via-gray-900 to-gray-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800/20">
      {/* 顶部区域 */}
      <div class="relative h-44">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
          alt="Workout background"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-gray-900" />

        <div class="absolute inset-x-0 bottom-0 p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-white mb-2 line-clamp-1">{title}</h2>
              <p class="text-gray-200 text-sm line-clamp-2">{overview}</p>
            </div>
            <div class="flex-shrink-0 ml-4">
              <img
                src="https://unpkg.com/lucide-static@latest/icons/qr-code.svg"
                class="w-16 h-16 p-2 bg-white/10 backdrop-blur-lg rounded-xl"
                alt="QR Code"
              />
            </div>
          </div>

          <div class="flex items-center gap-6 mt-4">
            <div class="flex items-center gap-2">
              <img src="https://unpkg.com/lucide-static@latest/icons/repeat.svg" class="w-4 h-4 text-blue-400" />
              <span class="text-sm">{actions_count} 轮</span>
            </div>
            <div class="w-px h-4 bg-gray-700/50"></div>
            <div class="flex items-center gap-2">
              <img src="https://unpkg.com/lucide-static@latest/icons/list.svg" class="w-4 h-4 text-blue-400" />
              <span class="text-sm">{sets_count} 组</span>
            </div>
          </div>
        </div>
      </div>

      {/* 训练步骤列表 */}
      <div class="p-4 space-y-2.5">
        <For each={timeline}>
          {(line) => (
            <div class="space-y-2.5">
              <Show when={timeline.length > 1}>
                <div class="text-sm font-medium text-gray-300 pl-2">{line.text}</div>
              </Show>
              <For each={line.steps}>
                {(step, index) => (
                  <div class="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                    <div class="p-3">
                      <Switch>
                        <Match when={[WorkoutPlanSetType.Normal].includes(step.set_type)}>
                          <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-medium text-sm">
                              {index() + 1}
                            </div>
                            <div class="flex-1">
                              <For each={step.actions}>
                                {(action) => (
                                  <div class="flex items-center gap-2 text-sm">
                                    <span class="text-gray-200">{action.action_name}</span>
                                    <span class="text-blue-400 font-medium">{action.reps}</span>
                                  </div>
                                )}
                              </For>
                            </div>
                            <div class="flex-shrink-0 text-sm text-gray-400">x{step.sets_count}</div>
                          </div>
                        </Match>
                        <Match when={[WorkoutPlanSetType.Super].includes(step.set_type)}>
                          <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-medium text-sm">
                              {index() + 1}
                            </div>
                            <div class="flex-1">
                              {/* <div class="flex items-center gap-2">
                                <span class="text-gray-200">{step.title}</span>
                              </div> */}
                              <For each={step.actions}>
                                {(action) => (
                                  <div class="flex items-center gap-2 text-sm">
                                    <span class="text-gray-200">{action.action_name}</span>
                                    <span class="text-blue-400 font-medium">{action.reps}</span>
                                  </div>
                                )}
                              </For>
                            </div>
                            <div class="flex-shrink-0 text-sm text-gray-400">x{step.sets_count}</div>
                          </div>
                        </Match>
                      </Switch>
                    </div>
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </div>

      {/* 底部推广区域 */}
      <div class="p-4 bg-gradient-to-t from-gray-900 to-transparent">
        <div class="flex items-center justify-between text-sm text-gray-400">
          <div class="flex items-center gap-2">{/* <span>扫码查看完整计划</span> */}</div>
          <img src="https://unpkg.com/lucide-static@latest/icons/arrow-right.svg" class="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
