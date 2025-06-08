/**
 * @file ???
 */
import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import { RouteViewCore } from "@/domains/route_view";
import { cn } from "@/utils/index";
import { ViewComponentProps } from "@/store/types";

export function KeepAliveRouteView(
  props: { store: RouteViewCore; app: ViewComponentProps["app"]; index: number } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, setState] = createSignal(props.store.$presence.state);

  // store.onStateChange((v) => setState(v));
  props.store.$presence.onStateChange((v) => setState(v));
  props.store.ready();
  onMount(() => {
    if (props.store.mounted) {
      return;
    }
    props.store.setShow();
  });
  onCleanup(() => {
    props.store.setUnmounted();
    props.store.destroy();
  });

  // const className = cn(mounted() ? "block" : "hidden", props.class);

  return (
    <div
      classList={{
        "duration-200": true,
        [`animate-in ${props.store.animation.in ?? "fade-in"}`]: state().enter,
        [`animate-out ${props.store.animation.out ?? "fade-out"}`]: state().exit,
        "absolute inset-0 w-full": !props.app.env.pc,
        "absolute left-1/2 -translate-x-1/2 w-[375px] mx-auto": props.app.env.pc,
        [props.class || ""]: true,
      }}
      style={{
        "z-index": props.index,
        display: state().visible ? "block" : "none",
      }}
      data-state={state().visible ? "open" : "closed"}
      data-title={props.store.title}
      data-href={props.store.href}
    >
      {props.children}
    </div>
  );
}
