import { Show } from "solid-js";
import { Check, Circle, Pause, Play } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { InputCore } from "@/domains/ui";

export function SetCompleteBtn(props: { store: InputCore<any>; onClick?: (event: { x: number; y: number }) => void }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div
      class="overflow-hidden relative flex items-center gap-2"
      onClick={(event) => {
        const { x, y } = event;
        props.store.handleClick({ x, y });
        props.onClick?.(event);
      }}
    >
      <div
        class=""
        classList={{
          "flex items-center justify-center p-2 rounded-full bg-white": true,
          "bg-gray-100": !state().value,
          "bg-white": state().value,
        }}
      >
        <Show
          when={state().value}
          fallback={
            <div class="text-gray-400">
              <Check class="w-4 h-4" />
            </div>
          }
        >
          <div class="text-green-500">
            <Check class="w-4 h-4" />
          </div>
        </Show>
      </div>
    </div>
  );
}
