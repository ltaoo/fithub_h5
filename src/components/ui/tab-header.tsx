import { For, Show, createSignal, onMount } from "solid-js";

import { TabHeaderCore } from "@/domains/ui/tab-header";
import { cn } from "@/utils";

export const TabHeader = (props: { store: TabHeaderCore<any> }) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  const [left, setLeft] = createSignal<null | number>(null);

  // console.log("[COMPONENT]ui/tab-header - listen onChange");
  store.onStateChange((v) => {
    // console.log("[COMPONENT]ui/tab-header - onChange", v);
    setState(v);
  });
  store.onLinePositionChange((v) => {
    // console.log("[COMPONENT]ui/tab-header - onLinePositionChange", v.left);
    setLeft(v.left);
  });

  return (
    <div
      class={cn("__a tabs w-full overflow-x-auto scroll--hidden")}
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
        <div id="tabs-wrapper" class="flex border-b border-w-fg-1">
          <For each={state().tabs}>
            {(tab, index) => {
              return (
                <Show when={!tab.hidden}>
                  <div
                    classList={{
                      "__a p-4 break-keep cursor-pointer": true,
                    }}
                    // style="{{current === index ? activeItemStyle : itemStyle}}"
                    onClick={() => {
                      store.select(index());
                    }}
                    onAnimationEnd={(event) => {
                      event.stopPropagation();
                      const target = event.currentTarget;
                      // const { width, height, left } = event.currentTarget.getBoundingClientRect();
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
                    {tab.text}
                  </div>
                </Show>
              );
            }}
          </For>
          {left() !== null ? (
            <div
              class="absolute bottom-0 w-4 bg-w-fg-0 transition-all"
              style={{
                left: `${left()}px`,
                height: "4px",
                transform: "translateX(-50%)",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
