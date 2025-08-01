import { For, Show } from "solid-js";
import { Award, Bird, ChevronDown, ChevronLeft, ChevronRight, Gem, Moon, MoreHorizontal, Pen, Sun } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Input, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Flex } from "@/components/flex/flex";
import { Empty } from "@/components/empty";

import { base, Handler } from "@/domains/base";
import {
  ButtonCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  MenuItemCore,
  ScrollViewCore,
  SelectCore,
} from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import {
  fetchWorkoutActionHistoryListOfWorkoutDay,
  fetchWorkoutActionHistoryListOfWorkoutDayProcess,
} from "@/biz/workout_action/services";
import { ActivityCalendar } from "@/biz/activity_calendar";
import {
  fetchFinishedWorkoutDayList,
  fetchFinishedWorkoutDayListProcess,
  fetchWorkoutDayList,
  fetchWorkoutDayListProcess,
} from "@/biz/workout_day/services";
import {
  createAccount,
  fetch_user_profile,
  fetch_user_profile_process,
  update_user_profile,
} from "@/biz/user/services";
import { fetchGiftCardProfile, usingGiftCard } from "@/biz/subscription/services";
import { Result } from "@/domains/result";
import { SubscriptionStatus } from "@/biz/subscription/constants";
import { Avatars } from "@/biz/student/constants";
import { SelectViewModel } from "@/biz/select_base";
import { CalendarCore } from "@/domains/ui/calendar";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { UserAccountForm } from "@/biz/user/account_form";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { Select } from "@/components/ui/select";

