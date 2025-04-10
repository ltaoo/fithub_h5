/**
 * @file 动作多选
 */
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { Check } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";
import { ScrollView } from "@/components/ui";
import { useViewModelStore } from "@/hooks";
import { WorkoutActionMultipleSelectViewModel } from "@/biz/workout_action_multiple_select";
import { cn } from "@/utils/index";

export function WorkoutActionMultipleSelectView(props: { store: WorkoutActionMultipleSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="equipment-select">
      <div class="flex items-center gap-2">
        <For each={state().value}>
          {(item) => (
            <div class="flex items-center gap-2">
              <span class="whitespace-nowrap text-slate-400">{item.name}</span>
              <button
                class="text-slate-400"
                onClick={() => {
                  vm.methods.remove(item);
                }}
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          )}
        </For>
        <button
          class="__a text-slate-400"
          onClick={(e) => {
            const { left, top, width, height } = e.target.getBoundingClientRect();
            console.log("[EQUIPMENT-SELECT] onAnimationEnd", left, top, width, height);
            vm.ui.$popover.popper.setReference({
              $el: e.target as HTMLElement,
              getRect: () => {
                return {
                  x: left,
                  y: top,
                  left,
                  top,
                  width,
                  height,
                  right: left + width,
                  bottom: top + height,
                };
              },
            });
            vm.ui.$popover.toggle();
          }}
        >
          选择动作
        </button>
      </div>
      <PopoverPrimitive.Portal store={vm.ui.$popover}>
        <PopoverPrimitive.Content
          store={vm.ui.$popover}
          class="z-100 fixed left-0 top-0 w-[340px] h-[480px] overflow-y-auto bg-white p-1 rounded-md border"
        >
          <ScrollView store={vm.ui.$scroll}>
            <For each={state().actions}>
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
          </ScrollView>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </div>
  );
}
