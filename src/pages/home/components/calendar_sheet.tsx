import { X } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";
import * as DialogPrimitive from "@/packages/ui/dialog";
import { Show } from "@/packages/ui/show";

import { DialogCore } from "@/domains/ui/dialog";

type SheetProps = {
  position?: "bottom" | "top" | "left" | "right";
  size?: "content" | "default" | "sm" | "lg" | "xl" | "full";
  store: DialogCore;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function CalendarSheet(props: SheetProps) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <DialogPrimitive.Portal store={props.store}>
      <div class="fixed w-full top-[92px]" style={{ "z-index": 99 }}>
        <Show when={state().mask}>
          <DialogPrimitive.Overlay
            store={vm}
            classList={{
              "fixed inset-0 top-[92px] z-0 bg-black/50 transition-all duration-200": true,
              block: state().visible,
              hidden: !state().visible,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
            onClick={() => {
              vm.hide();
            }}
          />
        </Show>
        <DialogPrimitive.Content
          store={props.store}
          classList={{
            "z-100 relative": true,
            // [sheetVariants({ position: props.position, size: props.size })]: true,
          }}
        >
          <div
            classList={{
              "duration-200": true,
              block: state().visible,
              hidden: !state().visible,
        //       "animate-in slide-in-from-top": state().enter,
        //       "animate-out slide-out-to-top": state().exit,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
          >
            {props.children}
          </div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
