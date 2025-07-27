/**
 * @file 控制内容显隐的组件
 */
import { JSX, Show, createSignal } from "solid-js";

import { useViewModelStore } from "@/hooks";

import { PresenceCore } from "@/domains/ui/presence";

export const Presence = (
  props: { store: PresenceCore; animation?: { in: string; out: string } } & JSX.HTMLAttributes<HTMLElement>
) => {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={state().mounted}>
      <div
        class={props.class}
        // classList={props.classList}
        classList={{
          ...props.classList,
          [`${props.animation?.in ?? "fade-in"}`]: state().enter,
          [`${props.animation?.out ?? "fade-out"}`]: state().exit,
        }}
        role="presentation"
        data-state={state().visible ? "open" : "closed"}
        onClick={props.onClick}
      >
        {props.children}
      </div>
    </Show>
  );
};
