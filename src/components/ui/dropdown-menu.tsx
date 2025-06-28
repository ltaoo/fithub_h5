/**
 * @file 下拉菜单
 */
import { For, createSignal, JSX } from "solid-js";
import { Portal as PortalPrimitive } from "solid-js/web";
import { ChevronRight } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import * as DropdownMenuPrimitive from "@/packages/ui/dropdown-menu";
import { Show } from "@/packages/ui/show";

import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { cn, sleep } from "@/utils";

export const DropdownMenu = (props: { store: DropdownMenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  // const [state, setState] = createSignal(store.state);
  const [state, vm] = useViewModelStore(props.store);
  // const [popper, ] = createSignal(store.state);
  const [popper] = useViewModelStore(props.store.menu.popper);

  // store.onStateChange((v) => setState(v));

  return (
    <div class="dropdown-menu">
      <Show when={props.children}>
        <DropdownMenuPrimitive.Trigger class="inline-block" store={vm}>
          {props.children}
        </DropdownMenuPrimitive.Trigger>
      </Show>
      <DropdownMenuPrimitive.Portal store={props.store.menu} class="relative">
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
            vm.menu.presence.hide();
          }}
        ></div>
        <div
          class="z-[999]"
          style={{
            "z-index": 999,
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
              "z-50 min-w-[4rem] w-36 overflow-hidden rounded-xl border-2 border-w-fg-3 border-slate-100 bg-w-bg-0 p-1 text-w-fg-0 shadow-md duration-200":
                true,
              "animate-in fade-in": state().enter,
              "animate-out fade-out": state().exit,
            }}
          >
            <div
              class="__a"
              onAnimationStart={(event) => {
                const floating = event.currentTarget.getBoundingClientRect();
                vm.menu.popper.place2(floating);
              }}
            >
              <For each={state().items}>
                {(item) => {
                  if (item.hidden) {
                    return null;
                  }
                  return (
                    <Show
                      when={!!item.menu}
                      fallback={
                        <DropdownMenuPrimitive.Item
                          classList={{
                            "relative flex cursor-default select-none items-center rounded-xl py-1.5 px-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700":
                              true,
                            // "bg-w-bg-5": item.state.focused,
                          }}
                          store={item}
                        >
                          <Show when={!!item.icon}>
                            <div class="mr-2">{item.icon as Element}</div>
                          </Show>
                          <div class="text-w-fg-0" title={item.tooltip}>
                            {item.label}
                          </div>
                          <Show when={item.shortcut}>{item.shortcut}</Show>
                        </DropdownMenuPrimitive.Item>
                      }
                    >
                      <ItemWithSubMenu store={item} />
                    </Show>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </DropdownMenuPrimitive.Portal>
    </div>
  );
};

const ItemWithSubMenu = (props: { store: MenuItemCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const [state, setState] = createSignal(props.store.state);
  const [state2, setState2] = createSignal(props.store.menu ? props.store.menu.state : { items: [] });

  props.store.onStateChange((v) => {
    setState(v);
  });
  props.store.menu?.onStateChange((v) => {
    setState2(v);
  });

  const label = () => state().label;
  const icon = () => state().icon as JSX.Element;
  const items = () => state2().items;

  if (!props.store.menu) {
    return null;
  }

  return (
    <DropdownMenuPrimitive.Sub store={props.store.menu}>
      <DropdownMenuPrimitive.SubTrigger
        class={cn(
          "flex cursor-default select-none items-center rounded-sm py-1.5 px-2 font-medium outline-none focus:bg-slate-100 data-[state=open]:bg-slate-100 dark:focus:bg-slate-700 dark:data-[state=open]:bg-slate-700",
          {
            "pl-8": !!icon(),
            "bg-slate-100": state().focused,
          },
          props.class
        )}
        store={props.store}
      >
        <Show when={!!icon()}>
          <div class="mr-2">{icon()}</div>
        </Show>
        {label()}
        <div class="ml-auto h-4 w-4">
          <ChevronRight class="w-4 h-4" />
        </div>
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal store={props.store.menu}>
        <DropdownMenuPrimitive.SubContent
          class={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border-2 border-slate-100 bg-white p-1 text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ",
            props.class
          )}
          store={props.store.menu}
        >
          <For each={items()}>
            {(item) => {
              if (item.menu) {
                return <ItemWithSubMenu store={item}></ItemWithSubMenu>;
              }
              return (
                <DropdownMenuPrimitive.Item
                  class={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 font-medium outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700"
                  )}
                  store={item}
                >
                  <div title={props.store.tooltip}>{item.label}</div>
                </DropdownMenuPrimitive.Item>
              );
            }}
          </For>
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
};
