import { For, Show, createSignal, onMount } from "solid-js";

import { TabHeaderCore } from "@/domains/ui/tab-header";
import { cn } from "@/utils";

export const WorkoutPlanRecommendTabHeader = (props: { store: TabHeaderCore<any> }) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  const [left, setLeft] = createSignal<null | number>(null);

  console.log("[COMPONENT]ui/tab-header - listen onChange");
  store.onStateChange((v) => {
    console.log("[COMPONENT]ui/tab-header - onChange", v);
    setState(v);
  });
  store.onLinePositionChange((v) => {
    console.log("[COMPONENT]ui/tab-header - onLinePositionChange", v.left);
    setLeft(v.left);
  });

  return (
    <div
      class={cn("__a tabs w-full px-4 border-b border-b-gray-200 overflow-x-auto scroll--hidden")}
      //       style="{{style}}"
      onAnimationStart={(event) => {
        const { width, height, left } = event.currentTarget.getBoundingClientRect();
        store.updateContainerClient({ width, height, left });
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
                      "__a tab__item flex h-[48px] px-4 break-keep cursor-pointer items-center justify-center":
                        true,
                    }}
                    onClick={() => {
                      store.select(index());
                    }}
                    onAnimationEnd={(event) => {
                      event.stopPropagation();
                      const target = event.currentTarget;
                      store.updateTabClient(index(), {
                        rect() {
                          const { offsetLeft, clientWidth, clientHeight } = target;
                          return {
                            width: clientWidth,
                            height: clientHeight,
                            left: offsetLeft,
                          };
                        },
                      });
                    }}
                  >
                    <div
                      classList={{
                        "transform-origin-center transition-all duration-200 text-base": true,
                        "scale-125 font-bold": state().current === index(),
                      }}
                    >
                      {tab.text}
                    </div>
                  </div>
                </Show>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};
