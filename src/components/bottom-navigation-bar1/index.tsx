import { ChevronLeft, Home } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

import { ViewComponentProps } from "@/store/types";
import { Show } from "solid-js";

export function BottomNavigationBar1(props: {
  /** 到首页按钮 */
  home?: boolean;
  /** 隐藏边框线 */
  hide_border?: boolean;
  extra?: JSX.Element;
  back: () => void;
}) {
  return (
    <>
      <div
        class="z-10 flex items-center justify-between gap-2 p-2 bg-w-bg-1"
        classList={{
          "border-t-2 border-w-bg-5": !props.hide_border,
        }}
      >
        <div
          class="p-2 w-[40px] rounded-full bg-w-bg-5"
          onClick={() => {
            props.back();
          }}
        >
          <Show when={!props.home} fallback={<Home class="w-6 h-6 text-w-fg-1" />}>
            <ChevronLeft class="w-6 h-6 text-w-fg-1" />
          </Show>
        </div>
        <Show when={props.extra}>
          <div class="extra flex-1">{props.extra}</div>
        </Show>
      </div>
      <div class="safe-height"></div>
    </>
  );
}
