/**
 * @file 对话框
 */
import { createSignal, JSX } from "solid-js";
import { X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import * as DialogPrimitive from "@/packages/ui/dialog";
import { Show } from "@/packages/ui/show";

import { DialogCore } from "@/domains/ui/dialog";
import { cn } from "@/utils/index";

export function Dialog(props: { store: DialogCore; app: ViewComponentProps["app"] } & JSX.HTMLAttributes<HTMLElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <DialogPrimitive.Root store={vm}>
      <DialogPrimitive.Portal class="fixed inset-0 z-50 flex items-start justify-center sm:items-center" store={vm}>
        <div
          classList={{
            "h-w-screen": true,
            "fixed left-1/2 top-0 -translate-x-1/2 w-[375px] mx-auto": props.app.env.pc,
            "fixed inset-0": !props.app.env.pc,
            hidden: !state().visible,
          }}
        >
          <DialogPrimitive.Overlay
            classList={{
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm": true,
              "transition-all duration-200": true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
            store={vm}
          />
        </div>
        <div
          class="fixed inset-0 flex items-center justify-center"
          classList={{
            "left-1/2 -translate-x-1/2 w-[375px]": props.app.env.pc,
            "w-full": !props.app.env.pc,
          }}
        >
          <DialogPrimitive.Content
            classList={{
              "duration-200": true,
              "animate-in fade-in-90": state().enter,
              "animate-out fade-out": state().exit,
            }}
            store={vm}
          >
            {/* <DialogPrimitive.Header class="flex flex-col space-y-2 text-center sm:text-left">
            <DialogPrimitive.Title class={cn("text-lg font-semibold text-slate-900", "dark:text-slate-50")}>
              {state().title}
            </DialogPrimitive.Title>
          </DialogPrimitive.Header> */}
            {props.children}
            {/* <Show when={state().closeable}>
            <DialogPrimitive.Close
              class={cn(
                "absolute top-4 right-4 cursor-pointer rounded-sm",
                "opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none",
                "dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900",
                "data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800"
              )}
              store={vm}
            >
              <X width={15} height={15} />
              <span class="sr-only">Close</span>
            </DialogPrimitive.Close>
          </Show>
          <Show when={state().footer}>
            <DialogPrimitive.Footer class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <div class="space-x-2">
                <DialogPrimitive.Cancel store={vm}>取消</DialogPrimitive.Cancel>
                <DialogPrimitive.Submit store={vm}>确认</DialogPrimitive.Submit>
              </div>
            </DialogPrimitive.Footer>
          </Show> */}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
