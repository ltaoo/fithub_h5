import { JSX, Show, createContext, createSignal, onMount, useContext } from "solid-js";
import { Portal as PortalPrimitive } from "solid-js/web";

import { SelectCore } from "@/domains/ui/select";
import { SelectOptionCore } from "@/domains/ui/select/option";
import { SelectViewportCore } from "@/domains/ui/select/viewport";
import { SelectContentCore } from "@/domains/ui/select/content";
import { SelectTriggerCore } from "@/domains/ui/select/trigger";
import { SelectValueCore } from "@/domains/ui/select/value";
import { SelectWrapCore } from "@/domains/ui/select/wrap";
import { cn } from "@/utils";

import * as Collection from "./collection";
import * as PopperPrimitive from "./popper";
import * as PopoverPrimitive from "./popover";
import { DismissableLayer } from "./dismissable-layer";

const SELECTION_KEYS = [" ", "Enter"];

// const SelectContext = createContext<SelectCore>();
// const SelectContentContext = createContext<SelectCore>();
// const SelectNativeOptionContext = createContext<SelectCore>();
const Root = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  return <PopperPrimitive.Root store={store.popper}>{props.children}</PopperPrimitive.Root>;
};

const Trigger = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  let $button: HTMLButtonElement;
  // const store = useContext(SelectContext);

  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    setState(nextState);
  });

  onMount(() => {
    const $$button = $button;
    if (!$$button) {
      return;
    }
    //     const trigger = new SelectTriggerCore({
    //       $node: () => $$button,
    //       getRect() {
    //         return $$button.getBoundingClientRect();
    //       },
    //       getStyles() {
    //         return window.getComputedStyle($$button);
    //       },
    //     });
    //     store.setTrigger(trigger);
  });

  const open = () => state().open;
  const required = () => state().required;
  const disabled = () => state().disabled;

  return (
    <PopperPrimitive.Anchor store={store.popper}>
      <button
        ref={(ref) => {
          $button = ref;
        }}
        class={props.class}
        type="button"
        role="combobox"
        aria-expanded={open()}
        aria-required={required()}
        aria-autocomplete="none"
        data-state={open() ? "open" : "closed"}
        disabled={disabled()}
        onClick={(event) => {
          event.currentTarget.focus();
        }}
        onPointerDown={(event) => {
          if (event.button === 0 && event.ctrlKey === false) {
            store.setTriggerPointerDownPos({
              x: Math.round(event.pageX),
              y: Math.round(event.pageY),
            });
            store.show();
          }
        }}
        onKeyDown={() => {
          // ...
        }}
      >
        {props.children}
      </button>
    </PopperPrimitive.Anchor>
  );
};

const Value = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  let $value: HTMLSpanElement | undefined;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => {
    setState(v);
  });
  // store.onValueChange((selectedItem) => {});

  // const valueCore = new SelectValueCore({
  //   $node: () => $value!,
  //   getRect() {
  //     if ($value) {
  //       return $value.getBoundingClientRect();
  //     }
  //     return {
  //       left: 0,
  //       top: 0,
  //       bottom: 0,
  //       right: 0,
  //       x: 0,
  //       y: 0,
  //       width: 0,
  //       height: 0,
  //       toJSON() {
  //         return {};
  //       },
  //     };
  //   },
  //   getStyles() {
  //     if ($value) {
  //       // @todo 不能出现 window
  //       return window.getComputedStyle($value);
  //     }
  //     return {} as CSSStyleDeclaration;
  //   },
  // });
  //   store.setValue(valueCore);

  const show_placeholder = () => state().value === undefined && state().placeholder !== undefined;

  return (
    <span style={{ "pointer-events": "none" }}>
      <Show when={!show_placeholder()} fallback={state().placeholder}>
        {state().value?.label}
      </Show>
    </span>
  );
};

const Icon = (props: { class?: string; children: JSX.Element }) => {
  return (
    <span class={props.class} aria-hidden>
      {props.children || "▼"}
    </span>
  );
};

const Portal = (props: { children: JSX.Element }) => {
  return <PortalPrimitive>{props.children}</PortalPrimitive>;
};

