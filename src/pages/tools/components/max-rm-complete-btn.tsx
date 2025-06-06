import { Show } from "solid-js";
import { Check, X } from "lucide-solid";

import { CheckboxCore } from "@/domains/ui";
import { useViewModelStore } from "@/hooks";

export function MaxRMCompleteBtn(props: { onOk?: () => void; onFailed?: () => void; highlight?: boolean }) {
  //   const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={props.highlight}>
      <div class="overflow-hidden relative flex items-center gap-2 transition-all duration-200">
        <div
          class=""
          classList={{
            "flex items-center justify-center p-2 rounded-full bg-w-fg-5 text-w-fg-0": true,
          }}
          onClick={() => {
            props.onOk?.();
          }}
        >
          <Check class="w-6 h-6" />
        </div>
        <div
          class=""
          classList={{
            "flex items-center justify-center p-2 rounded-full bg-w-fg-5 text-w-fg-0": true,
          }}
          onClick={() => {
            props.onFailed?.();
          }}
        >
          <X class="w-6 h-6" />
        </div>
      </div>
    </Show>
  );
}
