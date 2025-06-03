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
    no_extra_bottom?: boolean;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div class="flex flex-col h-screen">
      <div class="flex-1 overflow-auto">
        <ScrollView store={props.store.ui.$view} class="">
          <div class="h-full p-2">
            {props.children}
            <Show when={!props.no_extra_bottom}>
              <div class="h-[68px]"></div>
            </Show>
          </div>
        </ScrollView>
      </div>
      <BottomNavigationBar1 back={props.store.methods.back} home={props.home} extra={props.operations} />
    </div>
  );
}
