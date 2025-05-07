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
  const [popper, $popper] = useViewModelStore(props.store.popper);

  store.onStateChange((v) => {
    // console.log("[COMPONENT]ui/select - onStateChange", v);
    setState(v);
  });

  return (
    <div class="relative">
      {/* <select
        class="absolute inset-0 opacity-0 cursor-pointer"
        value={state().value}
        onChange={(event) => {
          const selected = event.currentTarget.value;
          store.select(selected);
        }}
      >
        <For each={state().options}>
          {(opt) => {
            return <option value={opt.value}>{opt.label}</option>;
          }}
        </For>
      </select> */}
      <div
        class={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          props.class
        )}
        onClick={async (event) => {
          const client = event.currentTarget.getBoundingClientRect();
          const { clientHeight, clientWidth } = window.document.documentElement;
          // console.log("[]click", client.y, client.height);
          store.popper.setReference(
            {
              getRect() {
                return client;
              },
            },
            { force: true }
          );
          await sleep(200);
          props.store.presence.show();
        }}
      >
        {state().value2?.label || state().value || state().placeholder}
        <SelectPrimitive.Icon>
          <ChevronDown class="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </div>
      <Portal>
        <Presence store={props.store.presence}>
          <div
            class="z-[998] fixed inset-0 bg-black opacity-20"
            onClick={() => {
              props.store.presence.hide();
            }}
          ></div>
          <div
            classList={{
              "z-[999] min-w-[120px] border rounded-md bg-white duration-200": true,
              block: state().visible,
              hidden: !state().visible,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
            style={{
              position: "fixed",
              left: popper().x + "px",
              top: popper().y + "px",
              opacity: popper().isPlaced ? 100 : 0,
            }}
          >
            <div
              classList={{
                "__a ": true,
              }}
              onAnimationStart={(event) => {
                const reference = props.store.popper.reference;
                if (!reference) {
                  return;
                }
                const floating = event.currentTarget.getBoundingClientRect();
                const ref = reference.getRect();
                const { clientHeight, clientWidth } = window.document.documentElement;
                // console.log("[]ref", ref.y, ref.height, ref.y + ref.height + 4);
                // console.log("[]floating", floating.height);
                // console.log("[]window", clientHeight);
                const position = {
                  x: ref.x,
                  y: ref.y + ref.height + 4,
                };
                if (clientHeight - position.y < floating.height + 24) {
                  position.y = ref.y - floating.height - 4;
                }
                // console.log("[]position", position);
                store.popper.setState(position);
              }}
            >
              <For each={state().options}>
                {(opt) => {
                  return (
                    <div
                      classList={{
                        "py-2 px-4": true,
                        "bg-gray-100": opt.selected,
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
