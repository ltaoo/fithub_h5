/**
 * @file 小黑块 提示
 */
import { createSignal, JSX } from "solid-js";

import { Portal as PortalPrimitive } from "@/packages/ui/portal";
import { Presence } from "@/components/ui/presence";
import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils/index";

const Root = (props: { store: ToastCore } & JSX.HTMLAttributes<HTMLElement>) => {
  return props.children;
};

const Portal = (props: { store: ToastCore } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  return (
    <Presence store={store.present}>
      <PortalPrimitive>{props.children}</PortalPrimitive>
    </Presence>
  );
};

const Overlay = (props: { store: ToastCore } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  return <Presence store={store.present} class={cn(props.class)} classList={props.classList}></Presence>;
};

const Content = (props: { store: ToastCore } & JSX.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div class="" classList={props.classList}>
      <Presence store={props.store.present} class={cn(props.class)}>
        {props.children}
      </Presence>
    </div>
  );
};

export { Root, Portal, Overlay, Content };
