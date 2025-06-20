import { For, Show } from "solid-js";
import { CircleX, Loader2, MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { DropdownMenu, Video } from "@/components/ui";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { Affix } from "@/components/ui/affix";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchArticleProfile, fetchArticleProfileProcess } from "@/biz/coach/service";
import { PlayerCore } from "@/domains/player";
import { AffixCore } from "@/domains/ui/affix";
import { toNumber } from "@/utils/primitive";
import { sleep } from "@/utils";

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
    $view: new ScrollViewCore({
      onScroll(pos) {
        ui.$affix.handleScroll(pos);
      },
    }),
    $history: props.history,
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "复制链接",
          onClick() {
            ui.$menu.hide();
            props.app.copy(props.history.$router.origin + props.history.$router.href);
            props.app.tip({
              text: ["复制成功"],
            });
          },
        }),
        new MenuItemCore({
          label: "编辑",
          hidden: true,
          onClick() {
            ui.$menu.hide();
            props.history.push("root.content_update", {
              id: props.view.query.id,
            });
          },
        }),
      ],
    }),
    $affix: new AffixCore({ top: 0 }),
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
  ui.$video.onCanPlay(() => {
    ui.$affix.registerAgain();
  });

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
      // ui.$affix.registerAgain();
      props.app.setTitle(r.data.title);
      if (r.data.is_author) {
        ui.$menu.showMenuItem("编辑");
      }
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
      <Show when={state().error}>
        <PageView store={vm}>
          <div class="error max-w-[screen] p-4">
            <div class="flex flex-col items-center text-red-500">
              <div>
                <CircleX class="w-12 h-12" />
              </div>
              <div class="mt-2 text-w-fg-0 text-center break-all">{state().error?.message}</div>
            </div>
          </div>
        </PageView>
      </Show>
      <Show when={!state().error}>
        <PageView
          no_padding
          store={vm}
          operations={
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
          }
        >
          <Show when={state().loading}>
            <div class="loading flex justify-center items-center p-4">
              <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
            </div>
          </Show>
          <Show when={state().profile} keyed>
            <div class="p-6">
              <div class="text-xl text-w-fg-0">{state().profile?.title}</div>
              <div class=" mt-2">
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
              <div class="mt-4 text-w-fg-0 text-sm">
                <For each={state().profile?.overview}>
                  {(t) => {
                    return <div>{t}</div>;
                  }}
                </For>
              </div>
            </div>
          </Show>
          <div
            class="z-[3] relative"
            classList={{
              "opacity-0": !state().profile,
            }}
          >
            <Affix store={vm.ui.$affix} class="min-h-[210px]">
              <Video store={vm.ui.$video} />
            </Affix>
          </div>
          <div class="z-[2] relative space-y-4 mt-4 p-2">
            <For each={state().profile?.time_points}>
              {(p, idx) => {
                return (
                  <Flex
                    class="relative gap-2"
                    onClick={() => {
                      vm.methods.handleClickTimePoint(p);
                    }}
                  >
                    <div class="w-[16px]"></div>
                    <div class="absolute left-1 top-2 w-2 h-2 rounded-full bg-w-fg-0"></div>
                    {idx() < state().profile!.time_points.length - 1 && (
                      <div class="absolute left-[7px] top-4 w-0.5 h-full bg-w-fg-3"></div>
                    )}
                    <div class="flex-1">
                      <Flex justify="between">
                        <Flex class="gap-2">
                          <div class="text-blue-500">{p.time_text}</div>
                          <Show when={p.workout_action}>
                            <div class="text-w-fg-0">{p.workout_action?.zh_name}</div>
                          </Show>
                        </Flex>
                        <Show when={p.score}>
                          <div class="w-[88px]">
                            <WorkoutActionScoreColorBar v={p.score?.text!} position={p.score?.position!} />
                          </div>
                        </Show>
                      </Flex>
                      <Show when={p.text.length}>
                        <div class="mt-2 space-y-1">
                          <For each={p.text}>
                            {(t) => {
                              return <div class="text-sm text-w-fg-0">{t}</div>;
                            }}
                          </For>
                        </div>
                      </Show>
                    </div>
                  </Flex>
                );
              }}
            </For>
          </div>
        </PageView>
      </Show>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}

const levels = ["S+", "S", "A", "B", "C", "D", "F", "F-"];
const colors = [
  "bg-green-500", // S+
  "bg-green-400", // S
  "bg-lime-400", // A
  "bg-yellow-400", // B
  "bg-amber-400", // C
  "bg-orange-400", // D
  "bg-red-400", // F
  "bg-red-600", // F-
].reverse();
export function WorkoutActionScoreColorBar(props: { v: string; position: number }) {
  // const idx = levels.indexOf(props.v);
  return (
    <div class="relative w-full max-w-md mx-auto">
      <div
        class="absolute top-2 flex flex-col items-center -translate-x-1/2"
        style={{
          left: `${props.position}%`,
        }}
      >
        <div
          class="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-blue-500"
          style={{ "margin-left": "-8px" }}
        ></div>
        <div class="-translate-x-1/2 text-xs text-center text-w-fg-0" classList={{}}>
          {props.v}
        </div>
      </div>
      <div class="flex w-full h-1 overflow-hidden">
        {levels.map((level, i) => (
          <div
            class={`${colors[i]} flex-1`}
            style={
              {
                // "border-top-left-radius": i === 0 ? "8px" : "0",
                // "border-bottom-left-radius": i === 0 ? "8px" : "0",
                // "border-top-right-radius": i === levels.length - 1 ? "8px" : "0",
                // "border-bottom-right-radius": i === levels.length - 1 ? "8px" : "0",
              }
            }
          ></div>
        ))}
      </div>
      {/* 等级标签 */}
      {/* <div class="flex w-full justify-between mt-1 px-1">
        {levels.map((level) => (
          <span class="text-xs text-gray-500">{level}</span>
        ))}
      </div> */}
    </div>
  );
}
