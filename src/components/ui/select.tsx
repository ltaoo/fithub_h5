/**
 * @file 单选
 */
import { For, Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Check, ChevronDown } from "lucide-solid";

import { SelectCore } from "@/domains/ui";
import * as SelectPrimitive from "@/packages/ui/select";
import { cn } from "@/utils/index";

export const Select = (props: { store: SelectCore<any>; position?: "popper" } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store, position = "popper" } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  return (
    <div class="relative">
      <select
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
      </select>
      <div
        class={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          props.class
        )}
      >
        {state().value2?.label || state().value || state().placeholder}
        <SelectPrimitive.Icon>
          <ChevronDown class="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </div>
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
