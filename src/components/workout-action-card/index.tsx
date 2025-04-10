import { For } from "solid-js";

import { WorkoutActionProfile } from "@/biz/workout_action/services";

export function WorkoutActionCard(props: {} & WorkoutActionProfile) {
  return (
    <div class="overflow-y-auto p-4">
      <div class="rounded-xl bg-w-bg-2">
        <div class="p-4 overflow-y-auto pb-24">
          {/* 动作标题 */}
          <div class="mb-6">
            <h2 class="text-3xl font-bold mb-1">{props.zh_name}</h2>
            <h3 class="text-xl">{props.name}</h3>

            {/* 目标肌肉标签 */}
            <div class="flex flex-wrap mt-4">
              <For each={props.muscles}>
                {(muscle) => {
                  return (
                    <span class="text-sm bg-red-400 text-white rounded-full px-3 py-1 mr-2 mb-2 dark:bg-red-400">
                      {muscle.id}
                    </span>
                  );
                }}
              </For>
            </div>
          </div>

          {/* 益处简述 */}
          <div class="text-w-fg-2 mb-6">
            <p class="text-w-fg-2">{props.overview}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
