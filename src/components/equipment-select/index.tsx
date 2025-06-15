/**
 * @file 设备多选
 */
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { Check } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";

import { useViewModel, useViewModelStore } from "@/hooks";
import { DropdownMenu, Popover } from "@/components/ui";
import { EquipmentSelectViewModel } from "@/biz/equipment_select";
import { Select } from "@/components/ui/select";
import { Presence } from "@/components/ui/presence";
import { cn } from "@/utils/index";

export function EquipmentSelectView(props: { store: EquipmentSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="equipment-select">
      <div class="flex flex-wrap items-center gap-2">
        <For each={state().value}>
          {(equipment) => (
            <div class="flex items-center gap-2 bg-slate-100 rounded-md p-1">
              <span class="text-sm whitespace-nowrap text-slate-400">{equipment.zh_name || equipment.name}</span>
              <button
                class="text-slate-400"
                onClick={() => {
                  vm.remove(equipment);
                }}
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          )}
        </For>
        <button
          classList={{
            "text-slate-400 whitespace-nowrap": true,
            "cursor-not-allowed": state().disabled,
          }}
          onClick={(e) => {
            if (state().disabled) {
              return;
            }
            const { left, top, width, height } = e.target.getBoundingClientRect();
            console.log("[EQUIPMENT-SELECT] onAnimationEnd", left, top, width, height);
            // vm.ui.$popover.popper.setReference({
            //   $el: e.target as HTMLElement,
            //   getRect: () => {
            //     return {
            //       x: left,
            //       y: top,
            //       left,
            //       top,
            //       width,
            //       height,
            //       right: left + width,
            //       bottom: top + height,
            //     };
            //   },
            // });
            // vm.ui.$popover.toggle();
          }}
        >
          选择设备
        </button>
      </div>
      {/* <PopoverPrimitive.Portal store={vm.ui.$popover}>
        <PopoverPrimitive.Content
          store={vm.ui.$popover}
          class="z-100 fixed left-0 top-0 w-[340px] h-[480px] overflow-y-auto bg-white p-1 rounded-md border"
        >
          <For each={state().equipments}>
            {(opt) => {
              return (
                <div
                  class={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm p-2 text-sm outline-none cursor-pointer data-[highlighted]:bg-slate-100 focus:bg-accent focus:text-accent-foreground hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                  onClick={() => {
                    vm.methods.select(opt);
                  }}
                >
                  <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Show when={state().value.some((item) => item.id === opt.id)}>
                      <Check class="h-4 w-4" />
                    </Show>
                  </span>
                  <div class="py-2">{opt.zh_name || opt.name}</div>
                </div>
              );
            }}
          </For>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal> */}
    </div>
  );
}
