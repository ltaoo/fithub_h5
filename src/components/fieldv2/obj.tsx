import { JSX } from "solid-js/jsx-runtime";
import { createSignal, Show } from "solid-js";

import { useViewModelStore } from "@/hooks";

import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

export function FieldObjV2(props: { store: ObjectFieldCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={!state().hidden}>
      <div class="field">
        <div class="field__main">
          <div class="field__label flex items-center justify-between">
            <div class="field__title ml-2">{state().label}</div>
          </div>
          <div class="field__content mt-1">
            <div class="field__value p-1">{props.children}</div>
          </div>
        </div>
      </div>
    </Show>
  );
}
