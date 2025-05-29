/**
 * @file 身高输入
 */
import { createSignal, For, onMount } from "solid-js";

import { useViewModelStore } from "@/hooks";

import { DragSelectViewModel, DragSelectOpt } from "@/biz/drag_select";

export function HeightDragSelectView<T extends DragSelectOpt>(props: { store: DragSelectViewModel<T> }) {
  const [state, vm] = useViewModelStore(props.store);

  let $container: HTMLDivElement | undefined;

  onMount(() => {
    if (!$container) {
      return;
    }
    vm.methods.bindNode($container);
    vm.methods.handleMounted();
  });

  return (
    <div class="w-full bg-white p-1  border ">
      <div
        class="relative "
        style={{
          width: `${vm.cell_height * state().visible_count}px`,
        }}
      >
        <div
          ref={$container}
          class="scroll--hidden dialog-touch-container h-[120px] overflow-x-auto whitespace-nowrap"
          style={{
            "vertical-align": "middle",
          }}
          onScroll={(event) => {
            vm.methods.handleScroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop });
          }}
        >
          <div
            class="inline-block"
            style={{
              width: `${vm.cell_height * state().top_padding_count}px`,
            }}
          ></div>
          <For each={state().options}>
            {(opt) => {
              return (
                <div
                  class="inline-block"
                  style={{
                    width: `${vm.cell_height}px`,
                  }}
                >
                  <div
                    class="text-xl text-center"
                    style={{
                      "line-height": `${vm.cell_height}px`,
                    }}
                  >
                    {opt.label}
                  </div>
                </div>
              );
            }}
          </For>
          <div
            class="inline-block"
            style={{
              width: `${vm.cell_height * state().bottom_padding_count}px`,
            }}
          ></div>
          <div class="pointer-events-none absolute inset-0 w-full border-b border-t border-white dark:border-black">
            <div
              classList={{
                "inline-block h-full": true,
                "bg-gradient-to-r from-white to-white/60 dark:border-white/20 dark:from-black dark:to-black/60": true,
              }}
              style={{
                width: `${vm.cell_height * state().top_padding_count}px`,
                top: `${vm.cell_height}px`,
              }}
            ></div>
            <div
              class="inline-block text-center"
              style={{
                width: `${vm.cell_height}px`,
                transform: "translateY(-280%)",
              }}
            >
              <div>⬆️</div>
            </div>
            <div
              classList={{
                "inline-block h-full": true,
                "bg-gradient-to-l from-white to-white/60 dark:border-white/20 dark:from-black dark:to-black/60": true,
              }}
              style={{
                width: `${vm.cell_height * state().top_padding_count}px`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
