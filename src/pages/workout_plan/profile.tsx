/**
 * @file 训练计划详情
 */
import { Show, For, Switch, Match } from "solid-js";
import { CircleX, Clock, LoaderCircle, MoreHorizontal, X } from "lucide-solid";

import { ViewComponentProps, PageKeys } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, ListView, ScrollView, Video } from "@/components/ui";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";
import { Avatar } from "@/components/avatar";
import { MultipleAvatar } from "@/components/avatar/multiple";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionProfileView } from "@/components/workout-action-profile";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DialogCore, DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import {
  fetchContentListOfWorkoutPlan,
  fetchContentProfileOfWorkoutPlan,
  fetchContentProfileOfWorkoutPlanProcess,
  fetchWorkoutPlanProfile,
  fetchWorkoutPlanProfileProcess,
} from "@/biz/workout_plan/services";
import { WorkoutPlanSetType, WorkoutPlanStepTypeTextMap, WorkoutSetTypeTextMap } from "@/biz/workout_plan/constants";
import { createWorkoutDay } from "@/biz/workout_day/services";
import { fetchMuscleList, fetchMuscleListProcess } from "@/biz/muscle/services";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { WorkoutPlanViewModel } from "@/biz/workout_plan/workout_plan";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { map_parts_with_ids } from "@/biz/muscle/data";
import { StudentSelectViewModel } from "@/biz/student_select";
import { ListCore } from "@/domains/list";
import { fetchStudentList, fetchStudentListProcess } from "@/biz/student/services";
import { Result } from "@/domains/result";
import { StudentSelect2ViewModel } from "@/biz/student/student_select";
import { WorkoutActionProfileViewModel } from "@/biz/workout_action/workout_action";
import { VideoWithPointsModel } from "@/biz/content/video_play";
import { PlayerCore } from "@/domains/player";
import { toNumber } from "@/utils/primitive";

import { WorkoutPlanVideoPlayView } from "./components/video-play";
import { getSetValueUnit } from "@/biz/input_set_value";

function HomeWorkoutPlanProfilePageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    content_of_workout_plan: {
      list: new ListCore(new RequestCore(fetchContentListOfWorkoutPlan, { client: props.client })),
      profile: new RequestCore(fetchContentProfileOfWorkoutPlan, {
        process: fetchContentProfileOfWorkoutPlanProcess,
        client: props.client,
      }),
    },
    workout_day: { create: new RequestCore(createWorkoutDay, { client: props.client, onFailed() {} }) },
    student: {
      list: new ListCore(new RequestCore(fetchStudentList, { process: fetchStudentListProcess, client: props.client })),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async ready() {
      const { student_id, student_nickname } = props.view.query;
      if (student_id && student_nickname) {
        _students.push({
          id: Number(student_id),
          nickname: student_nickname,
        });
      }
      const id = toNumber(props.view.query.id);
      if (!id) {
        return Result.Err("错误参数");
      }
      (async () => {
        const r = await request.content_of_workout_plan.list.init({ workout_plan_id: id });
        if (r.error) {
          return;
        }
      })();
      const r = await ui.$profile.methods.fetch({ id });
      if (r.error) {
        return Result.Err(r.error);
      }
      const muscle_ids = r.data.muscles.map((m) => m.id);
      ui.$muscle.highlight_muscles(map_parts_with_ids(muscle_ids));
      if (r.data.creator.is_self) {
        ui.$menu.showMenuItem("编辑");
      }
      return Result.Ok(null);
    },
    async startWorkoutDay() {
      const id = props.view.query.id;
      if (!id) {
        props.app.tip({
          text: ["数据异常"],
        });
        return;
      }
      ui.$btn_start_workout.setLoading(true);
      const r = await request.workout_day.create.run({
        workout_plan_id: Number(id),
        student_ids: _students.map((s) => s.id),
        start_when_create: true,
      });
      ui.$btn_start_workout.setLoading(false);
      if (r.error) {
        if (r.error.code == 101) {
          ui.$dialog_buy_guide.show();
          return;
        }
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.history.push("root.workout_day", {
        directly_working: "1",
      });
    },
    removeStudent(student: { id: number }) {
      _students = _students.filter((v) => v.id !== student.id);
      methods.refresh();
    },
    handleClickWorkoutAction(act: { id: number }) {
      ui.$workout_action.methods.fetch({ id: act.id });
      ui.$workout_action.ui.$dialog.show();
    },
    async handleClickContentOfWorkoutPlan(v: { id: number }) {
      let profile = request.content_of_workout_plan.profile.response;
      const click_other_content = profile && profile.id !== v.id;
      if (click_other_content || !profile) {
        const r = await request.content_of_workout_plan.profile.run({ id: v.id });
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
      }
      console.log("before if (!profile");
      profile = request.content_of_workout_plan.profile.response;
      if (!profile) {
        console.warn("the profile not existing");
        return;
      }
      const { details, video_url } = profile;
      ui.$dialog_content.setPoints(
        details.points.map((v) => {
          return {
            time: v.time,
            time_text: v.time_text,
            text: v.workout_action_name,
          };
        })
      );
      ui.$dialog_content.play(video_url);
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $profile: WorkoutPlanViewModel({ client: props.client }),
    $btn_start_plan: new ButtonCore({
      async onClick() {
        methods.startWorkoutDay();
      },
    }),
    $btn_start_workout: new ButtonCore({
      onClick() {
        methods.startWorkoutDay();
      },
    }),
    $muscle: HumanBodyViewModel({ highlighted: [] }),
    $select_student: StudentSelect2ViewModel({
      defaultValue: [],
      list: request.student.list,
    }),
    $btn_confirm_students: new ButtonCore({
      onClick() {
        const selected = ui.$select_student.value;
        const cur_student_ids = _students.map((v) => v.id);
        for (let i = 0; i < selected.length; i += 1) {
          const vv = selected[i];
          if (!cur_student_ids.includes(vv.id)) {
            _students.push({
              id: vv.id,
              nickname: vv.nickname,
              avatar_url: vv.avatar_url,
            });
          }
        }
        ui.$select_student.ui.$dialog.hide();
        methods.refresh();
      },
    }),
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "选择参与人",
          onClick() {
            ui.$select_student.init();
            ui.$select_student.ui.$dialog.show();
            const vv = ui.$select_student.methods
              .mapListWithId(
                _students.map((v) => {
                  return v.id;
                })
              )
              .filter(Boolean);
            ui.$select_student.setValue(vv);
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "编辑",
          hidden: true,
          onClick() {
            ui.$menu.hide();
            props.history.push("root.workout_plan_update", {
              id: props.view.query.id,
            });
          },
        }),
      ],
    }),
    $workout_action: WorkoutActionProfileViewModel({ ignore_history: true, app: props.app, client: props.client }),
    $dialog_buy_guide: new DialogCore({}),
    $btn_goto_subscription: new ButtonCore({
      onClick() {
        ui.$dialog_buy_guide.hide();
        props.history.push("root.subscription_plan_profile");
      },
    }),
    $dialog_content: VideoWithPointsModel({ app: props.app, points: [] }),
  };
  let _students: { id: number; nickname: string; avatar_url?: string }[] = [
    {
      id: 0,
      nickname: "我",
    },
  ];
  let _state = {
    get loading() {
      return ui.$profile.state.loading;
    },
    get error() {
      return ui.$profile.state.error;
    },
    get profile() {
      return ui.$profile.state.profile;
    },
    get selected_students() {
      return _students;
    },
    get students() {
      return ui.$select_student.state.list;
    },
    get contents() {
      return request.content_of_workout_plan.list.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.content_of_workout_plan.list.onStateChange(() => methods.refresh());
  ui.$profile.onStateChange(() => methods.refresh());
  ui.$profile.onError(() => methods.refresh());
  ui.$select_student.onStateChange(() => methods.refresh());
  const unlisten = props.history.onRouteChange((v) => {
    if ((v.name as PageKeys) === "root.workout_plan_profile") {
      if (v.reason === "back" && v.data?.update) {
        methods.ready();
      }
    }
  });

  return {
    state: _state,
    request,
    methods,
    ui,
    async ready() {
      methods.ready();
    },
    destroy() {
      bus.destroy();
      unlisten();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export function HomeWorkoutPlanProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanProfilePageViewModel, [props]);

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
            <div class="flex items-center gap-2 w-full">
              <Button class="relative w-full" store={vm.ui.$btn_start_workout}>
                {/* <Show when={state().selected_students.length > 1}>
                <div class="absolute top-1/2 -translate-y-1/2" style={{ left: "16%" }}>
                  <MultipleAvatar value={state().selected_students} />
                </div>
              </Show> */}
                开始训练
              </Button>
              <div
                class="p-2 rounded-full bg-w-bg-5"
                onClick={(e) => {
                  const { x, y } = e.currentTarget.getBoundingClientRect();
                  vm.ui.$menu.toggle({ x, y });
                }}
              >
                <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
              </div>
            </div>
          }
        >
          <Show when={state().loading}>
            <div class="loading flex justify-center items-center p-4">
              <LoaderCircle class="w-8 h-8 text-w-fg-1 animate-spin" />
            </div>
          </Show>
          <Show when={state().profile}>
            <div class="relative content space-y-2">
              <div class="header p-4 rounded-lg">
                <div class="text-2xl font-bold text-w-fg-0">{state().profile!.title}</div>
                <div class="text-w-fg-0">{state().profile!.overview}</div>
                <div class="flex items-center justify-between mt-2">
                  <div class="duration flex items-center gap-1">
                    <Clock class="w-4 h-4 text-w-fg-1" />
                    <div class="text-sm text-w-fg-1">预计耗时{state().profile!.estimated_duration_text}</div>
                  </div>
                  <div class="text-w-fg-1 text-[12px]">{state().profile!.created_at}创建</div>
                </div>
                <div class="flex items-center gap-2 mt-4">
                  <Show
                    when={state().profile!.creator.avatar_url}
                    fallback={<div class="w-[24px] h-[24px] rounded-full bg-w-bg-5"></div>}
                  >
                    <div
                      class="w-[24px] h-[24px] rounded-full"
                      style={{
                        "background-image": `url('${state().profile!.creator.avatar_url}')`,
                        "background-size": "cover",
                        "background-position": "center",
                      }}
                    ></div>
                  </Show>
                  <div class="text-sm text-w-fg-0">{state().profile!.creator.nickname}</div>
                </div>
                <Show when={state().profile!.suggestions}>
                  <div class="mt-4 flex items-start gap-2">
                    <div class="bg-w-bg-5 rounded-lg p-3 text-sm text-w-fg-0 relative">
                      <div class="absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-b-[8px] border-b-w-bg-5 border-r-[6px] border-r-transparent"></div>
                      {state().profile!.suggestions}
                    </div>
                  </div>
                </Show>
                <Show when={state().profile!.tags.length}>
                  <div class="tags flex flex-wrap gap-2 mt-4">
                    <For each={state().profile!.tags}>
                      {(tag) => {
                        return <div class="px-2 rounded-full border-2 border-w-fg-3 text-sm text-gray-400">{tag}</div>;
                      }}
                    </For>
                  </div>
                </Show>
              </div>
              <div class="steps border-2 border-w-fg-3 rounded-lg">
                <div class="p-4 border-b-2 border-w-fg-3">
                  <div class="text-w-fg-0">训练内容</div>
                </div>
                <div class="p-4 space-y-2">
                  <For each={state().profile!.steps}>
                    {(step, index) => (
                      <div class="rounded-xl">
                        <div class="relative">
                          {/* <div class="absolute left-1 -top-2 text-sm">{WorkoutSetTypeTextMap[step.set_type] || ""}</div> */}
                          <Switch>
                            <Match when={[WorkoutPlanSetType.Normal].includes(step.set_type)}>
                              <div class="flex items-center gap-3 p-2 border border-w-fg-3 rounded-md">
                                <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                  {index() + 1}
                                </div>
                                <div class="flex-1">
                                  <For each={step.actions}>
                                    {(action) => (
                                      <div
                                        class="flex items-center gap-2 text-sm"
                                        onClick={() => {
                                          vm.methods.handleClickWorkoutAction(action.action);
                                        }}
                                      >
                                        <span class="text-w-fg-0">{action.action.zh_name}</span>
                                        <span class="flex items-end text-blue-400 font-medium">
                                          <Show
                                            when={action.reps.unit !== getSetValueUnit("ToFail")}
                                            fallback="做到力竭"
                                          >
                                            <div>{action.reps.num}</div>
                                            <div class="text-sm">{action.reps.unit}</div>
                                          </Show>
                                        </span>
                                      </div>
                                    )}
                                  </For>
                                </div>
                                <div class="flex items-end text-sm text-w-fg-1">
                                  <div>x{step.set_count}</div>
                                  <div class="text-sm">组</div>
                                </div>
                              </div>
                            </Match>
                            <Match when={[WorkoutPlanSetType.Super].includes(step.set_type)}>
                              <div class="flex items-center gap-3 p-2 border border-w-fg-3 rounded-md">
                                <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                  {index() + 1}
                                </div>
                                <div class="flex-1">
                                  <For each={step.actions}>
                                    {(action) => (
                                      <div
                                        class="flex items-center gap-2 text-sm"
                                        onClick={() => {
                                          vm.methods.handleClickWorkoutAction(action.action);
                                        }}
                                      >
                                        <div class="text-w-fg-0">{action.action.zh_name}</div>
                                        <div class="flex items-end text-blue-400 font-medium">
                                          <Show
                                            when={action.reps.unit !== getSetValueUnit("ToFail")}
                                            fallback="做到力竭"
                                          >
                                            <div>{action.reps.num}</div>
                                            <div class="text-sm">{action.reps.unit}</div>
                                          </Show>
                                        </div>
                                      </div>
                                    )}
                                  </For>
                                </div>
                                <div class="flex items-center text-sm text-w-fg-1">
                                  <div>x{step.set_count}</div>
                                  <div class="text-sm">组</div>
                                </div>
                              </div>
                            </Match>
                            <Match when={[WorkoutPlanSetType.HIIT].includes(step.set_type)}>
                              <div class="flex items-center gap-3 p-2 border border-w-fg-3 rounded-md">
                                <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                  {index() + 1}
                                </div>
                                <div class="flex-1">
                                  <For each={step.actions}>
                                    {(action) => (
                                      <div
                                        class="flex items-center gap-2 text-sm"
                                        onClick={() => {
                                          vm.methods.handleClickWorkoutAction(action.action);
                                        }}
                                      >
                                        <div class="text-w-fg-0">{action.action.zh_name}</div>
                                        <div class="flex items-center text-blue-400 font-medium">
                                          <Show
                                            when={action.reps.unit !== getSetValueUnit("ToFail")}
                                            fallback="做到力竭"
                                          >
                                            <div>{action.reps.num}</div>
                                            <div class="text-sm">{action.reps.unit}</div>
                                          </Show>
                                        </div>
                                      </div>
                                    )}
                                  </For>
                                </div>
                                <div class="flex items-center text-sm text-w-fg-1">
                                  <div>x{step.set_count}</div>
                                  <div class="text-sm">组</div>
                                </div>
                              </div>
                            </Match>
                            <Match
                              when={[WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(
                                step.set_type
                              )}
                            >
                              <div class="flex items-center gap-3 p-2 border border-w-fg-3 rounded-md">
                                <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                  {index() + 1}
                                </div>
                                <div class="flex-1">
                                  <div
                                    class="text-sm"
                                    onClick={() => {
                                      vm.methods.handleClickWorkoutAction(step.actions[0].action);
                                    }}
                                  >
                                    <div class="text-w-fg-0">{step.actions[0].action.zh_name}</div>
                                  </div>
                                  <div class="flex gap-2">
                                    <For each={step.actions}>
                                      {(action) => (
                                        <div class="flex items-center gap-2 text-sm">
                                          <div class="flex items-center text-blue-400 font-medium">
                                            <Show
                                              when={action.reps.unit !== getSetValueUnit("ToFail")}
                                              fallback="做到力竭"
                                            >
                                              <div>{action.reps.num}</div>
                                              <div class="text-sm">{action.reps.unit}</div>
                                            </Show>
                                          </div>
                                        </div>
                                      )}
                                    </For>
                                  </div>
                                </div>
                                <div class="flex items-center text-sm text-w-fg-1">
                                  <div>x{step.set_count}</div>
                                  <div class="text-sm">组</div>
                                </div>
                              </div>
                            </Match>
                          </Switch>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
              <Show when={state().contents.dataSource.length}>
                <div class="students rounded-lg border-2 border-w-fg-3">
                  <div class="p-4 border-b-2 border-w-fg-3">
                    <div class="text-w-fg-0">视频参考</div>
                  </div>
                  <div class="p-4 space-y-2">
                    <For each={state().contents.dataSource}>
                      {(v) => {
                        return (
                          <div
                            class="border border-w-fg-3 rounded-lg p-2"
                            onClick={() => {
                              vm.methods.handleClickContentOfWorkoutPlan(v);
                            }}
                          >
                            <div class="text-lg text-w-fg-0 truncate">{v.title}</div>
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
                              <div class="text-sm text-w-fg-1">{v.creator.nickname}</div>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Show>
              <Show when={state().selected_students.length}>
                <div class="students rounded-lg border-2 border-w-fg-3">
                  <div class="p-4 border-b-2 border-w-fg-3">
                    <div class="text-w-fg-0">参与人</div>
                  </div>
                  <div class="p-4 flex flex-wrap gap-4">
                    <For each={state().selected_students}>
                      {(v) => {
                        return (
                          <div class="relative">
                            <div
                              class="absolute right-0 top-0 p-1 border-2 border-w-fg-3 rounded-full bg-w-bg-5 translate-x-2 -translate-y-2"
                              onClick={() => {
                                vm.methods.removeStudent({
                                  id: Number(v.id),
                                });
                              }}
                            >
                              <X class="w-2.5 h-2.5 text-w-fg-0" />
                            </div>
                            <Avatar nickname={v.nickname} avatar_url={v.avatar_url} />
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Show>
              <div class="muscle rounded-lg border-2 border-w-fg-3">
                <div class="p-4 border-b border-w-fg-3">
                  <div class="text-w-fg-0">锻炼肌肉</div>
                </div>
                <div class="p-4">
                  <BodyMusclePreview store={vm.ui.$muscle} />
                </div>
              </div>
              <div class="equipment rounded-lg border-2 border-w-fg-3">
                <div class="p-4 border-b-2 border-w-fg-3">
                  <div class="text-w-fg-0">所需器械</div>
                </div>
                <div class="p-4">
                  <For each={state().profile!.equipments}>
                    {(equipment) => {
                      return <div class="text-w-fg-0">{equipment.zh_name}</div>;
                    }}
                  </For>
                </div>
              </div>
            </div>
          </Show>
        </PageView>
      </Show>
      <Sheet store={vm.ui.$select_student.ui.$dialog} app={props.app}>
        <div class="p-2">
          <ListView store={vm.ui.$select_student.request.data.list} class="space-y-2">
            <For each={state().students}>
              {(s) => {
                return (
                  <div
                    classList={{
                      "p-2 border-2 border-w-fg-3 rounded-lg": true,
                      "border-w-fg-2 bg-w-bg-5": s.selected,
                    }}
                    onClick={() => {
                      vm.ui.$select_student.select(s);
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <Show when={s.avatar_url} fallback={<div class="w-[32px] h-[32px] rounded-full bg-w-bg-5"></div>}>
                        <div
                          class="w-[32px] h-[32px] rounded-full"
                          style={{
                            "background-image": `url('${s.avatar_url}')`,
                            "background-size": "cover",
                            "background-position": "center",
                          }}
                        ></div>
                      </Show>
                      <div class="text-sm text-w-fg-0">{s.nickname}</div>
                    </div>
                  </div>
                );
              }}
            </For>
          </ListView>
          <Button class="w-full" store={vm.ui.$btn_confirm_students}>
            选择
          </Button>
        </div>
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$workout_action.ui.$dialog} app={props.app}>
        <WorkoutActionProfileView store={vm.ui.$workout_action} />
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$dialog_content.ui.$dialog_outer} app={props.app}>
        <WorkoutPlanVideoPlayView store={vm.ui.$dialog_content} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_buy_guide} app={props.app}>
        <div class="p-4">
          <div class="text-center text-w-fg-1">该功能必须订阅后才能使用</div>
          <Button class="mt-4 w-full" store={vm.ui.$btn_goto_subscription}>
            前往购买
          </Button>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
