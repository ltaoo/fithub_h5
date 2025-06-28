/**
 * @file 控制内容显隐的组件
 */
import { JSX, Show, createSignal } from "solid-js";

import { PresenceCore } from "@/domains/ui/presence";

export const Presence = (props: { store: PresenceCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const [state, setState] = createSignal(props.store.state);
  props.store.onStateChange((v) => setState(v));

  return (
    <Show when={state().mounted}>
      <div
        class={props.class}
        classList={props.classList}
        role="presentation"
        data-state={state().visible ? "open" : "closed"}
        onClick={props.onClick}
      >
        {props.children}
      </div>
    </Show>
  );
};
