import { For, Show } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { DropdownMenu, ListView } from "@/components/ui";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchArticleList } from "@/biz/coach/service";
import { TheItemTypeFromListCore } from "@/domains/list/typing";

function ArticleListViewModel(props: ViewComponentProps) {
  const request = {
    content: {
      list: new ListCore(new RequestCore(fetchArticleList, { client: props.client })),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickArticle(v: TheItemTypeFromListCore<typeof request.content.list>) {
      props.history.push("root.content_profile", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.content.list.loadMore();
        ui.$view.finishLoadingMore();
      },
      async onPullToRefresh() {
        await request.content.list.refresh();
        ui.$view.finishPullToRefresh();
      },
    }),
    $history: props.history,
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "创建",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.content_create");
          },
        }),
      ],
    }),
  };
  let _state = {
    get response() {
      return request.content.list.response;
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  request.content.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.content.list.init();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ArticleListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ArticleListViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Flex class="justify-between">
            <div></div>
            <IconButton
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </IconButton>
          </Flex>
        }
      >
        <ListView store={vm.request.content.list} class="space-y-2">
          <For each={state().response.dataSource}>
            {(v) => {
              return (
                <div
                  class="p-4 border-2 border-w-fg-3 rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickArticle(v);
                  }}
                >
                  <div class="text-lg text-w-fg-0">{v.title}</div>
                  <div class="flex items-center gap-2 mt-2">
                    <Show
                      when={v.creator.avatar_url}
                      fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                    >
                      <div
                        class="w-[24px] h-[24px] rounded-full"
                        style={{
                          "background-image": `url('${v.creator.avatar_url}')`,
                          "background-size": "cover",
                          "background-position": "center",
                        }}
                      ></div>
                    </Show>
                    <div class="text-sm text-w-fg-0">{v.creator.nickname}</div>
                  </div>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
