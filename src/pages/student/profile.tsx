/**
 * @file 学员详情
 */
import { For, Show } from "solid-js";
import { Check, ChevronRight, CircleX, Edit, Mars, MoreHorizontal, Venus } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Input, ListView, ScrollView, Skeleton, Textarea } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutPlanSelectView } from "@/components/workout-plan-select";

import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { CalendarCore } from "@/domains/ui/calendar";
import { ListCore } from "@/domains/list";
import { CoachStudentRole, HumanGenderType } from "@/biz/student/constants";
import {
  deleteStudent,
  fetchStudentAuthURL,
  fetchStudentList,
  fetchStudentProfile,
  fetchStudentProfileProcess,
  fetchStudentWorkoutDayList,
  fetchStudentWorkoutDayListProcess,
  updateStudentProfile,
} from "@/biz/student/services";
import { fetchWorkoutPlanList, fetchWorkoutPlanListProcess } from "@/biz/workout_plan/services";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { Result } from "@/domains/result";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { map_weekday_text } from "@/biz/workout_plan/workout_schedule";
import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";
import { toNumber } from "@/utils/primitive";

function MemberProfileViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      profile: new RequestCore(fetchStudentProfile, { process: fetchStudentProfileProcess, client: props.client }),
      workout_day_list: new ListCore(
        new RequestCore(fetchStudentWorkoutDayList, {
          process: fetchStudentWorkoutDayListProcess,
          client: props.client,
        })
      ),
      update: new RequestCore(updateStudentProfile, { client: props.client }),
      delete: new RequestCore(deleteStudent, { client: props.client }),
      auth_url: new RequestCore(fetchStudentAuthURL, { client: props.client }),
    },
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client })
      ),
    },
  };
  type TheWorkoutDay = TheItemTypeFromListCore<typeof request.student.workout_day_list>;
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    gotoWorkoutPlanProfileView(workout_plan: { id: number }) {
      const v = request.student.profile.response;
      if (!v) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      ui.$dialog_workout_plan.hide();
      props.history.push("root.workout_plan_profile", {
        id: String(workout_plan.id),
        student_id: String(v.id),
        student_nickname: v.nickname,
      });
    },
    gotoWorkoutDayListView() {
      props.history.push("root.student_workout_day_list", {
        student_id: props.view.query.id,
      });
    },
    handleClickDate(date: { yyyy: string; value: Date }) {
      const matched = request.student.workout_day_list.response.dataSource.filter(
        (v) => v.finished_at_text === date.yyyy
      );
      _cur_day_profile = {
        workout_days: matched,
        date_text: date.yyyy,
        weekday_text: map_weekday_text(dayjs(date.value).day()),
      };
      methods.refresh();
      ui.$dialog_day_profile.show();
    },
    handleClickWorkoutDay(day: { id: number }) {
      ui.$dialog_day_profile.hide();
      props.history.push("root.workout_day_profile", {
        id: String(day.id),
      });
    },
    copyAuthURL(url: string) {
      props.app.copy(url);
      props.app.tip({
        text: ["复制成功"],
      });
    },
    async ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        return Result.Err("参数错误");
      }
      (async () => {
        const first_week = ui.$calendar.state.weeks[0];
        const first_day = first_week.dates[0];
        const last_week = ui.$calendar.state.weeks[ui.$calendar.state.weeks.length - 1];
        const last_day = last_week.dates[last_week.dates.length - 1];
        const r = await request.student.workout_day_list.init({
          id,
          started_at_start: first_day.value,
          started_at_end: last_day.value,
          status: WorkoutDayStatus.Finished,
        });
        if (r.error) {
          return;
        }
        for (let i = 0; i < r.data.dataSource.length; i += 1) {
          const v = r.data.dataSource[i];
          _workout_day_list.push({
            date_text: dayjs(v.finished_at).format("YYYY-MM-DD"),
          });
        }
        methods.refresh();
      })();
      const r = await request.student.profile.run({ id });
      if (r.error) {
        return Result.Err(r.error);
      }
      if (r.data.role === CoachStudentRole.CoachAndStudent) {
      }
      return Result.Ok(null);
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await methods.ready();
        ui.$view.finishPullToRefresh();
      },
    }),
    $history: props.history,
    $calendar: CalendarCore({
      today: new Date(),
    }),
    $btn_start_workout: new ButtonCore({
      onClick() {
        ui.$workout_plan_select.init();
        ui.$workout_plan_select.ui.$dialog.show();
      },
    }),
    $menu: new DropdownMenuCore({
      items: [
        // new MenuItemCore({
        //   label: "新增测量记录",
        // }),
        new MenuItemCore({
          label: "修改名称",
          onClick() {
            ui.$menu.hide();
            ui.$input_nickname.setValue(request.student.profile.response?.nickname ?? "");
            ui.$dialog_nickname.show();
          },
        }),
        new MenuItemCore({
          label: "生成访问链接",
          async onClick() {
            ui.$menu.hide();
            const id = toNumber(props.view.query.id);
            if (id === null) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            props.app.loading({ text: [] });
            const r = await request.student.auth_url.run({ id });
            if (r.error) {
              props.app.tip({
                text: [r.error.message],
              });
              return;
            }
            props.app.hideLoading();
            ui.$dialog_auth_url.show();
          },
        }),
        // new MenuItemCore({
        //   label: "选择周期计划",
        // }),
        new MenuItemCore({
          label: "删除",
          onClick() {
            ui.$menu.hide();
            ui.$dialog_delete_confirm.show();
          },
        }),
      ],
    }),
    $dialog_delete_confirm: new DialogCore({}),
    $btn_delete_confirm_cancel: new ButtonCore({
      onClick() {
        ui.$dialog_delete_confirm.hide();
      },
    }),
    $btn_delete_confirm_ok: new ButtonCore({
      async onClick() {
        const id = toNumber(props.view.query.id);
        if (id === null) {
          return;
        }
        const r = await request.student.delete.run({ id });
        if (r.error) {
          return;
        }
        ui.$dialog_delete_confirm.hide();
        props.app.tip({
          text: ["删除成功"],
        });
        props.history.back();
      },
    }),
    $dialog_nickname: new DialogCore({}),
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
            text: ["请输入名称"],
          });
          return;
        }
        const id = toNumber(props.view.query.id);
        if (id === null) {
          props.app.tip({
            text: ["异常数据"],
          });
          return;
        }
        ui.$btn_nickname_submit.setLoading(true);
        const r = await request.student.update.run({
          id,
          nickname: v,
        });
        ui.$btn_nickname_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["更新成功"],
        });
        ui.$dialog_nickname.hide();
        request.student.profile.modifyResponse((prev) => {
          return {
            ...prev,
            nickname: v,
          };
        });
      },
    }),
    $dialog_workout_plan: new DialogCore({}),
    $workout_plan_select: WorkoutPlanSelectViewModel({
      defaultValue: [],
      list: request.workout_plan.list,
      onOk(v) {
        const vv = v[0];
        if (!vv) {
          props.app.tip({
            text: ["请选择训练计划"],
          });
          return;
        }
        ui.$workout_plan_select.ui.$dialog.hide();
        methods.gotoWorkoutPlanProfileView({ id: vv.id });
      },
    }),
    $dialog_day_profile: new DialogCore({}),
    $dialog_auth_url: new DialogCore({}),
  };

  let _workout_day_list: { date_text: string }[] = [];
  let _cur_day_profile: {
    date_text: string;
    weekday_text: string;
    workout_days: {
      id: number;
      status: number;
      finished_at: string;
      finished_at_text: string;
      workout_plan: {
        title: string;
        overview: string;
        tags: string[];
      };
    }[];
  } | null = null;
  let _state = {
    get loading() {
      return request.student.profile.loading;
    },
    get profile() {
      return request.student.profile.response;
    },
    get error() {
      return request.student.profile.error;
    },
    get calendar() {
      return {
        weeks: ui.$calendar.state.weeks.map((w) => {
          return {
            dates: w.dates.map((d) => {
              return {
                ...d,
                has_workout_day: _workout_day_list.find((v) => v.date_text === d.yyyy),
              };
            }),
          };
        }),
      };
    },
    get workout_plan() {
      return request.workout_plan.list.response;
    },
    get cur_date_profile() {
      return _cur_day_profile;
    },
    get auth_url() {
      if (!request.student.auth_url.response) {
        return "";
      }
      return props.history.$router.origin + request.student.auth_url.response.url;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.student.profile.onStateChange(() => methods.refresh());
  request.student.auth_url.onStateChange(() => methods.refresh());
  request.workout_plan.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
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

export function HomeStudentProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MemberProfileViewModel, [props]);
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
          store={vm}
          operations={
            <div class="flex items-center gap-2">
              <Button class="w-full" store={vm.ui.$btn_start_workout}>
                {state().profile?.role === CoachStudentRole.FriendAndFriend ? "一起练" : "开始训练"}
              </Button>
              <Show when={state().profile?.role === CoachStudentRole.CoachAndStudent}>
                <div
                  class="w-[40px] rounded-full p-2 bg-w-bg-5"
                  onClick={(event) => {
                    const { x, y } = event.currentTarget.getBoundingClientRect();
                    vm.ui.$menu.toggle({ x, y });
                  }}
                >
                  <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
                </div>
              </Show>
            </div>
          }
        >
          <div class="">
            <Show
              when={state().profile}
              fallback={
                <div class="flex items-center gap-2">
                  <div>
                    <Skeleton class="w-[64px] h-[64px] rounded-full"></Skeleton>
                  </div>
                  <div>
                    <Skeleton class="w-[42px] h-[28px]" />
                  </div>
                </div>
              }
            >
              <div class="flex items-center gap-2">
                <div>
                  <div
                    class="w-[64px] h-[64px] bg-w-bg-5 rounded-full"
                    style={{
                      "background-image": `url('${state().profile?.avatar_url}')`,
                      "background-size": "cover",
                      "background-position": "center",
                    }}
                  ></div>
                </div>
                <div>
                  <div class="text-xl text-w-fg-0">{state().profile?.nickname}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <Show
                      when={state().profile?.gender === HumanGenderType.Female}
                      fallback={
                        <Show when={state().profile?.gender === HumanGenderType.Male}>
                          <Mars class="w-4 h-4 text-blue-500" />
                        </Show>
                      }
                    >
                      <Venus class="w-4 h-4 text-pink-500" />
                    </Show>
                    <Show when={state().profile?.age}>
                      <div class="text-w-fg-1">{state().profile?.age}岁</div>
                    </Show>
                  </div>
                </div>
              </div>
            </Show>
          </div>
          <div class="relative space-y-2 mt-4">
            {/* <div class="relative border-2 border-w-fg-3 rounded-lg">
              <div class="extra absolute right-2 top-2">
                <div class="p-2 rounded-full bg-w-bg-5">
                  <Edit class="w-4 h-4 text-w-fg-1" />
                </div>
              </div>
              <div class="header p-4 border-b-2 border-w-fg-3">
                <div class="text-w-fg-0">身体数据</div>
              </div>
              <div class="body p-4">
                <div></div>
              </div>
            </div> */}
            <div class="relative border-2 border-w-fg-3 rounded-lg">
              <div class="flex items-center justify-between p-4 border-b-2 border-w-fg-3">
                <div class="font-semibold text-w-fg-0">训练日历</div>
                <div
                  class="p-1 rounded-full bg-w-bg-5"
                  onClick={() => {
                    vm.methods.gotoWorkoutDayListView();
                  }}
                >
                  <ChevronRight class="w-5 h-5 text-w-fg-1" />
                </div>
              </div>
              <div class="body p-4">
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
                                // onClick={() => {
                                //   vm.methods.handleClickDate(date);
                                // }}
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
            {/* <div class="relative border-2 border-w-fg-3 rounded-lg">
              <div class="header p-4 border-b-2 border-w-fg-3">
                <div class="text-w-fg-0">问卷调查</div>
              </div>
              <div class="body p-4"></div>
            </div> */}
          </div>
        </PageView>
      </Show>
      <Sheet ignore_safe_height store={vm.ui.$workout_plan_select.ui.$dialog} app={props.app}>
        <WorkoutPlanSelectView store={vm.ui.$workout_plan_select} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_day_profile} app={props.app}>
        <div class="min-h-[320px] p-2">
          <Show when={state().cur_date_profile}>
            <div class="text-2xl text-w-fg-0">{state().cur_date_profile?.date_text}</div>
            <div class="text-w-fg-1">{state().cur_date_profile?.weekday_text}</div>
            <div class="mt-4 space-y-2">
              <For each={state().cur_date_profile?.workout_days}>
                {(day) => {
                  return (
                    <div
                      class="p-2 rounded-lg border-2 border-w-fg-3"
                      onClick={() => {
                        vm.methods.handleClickWorkoutDay(day);
                      }}
                    >
                      <div class="text-w-fg-0">{day.workout_plan.title}</div>
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="text-sm text-w-fg-1">已完成</div>
                        </div>
                        <div class="px-2 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-sm">详情</div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_nickname} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center text-w-fg-0">修改名称</div>
          <div class="mt-4">
            <Input store={vm.ui.$input_nickname} />
          </div>
          <div class="mt-2">
            <Button class="w-full" store={vm.ui.$btn_nickname_submit}>
              提交
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_delete_confirm} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center text-w-fg-0">确认删除该学员？</div>
          <div class="mt-4 flex items-center gap-2">
            <Button class="w-full" store={vm.ui.$btn_delete_confirm_cancel}>
              取消
            </Button>
            <Button class="w-full" store={vm.ui.$btn_delete_confirm_ok}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_auth_url} app={props.app}>
        <div class="p-4">
          <div class="mb-4 text-center text-lg text-w-fg-0">访问链接</div>
          <Show when={state().auth_url} fallback={<div class="py-4 text-center text-w-fg-0">链接生成中</div>}>
            <div
              onClick={() => {
                vm.methods.copyAuthURL(state().auth_url);
              }}
            >
              <div class="text-w-fg-0 break-all">{state().auth_url}</div>
              <div class="mt-2 text-sm text-center text-w-fg-1">点击复制</div>
            </div>
          </Show>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
