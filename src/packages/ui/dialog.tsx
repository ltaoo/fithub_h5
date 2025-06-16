/**
 * @file 弹窗 组件
 */
import { createSignal, JSX } from "solid-js";

import { DialogCore } from "@/domains/ui/dialog";
import { Presence } from "@/components/ui/presence";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

import { Portal as PortalPrimitive } from "./portal";

const Root = (props: { store: DialogCore } & JSX.HTMLAttributes<HTMLElement>) => {
  return props.children;
};

const Portal = (
  props: { store: DialogCore; enterClassName?: string; exitClassName?: string } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { store, enterClassName, exitClassName } = props;

  return (
    <PortalPrimitive>
      <Presence store={store.present} classList={props.classList}>
        <div class={props.class}>{props.children}</div>
      </Presence>
    </PortalPrimitive>
  );
};

const Overlay = (
  props: { store: DialogCore; enterClassName?: string; exitClassName?: string } & JSX.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <Presence
      store={props.store.present}
      class={cn(props.class)}
      classList={props.classList}
      onClick={() => {
        if (!props.store.closeable) {
          return;
        }
        props.store.hide();
      }}
    ></Presence>
  );
};

const Content = (
  props: { store: DialogCore; enterClassName?: string; exitClassName?: string } & JSX.HTMLAttributes<HTMLElement>
) => {
  return (
    <Presence store={props.store.present} class={cn(props.class)} classList={props.classList}>
      {props.children}
    </Presence>
  );
};

const Close = (props: { store: DialogCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    setState(nextState);
  });

  return (
    <div
      class={props.class}
      classList={props.classList}
      data-state={getState(state().open)}
      onClick={() => {
        props.store.hide();
      }}
    >
      {props.children}
      <span class="sr-only">Close</span>
    </div>
  );
};

const Header = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <div class={cn(props.class)}>{props.children}</div>;
};

const Footer = (props: {} & JSX.HTMLAttributes<HTMLDivElement>) => {
  return <div class={cn(props.class)}>{props.children}</div>;
};

const Title = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <div class={cn(props.class)}>{props.children}</div>;
};

const Submit = (props: { store: DialogCore } & JSX.HTMLAttributes<HTMLButtonElement>) => {
  const { store } = props;

  return <Button store={store.okBtn}>{props.children}</Button>;
};

const Cancel = (props: { store: DialogCore } & JSX.HTMLAttributes<HTMLButtonElement>) => {
  const { store } = props;

  return (
    <Button variant="subtle" store={store.cancelBtn}>
      {props.children}
    </Button>
  );
};

function getState(open: boolean) {
  return open ? "open" : "closed";
}

export { Root, Portal, Header, Title, Content, Close, Overlay, Footer, Submit, Cancel };
