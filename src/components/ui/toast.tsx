/**
 * @file 小黑块 提示
 */
import { For, createSignal, JSX, Show } from "solid-js";
import { Loader2, Loader } from "lucide-solid";

import * as ToastPrimitive from "@/packages/ui/toast";
import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils";

export const Toast = (props: { store: ToastCore }) => {
  const [state, setState] = createSignal(props.store.state);
  props.store.onStateChange((v) => {
    setState(v);
  });

  return (
    <ToastPrimitive.Root store={props.store}>
      <ToastPrimitive.Portal store={props.store}>
        {/* <Show when={state().mask || state().icon === "loading"}>
          <ToastPrimitive.Overlay
            store={props.store}
            classList={{
              "fixed inset-0 z-100 bg-black/50 transition-all duration-200": true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
          />
        </Show> */}
        <div
          classList={{
            "fixed z-[99999] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2": true,
          }}
        >
          <ToastPrimitive.Content
            store={props.store}
            classList={{
              // "p-6 w-120 h-120 ": true,
              "relative duration-200": true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
          >
            <div class="z-0 absolute inset-0 rounded-xl bg-black opacity-90"></div>
            <div class="z-10 relative space-y-4 p-6 w-120 h-120">
              <Show when={state().icon === "loading"}>
                <div class="relative left-1/2 w-6 h-6 -translate-x-1/2">
                  <Loader class="w-full h-full animate-spin" />
                </div>
              </Show>
              <Show when={state().texts.length}>
                <div class="">
                  <For each={state().texts}>
                    {(text) => {
                      return <div class="whitespace-nowrap text-center text-white">{text}</div>;
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </ToastPrimitive.Content>
        </div>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Root>
  );
};
