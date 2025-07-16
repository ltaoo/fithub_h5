/**
 * @file 指定天的训练总结
 */
import { For, Show } from "solid-js";
import dayjs from "dayjs";
import { snapdom } from "@zumer/snapdom";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { SetValueView } from "@/components/set-value-view";
import { Flex } from "@/components/flex/flex";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import {
  refreshWorkoutActionStats,
  refreshWorkoutDays,
  refreshWorkoutDayStats,
  refreshWorkoutDayStatsProcess,
  refreshWorkoutStats,
  refreshWorkoutStatsProcess,
} from "@/biz/coach/service";
import { toNumber } from "@/utils/primitive";

import { Divider } from "./divider";
import { Dumbbell, Heart, XCircle } from "lucide-solid";
import { Button, Dialog } from "@/components/ui";
import { map_weekday_text } from "@/biz/workout_plan/workout_schedule";
import { Sheet } from "@/components/ui/sheet";

function WorkoutReportMonthModel(props: ViewComponentProps) {
  const request = {
    workout: {
      stats: new RequestCore(refreshWorkoutDayStats, { process: refreshWorkoutDayStatsProcess, client: props.client }),
    },
    workout_action: {
      stats: new RequestCore(refreshWorkoutActionStats, { client: props.client }),
    },
  };

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $dialog_share_card: new DialogCore({}),
    $btn_download: new ButtonCore({
      async onClick() {
        const $node = document.getElementById("share-card");
        if (!$node) {
          props.app.tip({
            text: ["异常操作"],
          });
          return;
        }
        if (props.app.env.wechat) {
          ui.$dialog_share_card.show();
        }
        try {
          const result = await snapdom($node, { scale: 2 });
          const $img = await result.toPng();
          if (props.app.env.wechat) {
            const $container = document.getElementById("dialog-share-card");
            if (!$container) {
              return;
            }
            // const $img = new Image();
            // $img.src = url;
            $container.appendChild($img);
            return;
          }
          const blob = await snapdom.toBlob($img);
          saveAs(blob, _time.date + ".png");
        } catch (err) {
          const e = err as Error;
          props.app.tip({
            text: ["oops, something went wrong!", e.message],
          });
        }
      },
    }),
  };

  let _time = {
    date: "",
    weekday: "",
  };
  let words = [
    ["Small steps", "lead to big results."],
    ["Progress", "not perfection."],
    ["Every rep counts", "Every sweat drop matters."],
    ["If it doesn’t challenge you", "it doesn’t change you."],
    ["Pain is temporary", "Pride is forever."],
    ["Fitness is a journey", "not a destination."],
    ["It’s okay to rest", "but don’t quit."],
  ];
  let _word = words[0];
  let _state = {
    get time() {
      return _time;
    },
    get word() {
      return _word;
    },
    get title() {
      return props.view.query.title ?? "总结";
    },
    get profile() {
      return request.workout.stats.response;
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

  request.workout.stats.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      console.log(props.view.query);
      const start = toNumber(props.view.query.start);
      if (start === null) {
        return;
      }
      const end = toNumber(props.view.query.end);
      if (end === null) {
        return;
      }
      const today = dayjs(start);
      const weekday = today.get("day");
      const weekday_text = map_weekday_text(weekday);
      _time = {
        date: today.format("YYYY-MM-DD"),
        weekday: weekday_text,
      };
      _word = words[Math.floor(Math.random() * words.length)];
      request.workout.stats.run({
        range_of_start: today.toDate(),
        range_of_end: dayjs(end).toDate(),
      });
    },
    destroy() {
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

export function WorkoutReportDailyView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutReportMonthModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Flex justify="between">
            <div></div>
            <Button store={vm.ui.$btn_download}>下载</Button>
          </Flex>
        }
      >
        <Show when={state().profile}>
          <div id="share-card" class="overflow-hidden bg-[#f2470c]">
            <Flex class="header relative py-4 flex-col" items="center">
              <img class="z-0 absolute left-0 -bottom-4 w-full" src="/share-card__bg.png"></img>
              <Flex class="z-10 relative w-full px-4" items="center" justify="between">
                <div>
                  <div class="text-2xl">{state().time.date}</div>
                  <div>{state().time.weekday}</div>
                </div>
                <Flex class="gap-2">
                  <Show when={state().profile?.tags.includes("strength")}>
                    <div class="rounded-full p-2 bg-[#fcb000]">
                      <Dumbbell class="w-6 h-6" />
                    </div>
                  </Show>
                  <Show when={state().profile?.tags.includes("cardio")}>
                    <div class="rounded-full p-2 bg-[#fcb000]">
                      <Heart class="w-6 h-6" />
                    </div>
                  </Show>
                </Flex>
              </Flex>
              {/* <div class="text-center">
                <div class="text-3xl">{state().profile?.duration_count}</div>
                <div>分钟</div>
              </div> */}
              <Flex class="z-10 relative mt-4" justify="between">
                <div class="px-6 text-center">
                  <div class="text-w-fg-0">总时长</div>
                  <div class="relative">
                    <div class="relative text-3xl">
                      {state().profile?.duration_count}
                      <div class="absolute -right-5 bottom-2" style={{ "font-size": "14px", "line-height": "14px" }}>
                        分钟
                      </div>
                    </div>
                  </div>
                </div>
                <div class="px-6 text-center">
                  <div class="text-w-fg-0">总组数</div>
                  <div class="relative">
                    <div class="relative text-3xl">
                      {state().profile?.set_count}
                      <div class="absolute -right-2 bottom-2" style={{ "font-size": "14px", "line-height": "14px" }}>
                        组
                      </div>
                    </div>
                  </div>
                </div>
                {/* <Divider direction="vertical" /> */}
                <div class="px-6 text-center">
                  <div class="text-w-fg-0">总容量</div>
                  <div class="relative">
                    <div class="relative text-3xl">
                      {state().profile?.volume_count}
                      <div class="absolute -right-5 bottom-2" style={{ "font-size": "14px", "line-height": "14px" }}>
                        kg
                      </div>
                    </div>
                  </div>
                </div>
              </Flex>
            </Flex>
            <div
              class="content z-20 relative py-4 px-4 rounded-t-xl bg-white text-gray-800"
              classList={{
                "space-y-2": true,
              }}
            >
              <For each={state().profile?.workout_steps}>
                {(step, idx) => {
                  if (step.type === "cardio") {
                    return (
                      <div>
                        <Flex class="">
                          <div class="w-[18px] text-[#0a88df]">{idx() + 1}.</div>
                          <Flex class="flex-1">
                            <div class="font-bold">{step.title}</div>
                          </Flex>
                        </Flex>
                      </div>
                    );
                  }
                  if (step.type === "normal") {
                    return (
                      <div>
                        <Flex class="">
                          <div class="w-[18px] text-[#0a88df]">{idx() + 1}.</div>
                          <Flex class="flex-1">
                            <div class="font-bold">{step.title}</div>
                            <div class="mx-1 text-gray-400">x</div>
                            <div class=" text-gray-600">{step.sets.length}组</div>
                          </Flex>
                        </Flex>
                        <Flex class="flex-wrap pl-4 text-[12px]">
                          <For each={step.sets}>
                            {(set, set_idx) => {
                              return (
                                <Flex>
                                  <div class="flex-1">
                                    <For each={set.texts}>
                                      {(text) => {
                                        return <div>{text}</div>;
                                      }}
                                    </For>
                                  </div>
                                  <Show when={set_idx() < step.sets.length - 1}>
                                    <div class="">、</div>
                                  </Show>
                                </Flex>
                              );
                            }}
                          </For>
                        </Flex>
                        <Show when={idx() < state().profile!.workout_steps.length - 1}>
                          <Divider />
                        </Show>
                      </div>
                    );
                  }
                  return (
                    <div>
                      <Flex class="">
                        <div class="w-[18px] text-[#0a88df]">{idx() + 1}.</div>
                        <Flex class="flex-1 whitespace-nowrap">
                          <div class="font-bold">{step.title}</div>
                          <div class="mx-1 text-gray-400">x</div>
                          <div class=" text-gray-600">{step.sets.length}组</div>
                        </Flex>
                      </Flex>
                      <div class="pl-4">
                        <For each={step.sets}>
                          {(set, set_idx) => {
                            return (
                              <Flex class="text-[12px]">
                                <Flex class="flex-1 flex-wrap">
                                  <For each={set.texts}>
                                    {(text, text_idx) => {
                                      return (
                                        <Flex class="whitespace-nowrap">
                                          <div>{text}</div>
                                          <Show when={text_idx() < set.texts.length - 1}>
                                            <div class="mx-1">+</div>
                                          </Show>
                                        </Flex>
                                      );
                                    }}
                                  </For>
                                </Flex>
                                {/* <Show when={set_idx() < step.sets.length - 1}>
                                <div class="">、</div>
                              </Show> */}
                              </Flex>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
            <div class="footer relative">
              <div class="h-[160px]">
                <img
                  class="w-full h-full object-cover"
                  src="https://static.fithub.top/media_resource/release/photo-1517836357463-d25dfeac3438.jpeg"
                  style={
                    {
                      // "background-image": "url()",
                      // "background-size": "100% 100%",
                    }
                  }
                ></img>
              </div>
              <div class="absolute left-4 top-8 text-white">
                <div class="text-3xl">
                  <For each={state().word}>
                    {(w, idx) => {
                      return (
                        <div
                          class="whitespace-nowrap"
                          style={{
                            "margin-left": idx() * 34 + "px",
                          }}
                        >
                          {w}
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </PageView>
      <Dialog store={vm.ui.$dialog_share_card} app={props.app}>
        <div class="relative">
          <div
            class="absolute right-0 -top-12 w-6 h-6"
            onClick={() => {
              vm.ui.$dialog_share_card.hide();
            }}
          >
            <XCircle class="w-6 h-6" />
          </div>
          <div id="dialog-share-card" class="relative flex justify-center w-[80vw] h-[480px] overflow-y-auto"></div>
          <div class="mt-2 text-center">长按保存</div>
        </div>
      </Dialog>
    </>
  );
}
