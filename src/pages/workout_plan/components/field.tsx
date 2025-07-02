import { JSX } from "solid-js/jsx-runtime";
import { createSignal, For, Show } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { Flex } from "@/components/flex/flex";

import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

export function SetValueField(props: { store: SingleFieldCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={!state().hidden}>
      <div class="field w-full">
        <div class="field__main">
          <Flex class="field__label" justify="between">
            <div class="field__title text-sm text-w-fg-2">{state().label}</div>
          </Flex>
          <div class="field__content">
            <div class="field__value">{props.children}</div>
          </div>
        </div>
      </div>
    </Show>
  );
}

export function SetValueArrayField<T extends (v: number) => any>(
  props: {
    store: ArrayFieldCore<T>;
    hide_label?: boolean;
    render: (field: ReturnType<T>) => JSX.Element;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={!state().hidden}>
      <div class={props.class} classList={props.classList}>
        <For each={state().fields}>
          {(field, idx) => {
            const store = props.store.mapFieldWithIndex(idx());
            if (store === null) {
              return null;
            }
            return props.render(store.field);
          }}
        </For>
      </div>
    </Show>
  );
}
