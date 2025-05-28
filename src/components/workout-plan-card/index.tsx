import { Clock } from "lucide-solid";
import { For } from "solid-js";

export function WorkoutPlanCard(props: {
  title: string;
  overview: string;
  cover_path: string;
  tags: string[];
  estimated_duration_text: string;
  onClick?: () => void;
}) {
  return (
    <div
      class="overflow-hidden relative w-full h-[160px] rounded-lg"
      style={
        props.cover_path
          ? {
              "background-size": "100% auto",
              "background-position": "center",
              "background-image": `url(${props.cover_path})`,
            }
          : {}
      }
      onClick={() => {
        props.onClick?.();
      }}
    >
      <div class="z-10 absolute inset-0 bg-gradient-to-r from-gray-600 to-transparent"></div>
      <div class="z-10 absolute inset-0 p-4 text-white">
        <div class="">
          <div class="text-2xl">{props.title}</div>
          <div>{props.overview}</div>
          <div class="mt-2">
            <div class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              <div class="text-sm">{props.estimated_duration_text}</div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <For each={props.tags}>
              {(text) => {
                return <div class="px-2 py-1 rounded-full border text-sm text-white">{text}</div>;
              }}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
