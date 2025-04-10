import { JSX, Show } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { PresenceCore } from "@/domains/ui";

export function ToolsBar(props: { store: PresenceCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="flex items-center justify-between rounded-full bg-gray-100 shadow-md transition-all duration-300">
      <div
        class="p-2 "
        onClick={() => {
          vm.toggle();
        }}
      >
        <Show when={state().visible} fallback={<ChevronLeft class="w-6 h-6" />}>
          <ChevronRight class="w-6 h-6" />
        </Show>
      </div>
      <div>
        <Show when={state().visible}>{props.children}</Show>
      </div>
    </div>
  );
}
