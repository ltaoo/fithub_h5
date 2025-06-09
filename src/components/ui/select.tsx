/**
 * @file 单选
 */
import { For, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { JSX } from "solid-js/jsx-runtime";
import { Check, ChevronDown } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import * as SelectPrimitive from "@/packages/ui/select";
import * as PopperPrimitive from "@/packages/ui/popper";
import { SelectCore } from "@/domains/ui";
import { cn, sleep } from "@/utils/index";

import { Presence } from "./presence";

export const Select = (props: { store: SelectCore<any>; position?: "popper" } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store, position = "popper" } = props;

  const [state, setState] = createSignal(store.state);
  const [popper] = useViewModelStore(props.store.popper);

  store.onStateChange((v) => {
    setState(v);
  });

  return (
    <div class="relative">
      <div
        class={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border-2 border-w-fg-3 bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          props.class
        )}
        onClick={(event) => {
          const client = event.currentTarget.getBoundingClientRect();
          const { clientHeight, clientWidth } = window.document.documentElement;
          store.popper.setReference(
            {
              getRect() {
                return client;
              },
            },
            { force: true }
          );
          props.store.presence.show();
        }}
      >
        <Show
          when={state().value2?.label || state().value}
          fallback={
            <Show when={state().placeholder}>
              <div class="text-w-fg-2">{state().placeholder}</div>
            </Show>
          }
        >
          <div class="text-w-fg-0 truncate">{state().value2?.label || state().value}</div>
        </Show>
        <SelectPrimitive.Icon>
          <ChevronDown class="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </div>
      <Portal>
        <Presence store={props.store.presence}>
          <div
            classList={{
              "z-[998] fixed inset-0 bg-black opacity-20 duration-200": true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
            onClick={() => {
              props.store.presence.hide();
            }}
          ></div>
          <div
            class="z-[999]"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              opacity: popper().isPlaced ? 100 : 0,
              transform: popper().isPlaced
                ? `translate3d(${Math.round(popper().x)}px, ${Math.round(popper().y)}px, 0)`
                : "translate3d(0, -200%, 0)",
            }}
          >
            <div
              classList={{
                "min-w-[120px] duration-200": true,
                "animate-in fade-in": state().enter,
                "animate-out fade-out": state().exit,
              }}
            >
              <div
                classList={{
                  "z-50 min-w-[4rem] w-36 overflow-hidden rounded-xl border-2 border-w-bg-2 bg-w-bg-0 p-1 text-w-fg-0 shadow-md":
                    true,
                  "__a ": true,
                }}
                onAnimationStart={(event) => {
                  const floating = event.currentTarget.getBoundingClientRect();
                  props.store.popper.place2(floating);
                }}
              >
                <For each={state().options}>
                  {(opt) => {
                    return (
                      <div
                        classList={{
                          "relative flex cursor-default select-none items-center rounded-xl py-1.5 px-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50":
                            true,
                          "bg-w-bg-5": opt.selected,
                        }}
                        onClick={() => {
                          props.store.select(opt.value);
                        }}
                      >
                        {opt.label}
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Presence>
      </Portal>
    </div>
  );
};

// const SelectLabel = (props: { store: unknown } & JSX.HTMLAttributes<HTMLElement>) => {
//   const { store } = props;

//   return <SelectPrimitive.Label class={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", props.class)} store={store} />;
// };

// const SelectItem = (props: { store: unknown } & JSX.HTMLAttributes<HTMLElement>) => (
//   <SelectPrimitive.Item
//     class={cn(
//       "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       props.class
//     )}
//     {...props}
//   >
//     <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
//       <SelectPrimitive.ItemIndicator>
//         <Check class="h-4 w-4" />
//       </SelectPrimitive.ItemIndicator>
//     </span>

//     <SelectPrimitive.ItemText>{props.children}</SelectPrimitive.ItemText>
//   </SelectPrimitive.Item>
// );

// const SelectSeparator = (props: { store: unknown } & JSX.HTMLAttributes<HTMLElement>) => (
//   <SelectPrimitive.Separator class={cn("-mx-1 my-1 h-px bg-muted", props.class)} {...props} />
// );

// export const Select = (props: { store: SelectCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) => {
//   const { store } = props;

//   const [state, setState] = createSignal(store.state);

//   store.onStateChange((v) => {
//     setState(v);
//   });

//   return (
//     <div class="relative">
//       <Show when={state().value === null}>
//         <div class="absolute inset-0 pointer-events-none">{state().placeholder}</div>
//       </Show>
//       <select
//         value={state().value}
//         classList={{
//           "opacity-0": state().value === null,
//         }}
//         onChange={(event) => {
//           const selected = event.currentTarget.value;
//           store.select(selected);
//         }}
//       >
//         <For each={state().options}>
//           {(opt) => {
//             const { label } = opt;
//             return <option value={opt.value}>{label}</option>;
//           }}
//         </For>
//       </select>
//     </div>
//   );
// };
