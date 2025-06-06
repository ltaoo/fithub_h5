import { Show } from "solid-js";
import { Check, Circle, Pause, Play } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { InputCore } from "@/domains/ui";

export function SetCompleteBtn(props: {
  store: InputCore<any>;
  highlight?: boolean;
  onClick?: (event: { x: number; y: number }) => void;
}) {
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
          "flex items-center justify-center p-2 rounded-full": true,
          // "bg-w-bg-5": !state().value,
          "bg-w-fg-5": !!props.highlight,
        }}
      >
        <Show
          when={state().value}
          fallback={
            <div
              classList={{
                "text-w-fg-0": !!props.highlight,
                "text-w-fg-1": !props.highlight,
              }}
            >
              <Check class="w-6 h-6" />
            </div>
          }
        >
          <Check class="w-6 h-6 text-green-500" />
        </Show>
      </div>
    </div>
  );
}
