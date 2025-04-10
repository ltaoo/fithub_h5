/**
 * @file 下拉菜单
 */
import { For, createSignal, JSX } from "solid-js";
import { ChevronRight } from "lucide-solid";

import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { MenuCore } from "@/domains/ui/menu";
import { Show } from "@/packages/ui/show";
import { cn } from "@/utils";

import * as DropdownMenuPrimitive from "@/packages/ui/dropdown-menu";

export const DropdownMenu = (props: { store: DropdownMenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((nextState) => {
    console.log("[COMPONENT]ui/dropdown-menu - store.onStateChange", nextState.items);
    setState(nextState);
  });

  return (
    <DropdownMenuPrimitive.Root store={store}>
      <Show when={props.children}>
        <DropdownMenuPrimitive.Trigger class="inline-block" store={store}>
          {props.children}
        </DropdownMenuPrimitive.Trigger>
      </Show>
      <DropdownMenuPrimitive.Portal store={store.menu}>
        <DropdownMenuPrimitive.Content
          class={cn(
            "z-50 min-w-[8rem] w-56 overflow-hidden rounded-md border-2 border-slate-100 bg-white p-1 text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400",
            props.class
          )}
          store={store}
        >
          <For each={state().items}>
            {(item) => {
              if (item._hidden) {
                return null;
              }
              return (
                <Show
                  when={!!item.menu}
                  fallback={
                    <DropdownMenuPrimitive.Item
                      class={cn(
                        "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700",
                        "focus:bg-slate-100",
                        {
                          "bg-slate-100": item.state.focused,
                        }
                      )}
                      store={item}
                    >
                      <Show when={!!item.icon}>
                        <div class="mr-2">{item.icon as Element}</div>
                      </Show>
                      <div title={item.tooltip}>{item.label}</div>
                      <Show when={item.shortcut}>{item.shortcut}</Show>
                    </DropdownMenuPrimitive.Item>
                  }
                >
                  <ItemWithSubMenu store={item} />
                </Show>
              );
            }}
          </For>
          {/* <DropdownMenuPrimitive.Arrow store={store} /> */}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

const ItemWithSubMenu = (
  props: {
    store: MenuItemCore;
  } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  const [state2, setState2] = createSignal(store.menu ? store.menu.state : { items: [] });

  store.onStateChange((v) => {
    setState(v);
  });
  store.menu?.onChange((v) => {
    setState2(v);
  });

  const label = () => state().label;
  const icon = () => state().icon as JSX.Element;
  const items = () => state2().items;

  if (!store.menu) {
    return null;
  }

  return (
    <DropdownMenuPrimitive.Sub store={store.menu}>
      <DropdownMenuPrimitive.SubTrigger
        class={cn(
          "flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[state=open]:bg-slate-100 dark:focus:bg-slate-700 dark:data-[state=open]:bg-slate-700",
          {
            "pl-8": !!icon(),
            "bg-slate-100": state().focused,
          },
          props.class
        )}
        store={store}
      >
        <Show when={!!icon()}>
          <div class="mr-2">{icon()}</div>
        </Show>
        {label()}
        <div class="ml-auto h-4 w-4">
          <ChevronRight class="w-4 h-4" />
        </div>
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal store={store.menu}>
        <DropdownMenuPrimitive.SubContent
          class={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border-2 border-slate-100 bg-white p-1 text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ",
            props.class
          )}
          store={store.menu}
        >
          <For each={items()}>
            {(item) => {
              if (item.menu) {
                return <ItemWithSubMenu store={item}></ItemWithSubMenu>;
              }
              return (
                <DropdownMenuPrimitive.Item
                  class={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700"
                  )}
                  store={item}
                >
                  <div title={store.tooltip}>{item.label}</div>
                </DropdownMenuPrimitive.Item>
              );
            }}
          </For>
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
};
