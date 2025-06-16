/**
 * @file 气泡 组件
 */
import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { X } from "lucide-solid";

import { PopoverCore } from "@/domains/ui/popover";
import { Align, Side } from "@/domains/ui/popper";
import * as PopoverPrimitive from "@/packages/ui/popover";
import { cn } from "@/utils";
import { useViewModelStore } from "@/hooks";

export function Popover(props: { store: PopoverCore } & JSX.HTMLAttributes<HTMLElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <PopoverPrimitive.Root store={vm}>
      {/* <Show when={props.children}>
        <PopoverPrimitive.Trigger store={vm} class="inline-flex items-center justify-center">
          {props.children}
        </PopoverPrimitive.Trigger>
      </Show> */}
      <PopoverPrimitive.Portal store={vm}>
        <div
          classList={{
            "fixed inset-0 bg-black opacity-20 duration-200": true,
            "animate-in fade-in": state().enter,
            "animate-out fade-out": state().exit,
          }}
          style={{
            "z-index": 998,
          }}
          onClick={() => {
            vm.hide();
          }}
        ></div>
        <div
          class="z-[999]"
          style={{
            "z-index": 999,
            position: "fixed",
            left: 0,
            top: 0,
            opacity: state().isPlaced ? 100 : 0,
            transform: state().isPlaced
              ? `translate3d(${Math.round(state().x)}px, ${Math.round(state().y)}px, 0)`
              : "translate3d(0, -200%, 0)",
          }}
        >
          <div
            classList={{
              "z-50 min-w-[4rem] overflow-hidden rounded-xl border-2 border-w-fg-3 bg-w-bg-0 shadow-md duration-200":
                true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
          >
            <div
              class="__a relative p-4 text-w-fg-0"
              onAnimationStart={(event) => {
                const floating = event.currentTarget.getBoundingClientRect();
                vm.popper.place2(floating);
              }}
            >
              {props.children}
              <div
                class="absolute top-2 right-2 inline-flex items-center justify-center rounded-full h-6 w-6 text-w-fg-1 font-inherit"
                onClick={() => {
                  vm.hide();
                }}
              >
                <X class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export const PurePopover = (
  props: {
    content: JSX.Element;
    side?: Side;
    align?: Align;
  } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { children, side = "bottom", align = "end" } = props;

  const store = new PopoverCore({
    side,
    align,
    strategy: "absolute",
  });

  return (
    <PopoverPrimitive.Root store={store}>
      <PopoverPrimitive.Trigger store={store} class="inline-flex items-center justify-center">
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal store={store}>
        <PopoverPrimitive.Content
          store={store}
          class={cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "relative rounded-md p-5 w-64 bg-white shadow-lg focus:shadow-md focus:ring-2 focus:ring-violet-700",
            props.class
          )}
        >
          <div>{props.content}</div>
          <PopoverPrimitive.Close
            store={store}
            class="font-inherit rounded-full h-6 w-6 inline-flex items-center justify-center text-violet-900 absolute top-3 right-3"
          >
            <X class="w-4 h-4" />
          </PopoverPrimitive.Close>
          {/* <PopoverPrimitive.Arrow store={store} class="text-xl fill-white" /> */}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
