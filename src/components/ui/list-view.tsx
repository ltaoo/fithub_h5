/**
 * @file 提供 加载中、没有数据、加载更多等内容的组件
 */
import { Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AlertCircle, ArrowDown, Bird, Loader } from "lucide-solid";

import { ListCore } from "@/domains/list";
import { cn } from "@/utils";

export function ListView(
  props: { store: ListCore<any, any>; skeleton?: JSX.Element } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, setState] = createSignal(props.store.response);
  // console.log("[COMPONENT]ListView - state", props.store.response.dataSource);

  props.store.onStateChange((v) => {
    console.log("[COMPONENT]ListView - store.onStateChange", v.dataSource);
    setState(v);
  });

  return (
    <div class={cn("relative")}>
      <div class={props.class}>
        <Show
          when={state().initial}
          fallback={
            <Show
              when={!state().empty}
              fallback={
                <div class="w-full h-[360px] center flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center text-w-fg-1">
                    <Bird class="w-24 h-24" />
                    <div class="mt-4 flex items-center space-x-2">
                      <Show when={state().loading}>
                        <Loader class="w-6 h-6 animate-spin" />
                      </Show>
                      <div class="text-center text-xl">{state().loading ? "加载中" : "列表为空"}</div>
                    </div>
                  </div>
                </div>
              }
            >
              {props.children}
            </Show>
          }
        >
          <Show when={props.skeleton}>{props.skeleton}</Show>
        </Show>
      </div>
      <Show
        when={!!state().error}
        fallback={
          <Show when={!state().noMore && !state().initial}>
            <div class="mt-4 flex justify-center py-4 text-w-fg-1">
              <div
                class="flex items-center space-x-2 cursor-pointer"
                onClick={() => {
                  props.store.loadMore();
                }}
              >
                <Show when={state().loading} fallback={<ArrowDown class="w-6 h-6" />}>
                  <Loader class="w-6 h-6 animate-spin" />
                </Show>
                <div class="text-center text-sm">{state().loading ? "加载中" : "加载更多"}</div>
              </div>
            </div>
          </Show>
        }
      >
        <div class="absolute top-0 z-10 w-full h-[360px] center flex items-center justify-center">
          <div class="flex flex-col items-center justify-center text-w-fg-1">
            <AlertCircle class="w-24 h-24" />
            <div class="mt-4 flex items-center space-x-2  text-sm">
              <div class="text-center">{state().error?.message}</div>
            </div>
          </div>
        </div>
      </Show>
      <Show when={state().noMore && !state().empty}>
        <div class="mt-4 flex justify-center py-4 text-w-fg-1 text-sm">
          <div class="flex items-center space-x-2">
            <Show when={state().loading}>
              <Loader class="w-6 h-6 animate-spin" />
            </Show>
            <div
              class="text-center"
              onClick={() => {
                props.store.loadMoreForce();
              }}
            >
              没有数据了
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
