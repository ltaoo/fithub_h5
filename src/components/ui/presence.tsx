/**
 * @file 控制内容显隐的组件
 */
import { JSX, Show, createSignal } from "solid-js";

import { PresenceCore } from "@/domains/ui/presence";
import { cn } from "@/utils/index";

export const Presence = (props: { store: PresenceCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store, onClick } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <Show when={state().mounted}>
      <div
        class={props.class}
        classList={props.classList}
        role="presentation"
        data-state={state().visible ? "open" : "closed"}
        onClick={onClick}
      >
        {props.children}
      </div>
    </Show>
  );
};
