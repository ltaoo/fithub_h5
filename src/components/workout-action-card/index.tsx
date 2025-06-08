import { For } from "solid-js";

import { WorkoutActionProfile } from "@/biz/workout_action/services";

export function WorkoutActionCard(props: {
  zh_name: string;
  name: string;
  overview: string;
  muscles: { name: string }[];
}) {
  return (
    <div class="overflow-y-auto">
      <div class="rounded-xl">
        <div class="overflow-y-auto">
          {/* 动作标题 */}
          <div class="">
            <div class="text-xl text-w-fg-0 font-bold">{props.zh_name}</div>
            <div class="text-w-fg-1">{props.name}</div>
          </div>
          <div class="mt-2">
            <div class="text-w-fg-0">{props.overview}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
