/**
 * @file 拖动形式的输入
 * 可以用于数值型 如身高、体重、年龄
 */
import { createSignal, For, onMount } from "solid-js";

import { useViewModel, useViewModelStore } from "@/hooks";

import { DragSelectViewModel, DragSelectOpt } from "@/biz/drag_select";

export function DragSelectView<T extends DragSelectOpt>(props: { store: DragSelectViewModel<T> }) {
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
    <div
      class="relative"
      style={{
        height: `${vm.cell_height * state().visible_count}px`,
      }}
    >
      <div
        class="scroll--hidden dialog-touch-container overflow-y-auto h-full"
        ref={$container}
        onScroll={(event) => {
          vm.methods.handleScroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop });
        }}
      >
        <div
          style={{
            height: `${vm.cell_height * state().top_padding_count}px`,
          }}
        ></div>
        <For each={state().options}>
          {(opt) => {
            return (
              <div
                style={{
                  height: `${vm.cell_height}px`,
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
          style={{
            height: `${vm.cell_height * state().bottom_padding_count}px`,
          }}
        ></div>
        <div class="pointer-events-none absolute inset-0 w-full border-t border-w-fg-3">
          <div
            class="border-b border-w-fg-2 bg-gradient-to-b from-w-bg-0 to-w-bg-0/60"
            style={{
              height: `${vm.cell_height * state().top_padding_count - 2}px`,
            }}
          ></div>
          <div
            style={{
              height: `${vm.cell_height}px`,
            }}
          ></div>
          <div
            class="border-t border-w-fg-2 bg-gradient-to-t from-w-bg-0 to-w-bg-0/60"
            style={{
              height: `${vm.cell_height * state().top_padding_count - 2}px`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
