import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { DropdownMenu, Video } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchArticleProfile, fetchArticleProfileProcess } from "@/biz/coach/service";
import { toNumber } from "@/utils/primitive";
import { PlayerCore } from "@/domains/player";
import { sleep } from "@/utils";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { MoreHorizontal } from "lucide-solid";

function ArticleProfileViewModel(props: ViewComponentProps) {
  const request = {
    content: {
      profile: new RequestCore(fetchArticleProfile, { process: fetchArticleProfileProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async handleClickTimePoint(v: { time: number }) {
      ui.$video.setCurrentTime(v.time);
      if (props.app.env.android) {
        await sleep(200);
      }
      ui.$video.play();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "编辑",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.content_update", {
              id: props.view.query.id,
            });
          },
        }),
      ],
    }),
    $video: new PlayerCore({ app: props.app }),
  };
  let _state = {
    get profile() {
      return request.content.profile.response;
    },
    get loading() {
      return request.content.profile.loading;
    },
    get error() {
      return request.content.profile.error;
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

  request.content.profile.onStateChange(() => methods.refresh());
  ui.$video.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        return;
      }
      const r = await request.content.profile.run({ id });
      if (r.error) {
        return;
      }
      ui.$video.load(r.data.video_url);
    },
    destroy() {
      ui.$video.pause();
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export function ArticleProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ArticleProfileViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Show when={state().profile?.is_author}>
            <Flex justify="between">
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
          </Show>
        }
      >
        <Show when={state().profile} keyed>
          <div class="p-4">
            <div class="text-xl text-w-fg-0">{state().profile?.title}</div>
            <div class="mt-2 text-w-fg-1 text-sm">{state().profile?.overview}</div>
            <div class=" mt-4">
              <Flex class="" justify="between">
                <Flex class="gap-2">
                  <Show
                    when={state().profile?.creator.avatar_url}
                    fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                  >
                    <div
                      class="w-[24px] h-[24px] rounded-full"
                      style={{
                        "background-image": `url('${state().profile?.creator.avatar_url}')`,
                        "background-size": "cover",
                        "background-position": "center",
                      }}
                    ></div>
                  </Show>
                  <div class="text-sm text-w-fg-0">{state().profile?.creator.nickname}</div>
                </Flex>
                <div class="text-sm text-w-fg-1">{state().profile?.created_at}</div>
              </Flex>
            </div>
          </div>
        </Show>
        <div class="">
          <Video store={vm.ui.$video} />
        </div>
        <div class="space-y-2 mt-4">
          <For each={state().profile?.time_points}>
            {(p, idx) => {
              return (
                <div
                  class="relative flex gap-2"
                  onClick={() => {
                    vm.methods.handleClickTimePoint(p);
                  }}
                >
                  <div class="w-[16px]"></div>
                  <div class="absolute left-1 top-2 w-2 h-2 rounded-full bg-w-fg-0"></div>
                  {idx() < state().profile!.time_points.length - 1 && (
                    <div class="absolute left-[7px] top-4 w-0.5 h-full bg-w-fg-3"></div>
                  )}
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-blue-500">{p.time_text}</div>
                      <Show when={p.workout_action}>
                        <div class="text-w-fg-0">{p.workout_action?.zh_name}</div>
                      </Show>
                    </div>
                    <Show when={p.text}>
                      <div class="text-sm text-w-fg-1">{p.text}</div>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </PageView>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