function HomeMineViewModel(props: ViewComponentProps) {
  const request = {
    mine: {
      profile: new RequestCore(fetch_user_profile, { process: fetch_user_profile_process, client: props.client }),
      update_profile: new RequestCore(update_user_profile, { client: props.client }),
      create_account: new RequestCore(createAccount, { client: props.client }),
    },
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutDay, {
          process: fetchWorkoutActionHistoryListOfWorkoutDayProcess,
          client: props.client,
        })
      ),
    },
    workout_day: {
      finished_list: new ListCore(
        new RequestCore(fetchFinishedWorkoutDayList, {
          process: fetchFinishedWorkoutDayListProcess,
          client: props.client,
        })
      ),
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, { process: fetchWorkoutDayListProcess, client: props.client })
      ),
    },
    gift_card: {
      profile: new RequestCore(fetchGiftCardProfile, { client: props.client }),
      exchange: new RequestCore(usingGiftCard, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async ready() {
      await methods.refreshWorkoutCalendar();
      await methods.refreshMyProfile();
      return Result.Ok(null);
    },
    gotoWorkoutDayListView() {
      props.history.push("root.workout_day_list");
    },
    gotoSubscriptionView() {
      props.history.push("root.subscription");
    },
    showDialogNicknameUpdate() {
      ui.$input_nickname.setValue(_nickname);
      ui.$dialog_nickname_update.show();
    },
    showDialogAvatarURLUpdate() {
      const matched = Avatars.find((v) => v.url === _avatar_url);
      if (matched) {
        ui.$select_avatar.select(matched);
      }
      ui.$dialog_avatar_update.show();
    },
    clearGiftCardProfile() {
      ui.$input_gift_card_code.clear();
      // @ts-ignore
      request.gift_card.profile.modifyResponse(() => {
        return null;
      });
    },
    async refreshWorkoutCalendar() {
      const first_day = ui.$calendar.state.weeks[0].dates[0];
      const last_week = ui.$calendar.state.weeks[ui.$calendar.state.weeks.length - 1];
      const last_day = last_week.dates[last_week.dates.length - 1];
      request.workout_day.finished_list.init({
        finished_at_start: first_day.yyyy,
        finished_at_end: last_day.yyyy,
      });
      // if (r.error) {
      //   props.app.tip({
      //     text: [r.error.message],
      //   });
      //   return;
      // }
      // const vv = r.data.dataSource.filter((v) => {
      //   return v.day !== null;
      // }) as { day: string }[];
      // ui.$calendar.methods.setData(
      //   vv.map((v) => {
      //     return {
      //       day: v.day,
      //       num: 1,
      //     };
      //   })
      // );
    },
    async refreshMyProfile() {
      const r = await request.mine.profile.run();
      if (r.error) {
        return;
      }
      const { nickname, avatar_url, subscription, no_account } = r.data;
      _nickname = nickname;
      _avatar_url = avatar_url;
      if (subscription && subscription.status === SubscriptionStatus.Active) {
        _subscription = {
          name: subscription.name,
          expired_at: subscription.expired_at_text,
        };
      }
      if (no_account) {
        ui.$dialog_account_create.show();
      }
      methods.refresh();
    },
    changeTheme() {
      const t = (() => {
        if (props.app.theme === "dark") {
          return "light";
        }
        return "dark";
      })();
      props.app.setTheme(t);
      _theme = props.app.theme;
      methods.refresh();
    },
    async createAccount() {
      const r = await ui.$form_account.validate();
      if (r.error) {
        return Result.Err(r.error);
      }
      const r2 = await request.mine.create_account.run(r.data);
      if (r2.error) {
        return Result.Err(r2.error);
      }
      props.app.$user.updateToken(r2.data);
      return Result.Ok(r2.data);
    },
    async handleClickDate(date: { yyyy: string }) {
      const [finished_at_start, finished_at_end] = [
        dayjs(date.yyyy).startOf("date").toDate(),
        dayjs(date.yyyy).endOf("date").toDate(),
      ];
      const r = await request.workout_day.list.search({
        finished_at_start,
        finished_at_end,
        status: WorkoutDayStatus.Finished,
      });
      if (r.error) {
        return;
      }
      ui.$dialog_calendar_workout_days.show();
    },
    async handleClickPrevMonthReport() {
      const v = ui.$select_month.value;
      const today = dayjs("2025/06/01");
      props.history.push("root.workout_report_month", {
        title: "六月训练总结",
        start: String(today.startOf("month").startOf("date").valueOf()),
        end: String(today.endOf("month").endOf("date").valueOf()),
      });
    },
  };
  const today = dayjs();
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await methods.ready();
        ui.$view.finishPullToRefresh();
      },
    }),
    $select_month: new SelectCore({
      defaultValue: today.month(),
      options: Array.from({ length: today.month() + 1 }, (_, i) => ({
        label: `${i + 1}月`,
        value: i,
      })),
      onChange(v) {
        if (v === null) {
          return;
        }
        const vv = dayjs().set("month", v);
        // const [start, end] = [vv.startOf("month").startOf("date"), vv.endOf("month").endOf("date")];
        ui.$calendar.selectDay(vv.toDate());
        methods.refreshWorkoutCalendar();
      },
    }),
    $calendar: CalendarCore({
      today: today.toDate(),
    }),
    $menu: new DropdownMenuCore({
      items: [
        // new MenuItemCore({
        //   label: "修改昵称",
        //   onClick() {
        //     ui.$menu.hide();
        //     methods.showDialogNicknameUpdate();
        //   },
        // }),
        // new MenuItemCore({
        //   label: "修改头像",
        //   onClick() {
        //     ui.$menu.hide();
        //     methods.showDialogAvatarURLUpdate();
        //   },
        // }),
        new MenuItemCore({
          label: "复制 UID",
          onClick() {
            const v = request.mine.profile.response;
            if (!v) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            props.app.copy(v.uid);
            props.app.tip({
              text: ["复制成功"],
            });
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "兑换礼品码",
          onClick() {
            ui.$menu.hide();
            ui.$dialog_gift_card.show();
          },
        }),
        new MenuItemCore({
          label: "设置",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.settings");
          },
        }),
      ],
    }),
    $dialog_account_create: new DialogCore(),
    $form_account: UserAccountForm().ui.$form,
    $btn_account_create: new ButtonCore({
      async onClick() {
        ui.$btn_account_create.setLoading(true);
        const r = await methods.createAccount();
        ui.$btn_account_create.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: r.error.messages,
          });
          return;
        }
        props.app.tip({
          text: ["操作成功"],
        });
        ui.$dialog_account_create.hide();
      },
    }),
    $dialog_nickname_update: new DialogCore(),
    $input_nickname: new InputCore({
      defaultValue: "",
      onMounted() {
        ui.$input_nickname.focus();
      },
    }),
    $btn_nickname_submit: new ButtonCore({
      async onClick() {
        const v = ui.$input_nickname.value;
        if (!v) {
          props.app.tip({
            text: ["请输入昵称"],
          });
          return;
        }
        ui.$btn_nickname_submit.setLoading(true);
        const r = await request.mine.update_profile.run({ nickname: v });
        ui.$btn_nickname_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _nickname = v;
        props.app.tip({
          text: ["修改成功"],
        });
        methods.refresh();
        ui.$dialog_nickname_update.hide();
      },
    }),
    $select_avatar: SelectViewModel({
      defaultValue: [],
      list: Avatars,
      multiple: false,
    }),
    $dialog_avatar_update: new DialogCore(),
    $input_avatar: new InputCore({
      defaultValue: "",
      onMounted() {
        ui.$input_nickname.focus();
      },
    }),
    $btn_avatar_submit: new ButtonCore({
      async onClick() {
        const v = ui.$select_avatar.value;
        if (v.length === 0) {
          props.app.tip({
            text: ["请选择头像"],
          });
          return;
        }
        ui.$btn_nickname_submit.setLoading(true);
        const r = await request.mine.update_profile.run({ avatar_url: v[0].key });
        ui.$btn_nickname_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _avatar_url = v[0].url;
        props.app.tip({
          text: ["修改成功"],
        });
        methods.refresh();
        ui.$dialog_avatar_update.hide();
      },
    }),
    $dialog_gift_card: new DialogCore({}),
    $input_gift_card_code: new InputCore({
      defaultValue: "",
      onMounted() {
        ui.$input_gift_card_code.focus();
      },
    }),
    $btn_gift_card_profile: new ButtonCore({
      async onClick() {
        const v = ui.$input_gift_card_code.value;
        if (!v) {
          props.app.tip({
            text: ["请输入礼品码"],
          });
          return;
        }
        ui.$btn_gift_card_profile.setLoading(true);
        const r = await request.gift_card.profile.run({ code: v });
        ui.$btn_gift_card_profile.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        // ui.$dialog_gift_card.hide();
        // methods.refreshMyProfile();
      },
    }),
    $btn_gift_card_confirm: new ButtonCore({
      async onClick() {
        const v = ui.$input_gift_card_code.value;
        if (!v) {
          props.app.tip({
            text: ["请输入礼品码"],
          });
          return;
        }
        ui.$btn_gift_card_confirm.setLoading(true);
        const r = await request.gift_card.exchange.run({ code: v });
        ui.$btn_gift_card_confirm.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["兑换成功"],
        });
        ui.$dialog_gift_card.hide();
        methods.clearGiftCardProfile();
        methods.refreshMyProfile();
      },
    }),
    $dialog_calendar_workout_days: new DialogCore({}),
  };
  let _theme = props.app.theme;
  let _nickname = "...";
  let _avatar_url = "";
  let _subscription: { name: string; expired_at: string | null } | null = null;
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
    get calendar() {
      return {
        weeks: ui.$calendar.state.weeks.map((w) => {
          return {
            dates: w.dates.map((d) => {
              return {
                ...d,
                has_workout_day: request.workout_day.finished_list.response.dataSource.find(
                  (v) => v.date_text === d.yyyy
                ),
              };
            }),
          };
        }),
      };
    },
    get gift_card() {
      return request.gift_card.profile.response;
    },
    get avatars() {
      return ui.$select_avatar.state.list;
    },
    get theme() {
      return _theme;
    },
    get workout_days() {
      return request.workout_day.list.response.dataSource;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_day.finished_list.onStateChange(() => methods.refresh());
  request.workout_day.list.onStateChange(() => methods.refresh());
  request.gift_card.profile.onStateChange(() => methods.refresh());
  // ui.$calendar.onStateChange(() => methods.refresh());
  ui.$dialog_nickname_update.onShow(() => {
    ui.$input_nickname.focus();
  });
  ui.$calendar.onChange(() => methods.refresh());
  ui.$select_avatar.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      methods.ready();
    },
    destroy() {
      bus.destroy();
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
      <ScrollView store={vm.ui.$view} class="scroll--hidden bg-w-bg-0">
        <div class="">
          <div class="fixed top-2 right-2 flex items-center gap-2">
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.changeTheme();
              }}
            >
              <Show when={state().theme === "dark"} fallback={<Sun class="w-6 h-6 text-w-fg-0" />}>
                <Moon class="w-6 h-6 text-w-fg-0" />
              </Show>
            </div>
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </div>
          </div>
          <div class="person_profile p-2">
            <div class="flex flex-col items-center gap-4">
              <div class="avatar relative">
                <Show
                  when={state().avatar_url}
                  fallback={
                    <div
                      class="w-[88px] h-[88px] rounded-full bg-w-bg-5"
                      onClick={() => {
                        vm.methods.showDialogAvatarURLUpdate();
                      }}
                    >
                      {/* 头像占位 */}
                    </div>
                  }
                >
                  <div
                    class="w-[88px] h-[88px] aspect-square rounded-full"
                    style={{
                      "background-image": `url('${state().avatar_url}')`,
                      "background-size": "cover",
                      "background-position": "center",
                    }}
                    onClick={() => {
                      vm.methods.showDialogAvatarURLUpdate();
                    }}
                  ></div>
                </Show>
                <Show when={state().subscription}>
                  <Show
                    when={state().subscription?.expired_at}
                    fallback={
                      <div class="absolute left-1/2 -translate-x-1/2 translate-y-1/2 bottom-0">
                        <Flex
                          class="px-2 border border-w-fg-3 rounded-full bg-w-bg-5"
                          onClick={(event) => {
                            event.stopPropagation();
                            vm.methods.gotoSubscriptionView();
                          }}
                        >
                          <Award class="w-4 h-4 text-yellow-500" />
                          <div class="text-yellow-500 text-[12px] whitespace-nowrap">{state().subscription?.name}</div>
                        </Flex>
                      </div>
                    }
                  >
                    <div class="absolute left-1/2 -translate-x-1/2 translate-y-1/2 bottom-0">
                      <Flex
                        class="px-2 border border-w-fg-3 rounded-full bg-w-bg-5"
                        items="center"
                        onClick={(event) => {
                          event.stopPropagation();
                          vm.methods.gotoSubscriptionView();
                        }}
                      >
                        <Gem class="w-2.5 h-2.5 text-yellow-500" />
                        <div class="ml-1 text-yellow-500 text-[12px]">{state().subscription?.name}</div>
                      </Flex>
                    </div>
                  </Show>
                </Show>
              </div>
              <div
                onClick={() => {
                  vm.methods.showDialogNicknameUpdate();
                }}
              >
                <div class="flex items-center gap-2">
                  <div class="text-lg text-w-fg-0 text-center font-semibold">{state().nickname}</div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="mine-page-content overflow-hidden p-2"
            style={{
              "border-radius": "12px 12px 0 0",
            }}
          >
            <div class="rounded-lg border-2 border-w-fg-3 mt-2">
              <div class="flex items-center justify-between p-4 border-b-2 border-w-fg-3">
                <Flex class="gap-2" items="center">
                  <div class="font-semibold text-w-fg-0">训练日历</div>
                  <div>
                    <Select store={vm.ui.$select_month}></Select>
                  </div>
                </Flex>
                <div
                  class="p-1 rounded-full bg-w-bg-5"
                  onClick={() => {
                    vm.methods.gotoWorkoutDayListView();
                  }}
                >
                  <ChevronRight class="w-5 h-5 text-w-fg-1" />
                </div>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-7 gap-2">
                  <For each={["周一", "周二", "周三", "周四", "周五", "周六", "周日"]}>
                    {(t) => {
                      return <div class="text-center text-sm text-w-fg-1">{t}</div>;
                    }}
                  </For>
                </div>
                <For each={state().calendar.weeks}>
                  {(week) => {
                    return (
                      <div class="grid grid-cols-7 gap-2">
                        <For each={week.dates}>
                          {(date) => {
                            return (
                              <div
                                classList={{
                                  "relative p-2 rounded-md": true,
                                  "opacity-40": date.is_next_month || date.is_prev_month,
                                  "bg-w-bg-5": date.is_today,
                                }}
                                onClick={() => {
                                  vm.methods.handleClickDate(date);
                                }}
                              >
                                <div class="text-center text-sm text-w-fg-0">{date.text}</div>
                                <Show when={date.has_workout_day}>
                                  <div class="absolute right-1 top-1 flex justify-center">
                                    <div class="w-[6px] h-[6px] rounded-full bg-green-500" />
                                  </div>
                                </Show>
                              </div>
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
          {/* <div class="px-2">
            <div
              class="p-4 border-2 border-w-fg-3 rounded-lg"
              onClick={() => {
                vm.methods.handleClickPrevMonthReport();
              }}
            >
              <div class="text-w-fg-0">六月训练统计</div>
            </div>
          </div> */}
        </div>
      </ScrollView>
      <Sheet store={vm.ui.$dialog_account_create} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">补全帐号</div>
            <div class="space-y-4 rounded-md text-w-fg-0">
              <div>
                <div>邮箱</div>
                <Input class="mt-1" store={vm.ui.$form_account.fields.email.input} />
              </div>
              <div>
                <div>密码</div>
                <Input class="mt-1" store={vm.ui.$form_account.fields.password.input} />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <Button class="w-full" store={vm.ui.$btn_account_create}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_nickname_update} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">修改昵称</div>
            <div>
              <Input store={vm.ui.$input_nickname} />
            </div>
            <div class="flex items-center justify-between">
              <Button class="w-full" store={vm.ui.$btn_nickname_submit}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_avatar_update} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">修改头像</div>
            <div>
              <div class="grid grid-cols-4 gap-4">
                <For each={state().avatars}>
                  {(avatar) => {
                    return (
                      <div
                        class="aspect-square rounded-full"
                        classList={{
                          "ring-4 ring-w-green": avatar.selected,
                        }}
                        style={{
                          "background-image": `url('${avatar.url}')`,
                          "background-size": "cover",
                          "background-position": "center",
                        }}
                        onClick={() => {
                          vm.ui.$select_avatar.select(avatar);
                        }}
                      ></div>
                    );
                  }}
                </For>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="p-2 rounded-full bg-w-bg-5"
                onClick={() => {
                  vm.ui.$dialog_avatar_update.hide();
                }}
              >
                <ChevronDown class="w-6 h-6 text-w-fg0" />
              </div>
              <Button class="w-full" store={vm.ui.$btn_avatar_submit}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_gift_card} app={props.app}>
        <Show
          when={state().gift_card}
          fallback={
            <div class="p-2">
              <div class="space-y-4">
                <div class="text-xl text-center text-w-fg-0">兑换礼品码</div>
                <div>
                  <Input store={vm.ui.$input_gift_card_code} />
                </div>
                <div class="flex items-center justify-between">
                  <Button class="w-full" store={vm.ui.$btn_gift_card_confirm}>
                    兑换
                  </Button>
                </div>
              </div>
            </div>
          }
        >
          <div class="relative p-2">
            <div class="flex items-center justify-between">
              <div
                class="p-2 rounded-full bg-w-bg-5"
                onClick={() => {
                  vm.methods.clearGiftCardProfile();
                }}
              >
                <ChevronLeft class="w-6 h-6 text-w-fg-0" />
              </div>
              <div class="text-xl text-center text-w-fg-0">详情</div>
              <div class="w-[40px]"></div>
            </div>
            <div class="mt-4 rounded-lg border-2 border-w-fg-3 p-4 text-w-fg-0">{state().gift_card?.name}</div>
            <Button class="w-full mt-2" store={vm.ui.$btn_gift_card_confirm}>
              确认兑换
            </Button>
          </div>
        </Show>
      </Sheet>
      <Sheet store={vm.ui.$dialog_calendar_workout_days} app={props.app}>
        <div class="p-2 space-y-2 h-[320px] overflow-y-auto">
          <For each={state().workout_days} fallback={<Empty text="无训练记录" />}>
            {(d) => {
              return (
                <div class="p-4 border-2 border-w-fg-3 rounded-lg">
                  <div class="text-w-fg-0">{d.title}</div>
                  <Flex justify="between">
                    <div class="text-sm text-w-fg-1">完成于 {d.finished_at_text}</div>
                    <Flex class="gap-2">
                      <Show when={d.workout_plan}>
                        <div
                          class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-w-fg-0"
                          onClick={() => {
                            vm.ui.$dialog_calendar_workout_days.hide();
                            props.history.push("root.workout_plan_profile", {
                              id: String(d.workout_plan!.id),
                            });
                          }}
                        >
                          <div class="text-sm">计划</div>
                        </div>
                      </Show>
                      <div
                        class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-w-fg-0"
                        onClick={() => {
                          vm.ui.$dialog_calendar_workout_days.hide();
                          props.history.push("root.workout_day_result", {
                            id: String(d.id),
                          });
                        }}
                      >
                        <div class="text-sm">详情</div>
                      </div>
                    </Flex>
                  </Flex>
                </div>
              );
            }}
          </For>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
