import { For, Show, createSignal, onMount } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { useViewModelStore } from "@/hooks";

import { TabHeaderCore } from "@/domains/ui/tab-header";
import { cn } from "@/utils";

export const HomeViewTabHeader = (props: { store: TabHeaderCore<any>; onMoreClick?: () => void }) => {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="relative bg-w-bg-0">
      <div
        classList={{ "z-10 absolute right-0 px-2 bg-w-bg-0": true }}
        onClick={() => {
          props.onMoreClick?.();
        }}
      >
        <div class="p-2 rounded-full">
          <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
        </div>
      </div>
      <div
        class={cn("__a tabs w-full overflow-x-auto scroll--hidden")}
        //       style="{{style}}"
        onAnimationStart={(event) => {
          const { width, height, left } = event.currentTarget.getBoundingClientRect();
          vm.updateContainerClient({ width, height, left });
        }}
      >
        <div
          class="tabs-wrapper relative"
          // scroll-with-animation="{{scrollWithAnimation}}"
          // scroll-left="{{scrollLeftInset}}"
          // scroll-x
        >
          <div id="tabs-wrapper" class="flex">
            <For each={state().tabs}>
              {(tab, index) => {
                return (
                  <Show when={!tab.hidden}>
                    <div
                      classList={{
                        "relative px-4 py-2 text-w-fg-0 break-keep cursor-pointer": true,
                      }}
                      // style="{{current === index ? activeItemStyle : itemStyle}}"
                      onClick={() => {
                        vm.select(index());
                      }}
                      // onAnimationEnd={(event) => {
                      //   event.stopPropagation();
                      //   const target = event.currentTarget;
                      //   // const { width, height, left } = event.currentTarget.getBoundingClientRect();
                      //   store.updateTabClient(index(), {
                      //     rect() {
                      //       const { offsetLeft, clientWidth, clientHeight } = target;
                      //       return {
                      //         width: clientWidth,
                      //         height: clientHeight,
                      //         left: offsetLeft,
                      //       };
                      //     },
                      //   });
                      // }}
                    >
                      {tab.text}
                      <Show when={tab.id === state().curId}>
                        <div
                          class="absolute left-1/2 -translate-1/2 bottom-0 w-4 bg-w-fg-0 transition-all"
                          style={{
                            height: "4px",
                            transform: "translateX(-50%)",
                          }}
                        />
                      </Show>
                    </div>
                  </Show>
                );
              }}
            </For>
            <div class="px-8"></div>
            {/* {left() !== null ? (
              <div
                class="absolute bottom-0 w-4 bg-w-fg-0 transition-all"
                style={{
                  left: `${left()}px`,
                  height: "4px",
                  transform: "translateX(-50%)",
                }}
              />
            ) : null} */}
          </div>
        </div>
      </div>
    </div>
  );
};
