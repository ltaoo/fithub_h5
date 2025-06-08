import { JSX } from "solid-js/jsx-runtime";

import { ScrollView } from "@/components/ui";
import { BottomNavigationBar1 } from "@/components/bottom-navigation-bar1";

import { ScrollViewCore } from "@/domains/ui";
import { Show } from "solid-js";

export function PageView<T extends { methods: { back: () => void }; ui: { $view: ScrollViewCore } }>(
  props: {
    store: T;
    home?: boolean;
    operations?: JSX.Element;
    no_padding?: boolean;
    no_extra_bottom?: boolean;
    hide_bottom_bar?: boolean;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div class="flex flex-col h-screen">
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
        <BottomNavigationBar1 back={props.store.methods.back} home={props.home} extra={props.operations} />
      </Show>
    </div>
  );
}
