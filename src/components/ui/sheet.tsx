import { X } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";
import { VariantProps, cva } from "class-variance-authority";

import { useViewModelStore } from "@/hooks";
import { DialogCore } from "@/domains/ui/dialog";
import * as DialogPrimitive from "@/packages/ui/dialog";
import { Show } from "@/packages/ui/show";
import { cn } from "@/utils/index";

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
  position: "bottom" | "top" | "left" | "right";
  size: "content" | "default" | "sm" | "lg" | "xl" | "full";
  store: DialogCore;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Sheet(props: SheetProps) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <DialogPrimitive.Portal store={props.store}>
      <div class="fixed w-full bottom-0">
        {/* <Overlay store={props.store} /> */}
        <DialogPrimitive.Overlay
          store={vm}
          classList={{
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-200": true,
            //       "animate-in fade-in": state().enter,
            //       "animate-out fade-out": state().exit,
          }}
          onClick={() => {
            vm.hide();
          }}
        />
        <DialogPrimitive.Content
          store={props.store}
          classList={{
            "z-100 relative duration-200": true,
            //       "animate-in slide-in-from-bottom": state().enter,
            //       "animate-out slide-out-to-bottom": state().exit,
            //       [props.class]: true,
            [sheetVariants({ position: props.position, size: props.size })]: true,
          }}
        >
          {props.children}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
