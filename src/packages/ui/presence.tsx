/**
 * @file 控制内容显隐的组件
 */
import { JSX, createSignal } from "solid-js";

import { PresenceCore } from "@/domains/ui/presence";
import { cn } from "@/utils";

import { Show } from "./show";

export const Presence = (props: { store: PresenceCore } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const [state, setState] = createSignal(props.store.state);

  props.store.onStateChange((v) => {
    setState(v);
  });

  return (
    <Show when={state().mounted}>
      <div
        class={cn("presence", props.class)}
        classList={props.classList}
        role="presentation"
        data-state={state().visible ? "open" : "closed"}
        onAnimationEnd={() => {
          props.store.unmount();
        }}
      >
        {props.children}
      </div>
    </Show>
  );
};