const Content = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;
  //   const store = useContext(SelectContext);
  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => {
    setState(v);
  });

  return (
    <PopoverPrimitive.Portal store={store.popover}>
      <PopoverPrimitive.Content store={store.popover}>
        <ContentImpl store={store} class={props.class} classList={props.classList}>
          {props.children}
        </ContentImpl>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

const ContentImpl = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  let $content: HTMLDivElement;

  // const content = new SelectContentCore({
  //   $node: () => $content,
  //   getRect() {
  //     return $content.getBoundingClientRect();
  //   },
  //   getStyles() {
  //     return window.getComputedStyle($content);
  //   },
  // });

  // store.onFocus(() => {
  //   console.log(...store.log("onFocus"));
  //   $content.focus();
  // });
  // window.addEventListener("blur", store.hide);
  //   app.onResize(() => {
  //     store.hide();
  //   });

  // onMount(() => {
  //   console.log("SelectContent mounted", $content);
  // });

  // onMount(() => {
  //   store.setContent(content);
  // });

  const SelectPosition = store.position === "popper" ? PopperPosition : ItemAlignedPosition;

  return (
    <DismissableLayer asChild store={store.layer}>
      <SelectPosition
        store={store}
        // ref={$content}
        role="listbox"
        class={props.class}
        classList={props.classList}
        style={{
          display: "flex",
          "flex-direction": "column",
          // reset the outline by default as the content MAY get focused
          outline: "none",
        }}
      >
        {props.children}
      </SelectPosition>
    </DismissableLayer>
  );
};

const ItemAlignedPosition = (
  props: {
    store: SelectCore<any>;
    ref?: ((el: HTMLDivElement) => void) | HTMLDivElement;
    children: JSX.Element;
  } & {
    class?: string;
    style?: JSX.CSSProperties;
  } & JSX.AriaAttributes
) => {
  const { store } = props;

  let $wrap: HTMLDivElement;
  let $content: HTMLDivElement;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    setState(nextState);
  });

  //   const wrap = new SelectWrapCore({
  //     $node() {
  //       return $wrap;
  //     },
  //     getRect() {
  //       return $wrap.getBoundingClientRect();
  //     },
  //     getStyles() {
  //       return window.getComputedStyle($wrap);
  //     },
  //   });
  //   store.setWrap(wrap);

  onMount(() => {
    console.log(...store.log("SelectItemAlignedPosition", $content, $wrap));
    // store.position();
  });

  const wrapStyles = () => state().styles;

  return (
    <div
      ref={(ref) => {
        $wrap = ref;
      }}
      class={cn("select__content-wrap")}
      style={{
        display: "flex",
        "flex-direction": "column",
        position: "fixed",
        // ...wrapStyles(),
        "z-index": 999,
      }}
    >
      <div
        ref={(el) => {
          $content = el;
          if (typeof props.ref === "function") {
            props.ref(el);
            return;
          }
          props.ref = el;
        }}
        role={props.role}
        class={cn("select__content", props.class)}
        style={{
          // When we get the height of the content, it includes borders. If we were to set
          // the height without having `boxSizing: 'border-box'` it would be too big.
          "box-sizing": "border-box",
          // We need to ensure the content doesn't get taller than the wrapper
          "max-height": "100%",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

const PopperPosition = (
  props: {
    ref?: ((el: HTMLDivElement) => void) | HTMLDivElement;
    store: SelectCore<any>;
  } & JSX.HTMLAttributes<HTMLDivElement> &
    JSX.AriaAttributes
) => {
  const { store } = props;

  return (
    <PopperPrimitive.Content
      role={props.role}
      class={props.class}
      classList={props.classList}
      style={{
        "box-sizing": "border-box",
        // @ts-ignore
        ...(props.style || {}),
      }}
      store={store.popper}
    >
      {props.children}
    </PopperPrimitive.Content>
  );
};

const Viewport = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) => {
  const style = `[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`;

  const { store } = props;

  let $viewport: HTMLDivElement;

  // const viewport = new SelectViewportCore({
  //   $node: () => $viewport,
  //   getRect() {
  //     return $viewport.getBoundingClientRect();
  //   },
  //   getStyles() {
  //     return window.getComputedStyle($viewport);
  //   },
  // });
  // onMount(() => {
  //   store.setViewport(viewport);
  // });

  return (
    <>
      <style>{style}</style>
      <div
        ref={(ref) => {
          $viewport = ref;
        }}
        class={props.class}
        classList={props.classList}
        role="presentation"
        style={{
          position: "relative",
          // flex: 1,
          overflow: "auto",
        }}
        // onScroll={(event) => {
        //   const $viewport = event.currentTarget;
        // }}
      >
        {props.children}
      </div>
    </>
  );
};

const Group = (props: { store: SelectCore<any>; children: JSX.Element }) => {
  const { store } = props;

  return <div role="group">{props.children}</div>;
};

const Label = (props: { class?: string; children: JSX.Element }) => {
  return <div class={props.class}>{props.children}</div>;
};

const Option = (
  props: {
    parent: SelectCore<any>;
    store: SelectOptionCore<any>;
    value?: string;
  } & JSX.HTMLAttributes<HTMLDivElement>
) => {
  const { parent, store } = props;

  let $item: HTMLDivElement | undefined;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    setState(nextState);
  });
  store.onFocus(() => {
    if (!$item) {
      return;
    }
    $item.focus({ preventScroll: true });
  });
  //   onMount(() => {
  //     store.appendItem(item);
  //   });
  // onCleanup(() => {
  //   item.destroy();
  // });

  return (
    <div
      ref={(ref) => {
        $item = ref;
      }}
      class={props.class}
      classList={props.classList}
      role="option"
      aria-selected={state().selected && state().focused}
      aria-disabled={state().disabled || undefined}
      tabIndex={state().disabled ? undefined : -1}
      data-highlighted={state().focused ? "" : undefined}
      data-state={state().selected ? "checked" : "unchecked"}
      data-disabled={state().disabled ? "" : undefined}
      // onPointerUp={() => {
      //   parent.handlePointerUp(store);
      // }}
      onPointerEnter={(event) => {
        store.handlePointerEnter();
      }}
      // onPointerMove={(event) => {
      //   store.handlePointerMove({ x: event.pageX, y: event.pageY });
      // }}
      onPointerLeave={() => {
        store.handlePointerLeave();
      }}
      // onKeyDown={(event) => {
      //   if (SELECTION_KEYS.includes(event.key)) {
      //     parent.handlePointerUp(store);
      //   }
      // }}
      onClick={() => {
        store.handleClick();
      }}
      onFocus={() => {
        // console.log(...itemCore.log("onFocus", value));
        store.handleFocus();
      }}
      onBlur={() => {
        // console.log(...itemCore.log("onBlur", value));
        store.handleBlur();
      }}
    >
      {props.children}
    </div>
  );
};

