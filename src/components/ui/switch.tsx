import { JSX } from "solid-js/jsx-runtime";

import { CheckboxCore } from "@/domains/ui";
import { useViewModelStore } from "@/hooks";

export function Switcher(props: { store: CheckboxCore; texts: string[] } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="flex items-center gap-2">
      <div
        class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          props.store.checked ? "bg-blue-500" : "bg-gray-200"
        } ${props.class || ""}`}
        role="switch"
        aria-checked={state().checked}
        onClick={() => {
          props.store.toggle();
        }}
      >
        <span
          class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            props.store.checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
      <div class="text-w-fg-1">
        <div>{state().checked ? props.texts[0] : props.texts[1]}</div>
      </div>
    </div>
  );
}
