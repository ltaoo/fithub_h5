import { createSignal, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { ViewComponentProps } from "@/store/types";
import { ScrollView } from "@/components/ui";
import { BottomNavigationBar1 } from "@/components/bottom-navigation-bar1";

import { ScrollViewCore } from "@/domains/ui";

export function PageView<
  T extends { methods: { back: () => void }; ui: { $view: ScrollViewCore; $history: ViewComponentProps["history"] } }
>(
  props: {
    store: T;
    home?: boolean;
    operations?: JSX.Element;
    no_padding?: boolean;
    no_extra_bottom?: boolean;
    hide_bottom_bar?: boolean;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [stacks] = createSignal(props.store.ui.$history.stacks);

  return (
    <div class="flex flex-col h-screen bg-w-bg-0">
      <div class="flex-1 overflow-auto">
        <ScrollView store={props.store.ui.$view} class="scroll--hidden">
          <div
            class="h-full"
            classList={{
              "p-2": !props.no_padding,
            }}
          >
            {props.children}
            <Show when={!props.no_extra_bottom}>
              <div class="h-[68px]"></div>
            </Show>
          </div>
        </ScrollView>
      </div>
      <Show when={!props.hide_bottom_bar}>
        <div class="">
          <div class="h-[58px]"></div>
          <div class="z-[10] fixed bottom-0 left-0 w-full">
            <BottomNavigationBar1
              back={props.store.methods.back}
              home={props.home || stacks().length === 1}
              history={props.store.ui.$history}
              extra={props.operations}
            />
          </div>
        </div>
      </Show>
    </div>
  );
}
