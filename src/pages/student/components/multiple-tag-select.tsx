import { For, JSX } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { MultipleSelectionCore } from "@/domains/multiple";

export function MultipleTagSelect(
  props: { store: MultipleSelectionCore<string> } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div classList={{ "flex flex-wrap gap-2": true, [props.class || ""]: true }}>
      <For each={state().options}>
        {(opt) => {
          return (
            <div
              classList={{
                "inline-block px-2 py-1 rounded-md border border-gray-200 text-gray-500": true,
                "border-blue-500 bg-blue-500 text-white": state().value.includes(opt.value),
              }}
              onClick={() => {
                vm.toggle(opt.value);
              }}
            >
              {opt.label}
            </div>
          );
        }}
      </For>
    </div>
  );
}
