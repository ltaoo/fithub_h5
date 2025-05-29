import { ChevronLeft } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

import { ViewComponentProps } from "@/store/types";
import { Show } from "solid-js";

export function NavigationBar1(props: { title?: string; extra?: JSX.Element; history: ViewComponentProps["history"] }) {
  return (
    <>
      <div class="flex items-center justify-between gap-2 p-4 border-b-2 border-w-bg-5">
        <div class="flex items-center gap-2">
          <div
            class="p-2 rounded-full bg-w-bg-5"
            onClick={() => {
              props.history.back();
            }}
          >
            <ChevronLeft class="w-6 h-6 text-w-fg-1" />
          </div>
          <Show when={props.title}>
            <div class="title text-w-fg-0">{props.title}</div>
          </Show>
        </div>
        <Show when={props.extra}>
          <div class="extra">{props.extra}</div>
        </Show>
      </div>
    </>
  );
}
