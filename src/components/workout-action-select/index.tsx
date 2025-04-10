import { For, Show } from "solid-js";
import { effect, Portal } from "solid-js/web";
import { X, Check } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";
import { ListView, ScrollView } from "@/components/ui";
import { useViewModelStore } from "@/hooks";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import { cn } from "@/utils/index";

export function WorkoutActionSelectView(props: { store: WorkoutActionSelectViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  // effect(() => {
  //   console.log("[WORKOUT-ACTION-SELECT] state", state().value);
  // });

  return (
    <div class="equipment-select">
      <div class="flex items-center gap-2">
        <Show when={state().value}>
          <div class="flex items-center gap-2">
            <span>{state().value?.zh_name || state().value?.id}</span>
            <button
              class="text-slate-400"
              onClick={() => {
                vm.methods.unselect();
              }}
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </Show>
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
          class="z-100 fixed left-0 top-0 w-[340px] h-[320px] overflow-y-auto bg-white p-1 rounded-md border"
        >
          <ListView store={vm.request.action.list}>
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
                      <Show when={state().value?.id === opt.id}>
                        <Check class="h-4 w-4" />
                      </Show>
                    </span>
                    <div class="py-2">{opt.zh_name || opt.name}</div>
                  </div>
                );
              }}
            </For>
          </ListView>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </div>
  );
}
