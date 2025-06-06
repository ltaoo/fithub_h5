/**
 * @file 训练计划详情
 */
import { Show, For, Switch, Match } from "solid-js";
import { BicepsFlexed, ChevronLeft, CircleX, Hourglass, Loader, Loader2, MoreHorizontal, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, ListView, ScrollView } from "@/components/ui";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";
import { Avatar } from "@/components/avatar";
import { MultipleAvatar } from "@/components/avatar/multiple";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
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
import { Sheet } from "@/components/ui/sheet";

function HomeWorkoutPlanProfilePageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        loading: true,
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_day: {
      create: new RequestCore(createWorkoutDay, { client: props.client }),
    },
    muscle: {
      list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
    },
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
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
  };
  const ui = {
    $view: new ScrollViewCore({}),
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
    $select_student: StudentSelectViewModel({
      defaultValue: [],
      list: request.student.list,
    }),
    $btn_confirm_students: new ButtonCore({
      onClick() {
        const selected = ui.$select_student.value;
        const cur_student_ids = _students.map((v) => v.id);
        for (let i = 0; i < selected.length; i += 1) {
          const vv = selected[i];
          if (!cur_student_ids.includes(Number(vv.id))) {
            _students.push({
              id: Number(vv.id),
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
            ui.$select_student.request.data.list.init();
            ui.$select_student.ui.$dialog.show();
            ui.$select_student.setValue(_students);
            ui.$menu.hide();
          },
        }),
      ],
    }),
  };
  let _students: { id: number; nickname: string; avatar_url?: string }[] = [];
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
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$profile.onStateChange(() => methods.refresh());
  ui.$profile.onError(() => methods.refresh());
  ui.$select_student.onStateChange(() => methods.refresh());

  return {
    state: _state,
    request,
    methods,
    ui,
    async ready() {
      const { student_id, student_nickname } = props.view.query;
      if (student_id && student_nickname) {
        _students.push({
          id: Number(student_id),
          nickname: student_nickname,
        });
      }
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        return;
      }
      const r = await ui.$profile.methods.fetch({ id });
      if (r.error) {
        return;
      }
      const muscle_ids = r.data.muscles.map((m) => m.id);
      ui.$muscle.highlight_muscles(map_parts_with_ids(muscle_ids));
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
        <Show when={state().error}>
          <div class="error max-w-[screen] p-4">
            <div class="flex flex-col items-center text-red-500">
              <div>
                <CircleX class="w-12 h-12" />
              </div>
              <div class="mt-2 text-w-fg-0 text-center break-all">{state().error?.message}</div>
            </div>
          </div>
        </Show>
        <Show when={state().loading}>
          <div class="loading flex justify-center items-center p-4">
            <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
          </div>
        </Show>
        <Show when={state().profile}>
          <div class="relative content space-y-2">
            <div class="header p-4 rounded-lg">
              <div class="text-2xl font-bold text-w-fg-0">{state().profile!.title}</div>
              {/* <div>作者</div> */}
              <div>
                <div class="">{state().profile!.overview}</div>
              </div>
              <div class="tags">
                <For each={state().profile!.tags}>{(tag) => <div class="text-sm text-gray-400">{tag}</div>}</For>
              </div>
              <div class="flex mt-2">
                <div class="duration flex items-center gap-2 px-2 border-2 border-w-fg-3 rounded-full">
                  <div class="text-w-fg-1">
                    <Hourglass class="w-3 h-3 text-w-fg-1" />
                  </div>
                  <div class="text-sm text-w-fg-1">{state().profile!.estimated_duration_text}</div>
                </div>
              </div>
              <div>
                <For each={state().profile!.tags}>
                  {(text) => {
                    return <div>{text}</div>;
                  }}
                </For>
              </div>
            </div>
            <div class="steps border-2 border-w-fg-3 rounded-lg">
              <div class="p-4 border-b-2 border-w-fg-3">
                <div class="text-w-fg-0">内容明细</div>
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
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-w-fg-0">{action.action.zh_name}</span>
                                      <span class="flex items-center text-blue-400 font-medium">
                                        <div>{action.reps}</div>
                                        <div class="text-sm">{action.reps_unit}</div>
                                      </span>
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
                          <Match when={[WorkoutPlanSetType.Super].includes(step.set_type)}>
                            <div class="flex items-center gap-3 p-2 border border-w-fg-3 rounded-md">
                              <div class="flex-shrink-0 flex items-center justify-center h-7 text-w-fg-0 font-medium text-sm">
                                {index() + 1}
                              </div>
                              <div class="flex-1">
                                <For each={step.actions}>
                                  {(action) => (
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-gray-200">{action.action.zh_name}</span>
                                      <span class="text-blue-400 font-medium">
                                        {action.reps}
                                        {action.reps_unit}
                                      </span>
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
                                    <div class="flex items-center gap-2 text-sm">
                                      <span class="text-w-fg-0">{action.action.zh_name}</span>
                                      <span class="flex items-center text-blue-400 font-medium">
                                        <div>{action.reps}</div>
                                        <div class="text-sm">{action.reps_unit}</div>
                                      </span>
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
                                <div class="text-sm">
                                  <span class="text-w-fg-0">{step.actions[0].action.zh_name}</span>
                                </div>
                                <div class="flex gap-2">
                                  <For each={step.actions}>
                                    {(action) => (
                                      <div class="flex items-center gap-2 text-sm">
                                        <span class="flex items-center text-blue-400 font-medium">
                                          <div>{action.reps}</div>
                                          <div class="text-sm">{action.reps_unit}</div>
                                        </span>
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
            <Show when={state().selected_students.length}>
              <div class="students rounded-lg border-2 border-w-fg-3">
                <div class="p-4 border-b-2 border-w-fg-3">
                  <div class="text-w-fg-0">参与人</div>
                </div>
                <div class="p-4 flex flex-wrap gap-4">
                  <For each={state().selected_students}>
                    {(student) => {
                      return (
                        <div class="relative">
                          <div
                            class="absolute right-0 top-0 p-2 rounded-full bg-w-bg-5 translate-x-2 -translate-y-2"
                            onClick={() => {
                              vm.methods.removeStudent({
                                id: Number(student.id),
                              });
                            }}
                          >
                            <X class="w-2 h-2 text-w-fg-0" />
                          </div>
                          <Avatar nickname={student.nickname} avatar_url={student.avatar_url} />
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
      <Sheet store={vm.ui.$select_student.ui.$dialog}>
        <div class="w-screen bg-w-bg-1 p-2">
          <ListView store={vm.ui.$select_student.request.data.list} class="space-y-2">
            <For each={state().students}>
              {(s) => {
                return (
                  <div
                    classList={{
                      "p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1": true,
                      "border-w-fg-2 bg-w-bg-5 text-w-fg-0": s.selected,
                    }}
                    onClick={() => {
                      vm.ui.$select_student.methods.select(s);
                    }}
                  >
                    <div>{s.nickname}</div>
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
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
