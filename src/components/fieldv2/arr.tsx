import { JSX } from "solid-js/jsx-runtime";
import { createSignal, For, Show } from "solid-js";
import { Plus, Trash } from "lucide-solid";

import { useViewModelStore } from "@/hooks";

import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

import { FieldV2 } from "./field";

export function FieldArrV2<T extends () => any>(
  props: {
    store: ArrayFieldCore<T>;
    render: (field: ReturnType<T>) => JSX.Element;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={!state().hidden}>
      <div
        class="inline-block p-2 rounded-full bg-w-bg-5"
        onClick={() => {
          vm.append();
        }}
      >
        <Plus class="w-6 h-6" />
      </div>
      <For each={state().fields}>
        {(field, idx) => {
          const store = props.store.mapFieldWithIndex(idx());
          if (store === null) {
            return null;
          }
          return (
            <div class="flex">
              <div class="mt-2">{props.render(store.field)}</div>
              <div class="operations flex items-center gap-2">
                <div
                  class="inline-block p-2 rounded-full bg-w-bg-5"
                  onClick={() => {
                    vm.remove(idx());
                  }}
                >
                  <Trash class="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </Show>
  );
}
