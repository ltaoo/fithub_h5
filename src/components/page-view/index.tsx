import { JSX } from "solid-js/jsx-runtime";

import { ScrollView } from "@/components/ui";
import { BottomNavigationBar1 } from "@/components/bottom-navigation-bar1";

import { ScrollViewCore } from "@/domains/ui";

export function PageView<T extends { methods: { back: () => void }; ui: { $view: ScrollViewCore } }>(
  props: {
    store: T;
    operations?: JSX.Element;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div class="flex flex-col h-screen">
      <div class="flex-1 overflow-auto">
        <ScrollView store={props.store.ui.$view} class="">
          <div class="p-2">{props.children}</div>
          <div class="h-[68px]"></div>
        </ScrollView>
      </div>
      <BottomNavigationBar1 back={props.store.methods.back} extra={props.operations} />
    </div>
  );
}
