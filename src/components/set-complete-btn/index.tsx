import { Show } from "solid-js";
import { Check, Circle } from "lucide-solid";

import { InputCore } from "@/domains/ui";
import { useViewModelStore } from "@/hooks";

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
      {/* <input
        class="absolute inset-0 opacity-0"
        type="checkbox"
        onChange={(e) => {
          props.store.setValue(e.target.checked);
        }}
      /> */}
      <div class="flex items-center justify-center px-4 h-10 rounded-lg border border-gray-300  bg-white">
        <Show
          when={state().value}
          fallback={
            <div class="text-gray-400">
              <Check size={16} />
            </div>
          }
        >
          <div class="text-green-500">
            <Check size={16} />
          </div>
        </Show>
      </div>
    </div>
  );
}
