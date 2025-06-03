import { For, Show } from "solid-js";
import { ChevronRight, MoreHorizontal, Pen } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionHistoryList, fetchWorkoutActionHistoryListProcess } from "@/biz/workout_action/services";
import { ActivityCalendar } from "@/biz/activity_calendar";
import { fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { fetch_user_profile } from "@/biz/user/services";

function HomeMineViewModel(props: ViewComponentProps) {
  const request = {
    mine: {
      profile: new RequestCore(fetch_user_profile, { client: props.client }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryList, {
          process: fetchWorkoutActionHistoryListProcess,
          client: props.client,
        })
      ),
    },
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    gotoWorkoutDayListView() {
      props.history.push("root.workout_day_list");
    },
    gotoSubscriptionView() {
      props.history.push("root.subscription");
    },
    showDialogUpdateNickname() {
      ui.$input_nickname.setValue(_nickname);
      ui.$dialog_nickname_update.show();
    },
    async refreshWorkoutCalendar() {
      const r = await request.workout_day.list.init();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const { dataSource } = r.data;
      const vv = dataSource.filter((v) => {
        return v.day !== null;
      }) as { day: string }[];
      ui.$calendar.methods.setData(
        vv.map((v) => {
          return {
            day: v.day,
            num: 1,
          };
        })
      );
    },
    async refreshMyProfile() {
      const r = await request.mine.profile.run();
      if (r.error) {
        return;
      }
      const { nickname, avatar_url, subscription } = r.data;
      _nickname = nickname;
      _avatar_url = avatar_url;
      if (subscription.visible) {
        _subscription = {
          text: subscription.text,
        };
      }
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $calendar: ActivityCalendar<{ day: string; num: number }>({
      x: 15,
      min: 2,
    }),
    $dialog_nickname_update: new DialogCore(),
    $input_nickname: new InputCore({ defaultValue: "" }),
    $btn_nickname_submit: new ButtonCore({
      onClick() {
        const v = ui.$input_nickname.value;
        if (!v) {
          props.app.tip({
            text: ["请输入昵称"],
          });
          return;
        }
        ui.$dialog_nickname_update.hide();
      },
    }),
  };
  let _nickname = "...";
  let _avatar_url = "";
  let _subscription: { text: string } | null = null;
  let _state = {
    get nickname() {
      return _nickname;
    },
    get avatar_url() {
      return _avatar_url;
    },
    get subscription() {
      return _subscription;
    },
    get response() {
      return request.workout_action_history.list.response;
    },
    get calendar() {
      return ui.$calendar.state;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_action_history.list.onStateChange(() => methods.refresh());
  ui.$calendar.onStateChange(() => methods.refresh());
  ui.$dialog_nickname_update.onShow(() => {
    ui.$input_nickname.focus();
  });

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      methods.refreshWorkoutCalendar();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeMineView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeMineViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div class="">
          <div class="fixed top-2 right-2">
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.showDialogUpdateNickname();
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </div>
          </div>
          <div class="person_profile p-2">
            <div class="flex flex-col items-center gap-2">
              <div>
                <Show
                  when={state().avatar_url}
                  fallback={<div class="w-16 h-16 rounded-full bg-w-bg-5">{/* 头像占位 */}</div>}
                >
                  <div class="w-16 h-16 rounded-full">
                    <img class="w-full h-full object-contain" src={state().avatar_url} />
                  </div>
                </Show>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <div class="text-lg text-w-fg-0 text-center font-semibold">{state().nickname}</div>
                </div>
              </div>
              {/* <Show
                when={state().subscription}
                fallback={
                  <div
                    class="py-1 px-4 border-2 border-w-bg-5 rounded-full"
                    onClick={() => {
                      vm.methods.gotoSubscriptionView();
                    }}
                  >
                    <div class="text-sm text-w-fg-0">成为VIP</div>
                  </div>
                }
              >
                <div
                  class="py-1 px-4 border-2 border-w-bg-5 rounded-full"
                  onClick={() => {
                    vm.methods.gotoSubscriptionView();
                  }}
                >
                  <div class="text-w-fg-0 text-sm">{state().subscription?.text}</div>
                </div>
              </Show> */}
            </div>
            {/* <div class="mt-4 flex justify-between">
            <div class="text-center">
              <p class="text-gray-600 text-sm">训练天数</p>
              <p class="font-semibold">0</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">累计时长</p>
              <p class="font-semibold">0h</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">消耗热量</p>
              <p class="font-semibold">0kcal</p>
            </div>
          </div> */}
          </div>
          <div
            class="mine-page-content overflow-hidden p-2"
            style={{
              "border-radius": "12px 12px 0 0",
            }}
          >
            <div class="rounded-lg border-2 border-w-bg-5">
              <div class="flex items-center justify-between p-4 border-b-2 border-w-bg-5">
                <h3 class="font-semibold text-w-fg-0">训练记录</h3>
                <div
                  class="p-1 rounded-full bg-w-bg-5"
                  onClick={() => {
                    vm.methods.gotoWorkoutDayListView();
                  }}
                >
                  <ChevronRight class="w-5 h-5 text-w-fg-1" />
                </div>
              </div>
              <div class="flex justify-center p-4">
                <div class="flex space-x-1">
                  <div class="space-y-1 text-sm text-w-fg-1">
                    <div class="w-[28px] h-[16px] flex items-center">mon</div>
                    <div class="w-[16px] h-[16px]"></div>
                    <div class="w-[28px] h-[16px] flex items-center">wed</div>
                    <div class="w-[16px] h-[16px]"></div>
                    <div class="w-[16px] h-[16px] flex items-center">fri</div>
                    <div class="w-[16px] h-[16px]"></div>
                    <div class="w-[28px] h-[16px] flex items-center">sun</div>
                  </div>
                  <For each={state().calendar.weeks}>
                    {(week) => {
                      return (
                        <div class="space-y-1">
                          <For each={week.days}>
                            {(day) => {
                              return (
                                <div
                                  classList={{
                                    "w-[16px] h-[16px] rounded-sm bg-w-bg-1": true,
                                    "bg-w-bg-5": !!day.payload?.num,
                                  }}
                                  style={{
                                    opacity: day.hidden ? "0.2" : "1",
                                  }}
                                  data-day={day.day}
                                ></div>
                              );
                            }}
                          </For>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollView>
      <Sheet store={vm.ui.$dialog_nickname_update}>
        <div class="w-screen bg-w-bg-1 p-2">
          <div class="space-y-4">
            <div class="text-xl">修改昵称</div>
            <div>
              <Input store={vm.ui.$input_nickname} />
            </div>
            <div class="flex items-center justify-between">
              <div></div>
              <Button store={vm.ui.$btn_nickname_submit}>提交</Button>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
