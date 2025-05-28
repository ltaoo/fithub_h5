import { JSX, Show } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { PresenceCore } from "@/domains/ui";

export function ToolsBar(props: { store: PresenceCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="flex items-center justify-between rounded-full transition-all duration-300 bg-gray-200">
      <div
        class="flex items-center justify-center p-4 rounded-full bg-gray-200"
        onClick={() => {
          vm.toggle();
        }}
      >
        <Show when={state().visible} fallback={<ChevronLeft class="w-8 h-8 text-gray-800" />}>
          <ChevronRight class="w-8 h-8 text-gray-800" />
        </Show>
      </div>
      <div>
        <Show when={state().visible}>{props.children}</Show>
      </div>
    </div>
  );
}
