import { JSX } from "solid-js/jsx-runtime";
import { createSignal, Show } from "solid-js";

import { FormFieldCore } from "@/domains/ui/form/field";

export function Field(
  props: { store: FormFieldCore<any> } & { extra?: JSX.Element } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const { store, extra } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <Show when={!state().hidden}>
      <div class="field">
        <div class="field__main">
          <div class="field__label flex items-center justify-between">
            <div class="field__title ml-2">{store.label}</div>
            <Show when={extra}>
              <div class="field__extra">
                {extra}
                {/* <div class="field__line--vertical"></div>
              <div class="field__text-btn"></div> */}
                {/* <div class="field__icon w-4 h-4"></div> */}
              </div>
            </Show>
          </div>
          <div class="field__content mt-1">
            <div class="field__value p-1">{props.children}</div>
          </div>
        </div>
      </div>
    </Show>
  );
}