const OptionText = (props: { store: SelectOptionCore<any>; children: JSX.Element }) => {
  const { store } = props;
  //   const store = useContext(SelectContext);
  //   const item = useContext(SelectItemContext);
  let $node: HTMLSpanElement | undefined;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    //     console.log(store.value?.$node(), props.children);
    setState(nextState);
  });
  //   store.setText({
  //     $node: () => $node,
  //     getRect() {
  //       return $node.getBoundingClientRect();
  //     },
  //     getStyles() {
  //       return window.getComputedStyle($node);
  //     },
  //   });

  //   const selected = () => state().selected;
  //   let $option = (
  //     <option value={state().value} disabled={state().disabled}>
  //       {$node?.textContent}
  //     </option>
  //   );

  return (
    <>
      <span
        ref={(ref) => {
          $node = ref;
        }}
      >
        {props.children}
      </span>
      {/* <Show when={selected()}>
        <PortalPrimitive mount={store.value.$node()}>{props.children}</PortalPrimitive>
      </Show> */}
    </>
  );
};

const ItemIndicator = (props: { store: SelectOptionCore<any> } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => {
    //     console.log(...item.log("item.onStateChange", item.value, nextState.selected));
    setState(v);
  });

  return (
    <Show when={state().selected}>
      <span class={props.class} aria-hidden>
        {props.children}
      </span>
    </Show>
  );
};

// const ScrollUpButton = (props: { class?: string; children: JSX.Element }) => {
//   const canScrollUp = () => true;
//   return (
//     <Show when={canScrollUp()}>
//       <ScrollButtonImpl class={props.class}>{props.children}</ScrollButtonImpl>
//     </Show>
//   );
// };

// const ScrollDownButton = (props: { class?: string; children: JSX.Element }) => {
//   const canScrollDown = () => true;
//   return (
//     <Show when={canScrollDown()}>
//       <ScrollButtonImpl class={props.class}>{props.children}</ScrollButtonImpl>
//     </Show>
//   );
// };

// const ScrollButtonImpl = (props: { class?: string; children: JSX.Element }) => {
//   return (
//     <div
//       class={props.class}
//       onPointerMove={() => {
//         // ...
//       }}
//       onPointerLeave={() => {
//         // ...
//       }}
//     >
//       {props.children}
//     </div>
//   );
// };

// const Separator = (props: { class?: string }) => {
//   return <div class={props.class} aria-hidden />;
// };

// const Arrow = () => {
//   const store = useContext(SelectContext);
//   return <PopperPrimitive.Arrow store={store.popper}></PopperPrimitive.Arrow>;
// };

const BubbleSelect = (props: { children: JSX.Element }) => {
  return <select />;
};

export {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Label,
  Option,
  OptionText,
  ItemIndicator,
  //   ScrollUpButton,
  //   ScrollDownButton,
  //   Separator,
  //   Arrow,
};
