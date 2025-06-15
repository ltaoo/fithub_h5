import { X } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";
import { VariantProps, cva } from "class-variance-authority";

import { useViewModelStore } from "@/hooks";
import { DialogCore } from "@/domains/ui/dialog";
import * as DialogPrimitive from "@/packages/ui/dialog";
import { Show } from "@/packages/ui/show";
import { cn } from "@/utils/index";
import { ViewComponentProps } from "@/store/types";

const sheetVariants = cva("fixed z-50 scale-100 gap-4 bg-w-bg-2 text-w-fg-0 opacity-100", {
  variants: {
    position: {
      top: "w-full duration-300",
      bottom: "w-full duration-300",
      left: "h-full duration-300",
      right: "h-full duration-300",
      // top: "animate-in slide-in-from-top w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top",
      // bottom:
      //   "animate-in slide-in-from-bottom w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
      // left: "animate-in slide-in-from-left h-full duration-300",
      // right: "animate-in slide-in-from-right h-full duration-300",
    },
    size: {
      content: "",
      default: "",
      sm: "",
      lg: "",
      xl: "",
      full: "",
    },
  },
  compoundVariants: [
    {
      position: ["top", "bottom"],
      size: "content",
      class: "max-h-screen",
    },
    {
      position: ["top", "bottom"],
      size: "default",
      class: "h-1/3",
    },
    {
      position: ["top", "bottom"],
      size: "sm",
      class: "h-1/4",
    },
    {
      position: ["top", "bottom"],
      size: "lg",
      class: "h-1/2",
    },
    {
      position: ["top", "bottom"],
      size: "xl",
      class: "h-5/6",
    },
    {
      position: ["top", "bottom"],
      size: "full",
      class: "h-screen",
    },
    {
      position: ["right", "left"],
      size: "content",
      class: "max-w-screen",
    },
    {
      position: ["right", "left"],
      size: "default",
      class: "w-1/3",
    },
    {
      position: ["right", "left"],
      size: "sm",
      class: "w-1/4",
    },
    {
      position: ["right", "left"],
      size: "lg",
      class: "w-1/2",
    },
    {
      position: ["right", "left"],
      size: "xl",
      class: "w-5/6",
    },
    {
      position: ["right", "left"],
      size: "full",
      class: "w-screen",
    },
  ],
  defaultVariants: {
    position: "right",
    size: "default",
  },
});
const portalVariants = cva("fixed inset-0 z-50 flex", {
  variants: {
    position: {
      top: "items-start",
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
    },
  },
  defaultVariants: { position: "right" },
});

type SheetProps = {
  position?: "bottom" | "top" | "left" | "right";
  size?: "content" | "default" | "sm" | "lg" | "xl" | "full";
  ignore_safe_height?: boolean;
  plus_idx?: number;
  store: DialogCore;
  app: ViewComponentProps["app"];
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Sheet(props: SheetProps) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <DialogPrimitive.Portal store={props.store}>
      <Show when={state().mask}>
        <div
          classList={{
            "h-screen": true,
            "fixed left-1/2 top-0 -translate-x-1/2 w-[375px] mx-auto": props.app.env.pc,
            "fixed inset-0": !props.app.env.pc,
            hidden: !state().visible,
          }}
          style={{ "z-index": 98 + (props.plus_idx ?? 0) }}
        >
          <DialogPrimitive.Overlay
            store={vm}
            classList={{
              "w-full h-full bg-black/50 transition-all duration-200": true,
              block: state().visible,
              hidden: !state().visible,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
            onClick={() => {
              vm.hide();
            }}
          />
        </div>
      </Show>
      <div
        class="fixed bottom-0"
        classList={{
          "left-1/2 -translate-x-1/2 w-[375px] mx-auto": props.app.env.pc,
          "w-full": !props.app.env.pc,
        }}
        style={{ "z-index": 99 + (props.plus_idx ?? 0) }}
      >
        <DialogPrimitive.Content
          store={props.store}
          classList={{
            "z-100 relative": true,
            // [sheetVariants({ position: props.position, size: props.size })]: true,
          }}
        >
          <div
            classList={{
              "duration-200  bg-w-bg-1": true,
              block: state().visible,
              hidden: !state().visible,
              "animate-in slide-in-from-bottom": state().enter,
              "animate-out slide-out-to-bottom": state().exit,
            }}
          >
            {props.children}
          </div>
          <Show when={!props.ignore_safe_height}>
            <div class="safe-height"></div>
          </Show>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
