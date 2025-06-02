import { For } from "solid-js";

import { WorkoutActionProfile } from "@/biz/workout_action/services";

export function WorkoutActionCard(props: {} & WorkoutActionProfile) {
  return (
    <div class="overflow-y-auto">
      <div class="rounded-xl">
        <div class="p-2 overflow-y-auto">
          {/* 动作标题 */}
          <div class="">
            <h2 class="text-xl text-w-fg-0 font-bold">{props.zh_name}</h2>
            <h3 class="text-w-fg-0">{props.name}</h3>
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
          <div class="mt-4">
            <p class="text-w-fg-0">{props.overview}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
