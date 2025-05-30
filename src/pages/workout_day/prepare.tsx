import { For, Show } from "solid-js";
import { Check, ChevronLeft, Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ListView, ScrollView } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import { fetchStudentList, fetchStudentListProcess } from "@/biz/student/services";
import { StudentSelectViewModel } from "@/biz/student_select";
import {
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
  fetchWorkoutPlanProfile,
  fetchWorkoutPlanProfileProcess,
} from "@/biz/workout_plan/services";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";

function WorkoutDayPreparingViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, {
          process: fetchWorkoutPlanListProcess,
          client: props.client,
        })
      ),
    },
    workout_action: {
      list_by_id: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
    },
    workout_day: {},
    student: {
      list: new ListCore(
        new RequestCore(fetchStudentList, { process: fetchStudentListProcess, client: props.client }),
        {
          extraDataSource: [
            {
              id: 0,
              nickname: "我",
            },
          ],
        }
      ),
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
    $view: new ScrollViewCore(),
    $dialog_student_select: new DialogCore({}),
    $dialog_workout_plan_select: new DialogCore({}),
    $input_student_select: StudentSelectViewModel({
      defaultValue: [],
      list: request.student.list,
      client: props.client,
    }),
    $btn_confirm_student: new ButtonCore({
      onClick() {
        const vv = ui.$input_student_select.value;
        if (vv.length === 0) {
          props.app.tip({
            text: ["请选择参与者"],
          });
          return;
        }
        _selected_students = vv;
        ui.$dialog_student_select.hide();
        methods.refresh();
      },
    }),
    $input_workout_plan_select: WorkoutPlanSelectViewModel({
      defaultValue: [],
      multiple: false,
      list: request.workout_plan.list,
      client: props.client,
    }),
    $btn_confirm_workout_plan: new ButtonCore({
      onClick() {
        const vv = ui.$input_workout_plan_select.value;
        if (vv.length === 0) {
          props.app.tip({
            text: ["请选择计划"],
          });
          return;
        }
        _selected_workout_plans = vv;
        ui.$dialog_workout_plan_select.hide();
        methods.refresh();
      },
    }),
  };

  let _body_parts = [
    {
      value: "手臂",
      label: "手臂",
    },
    {
      value: "肩",
      label: "肩",
    },
    {
      value: "胸",
      label: "胸",
    },
    {
      value: "背",
      label: "背",
    },
    {
      value: "臀",
      label: "臀",
    },
    {
      value: "下肢",
      label: "下肢",
    },
    {
      value: "核心",
      label: "核心",
    },
    {
      value: "心肺",
      label: "心肺",
    },
  ];
  let _selected_parts: string[] = [];
  let _selected_students: { id: string | number; nickname: string }[] = [];
  let _selected_workout_plans: { id: string | number; title: string }[] = [];
  let _state = {
    get body_parts() {
      return _body_parts.map((p) => {
        return {
          value: p.value,
          label: p.label,
          selected: _selected_parts.includes(p.value),
        };
      });
    },
    get selected_students() {
      return _selected_students;
    },
    get student_response() {
      return ui.$input_student_select.state.list;
    },
    get selected_workout_plans() {
      return _selected_workout_plans;
    },
    get workout_plan_response() {
      return ui.$input_workout_plan_select.state.list;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$input_student_select.onStateChange(() => methods.refresh());
  ui.$input_workout_plan_select.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    async ready() {
      request.student.list.init();
      request.workout_plan.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayPreparingPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayPreparingViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div class="p-4">
          <div class="space-y-8">
            <div class="field">
              <div>参与者</div>
              <div class="mt-2">
                <div class="flex items-center gap-2">
                  <For each={state().selected_students}>
                    {(student) => {
                      return (
                        <div class="p-2 rounded-full bg-w-bg-5 text-center">
                          <div class="w-6 h-6">{student.nickname}</div>
                        </div>
                      );
                    }}
                  </For>
                  <div
                    class="p-2 rounded-full bg-w-bg-5"
                    onClick={() => {
                      vm.ui.$dialog_student_select.show();
                    }}
                  >
                    <Plus class="w-6 h-6 text-w-fg-1" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div>训练计划</div>
              <div class="mt-2">
                <Show
                  when={state().selected_workout_plans.length}
                  fallback={
                    <div
                      class="flex items-center justify-center py-4 rounded-md bg-w-bg-5"
                      onClick={() => {
                        vm.ui.$dialog_workout_plan_select.show();
                      }}
                    >
                      <Plus class="w-6 h-6 text-w-fg-1" />
                    </div>
                  }
                >
                  <div
                    class="p-4 border-2 border-w-bg-5 rounded-lg"
                    onClick={() => {
                      vm.ui.$dialog_workout_plan_select.show();
                    }}
                  >
                    <div class="">
                      <div class="text-w-fg-1">{state().selected_workout_plans[0].title}</div>
                      <div class="flex flex-wrap gap-2 mt-4">
                        <div class="px-2 py-1 rounded-lg border border-2 border-w-bg-5 text-sm text-w-fg-1">背部</div>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
        <div class="fixed bottom-0 w-full p-2 bg-w-bg-2">
          <div class="flex items-center gap-2">
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.back();
              }}
            >
              <ChevronLeft class="w-6 h-6 text-w-fg-1" />
            </div>
            <div class="w-full py-2 rounded-md bg-w-bg-5">
              <div class="text-white text-center">下一步</div>
            </div>
          </div>
          <div class="safe-height"></div>
        </div>
      </ScrollView>
      <Sheet class="" store={vm.ui.$dialog_student_select}>
        <div class="w-screen p-2 bg-w-bg-2">
          <ListView store={vm.request.student.list}>
            <For each={state().student_response}>
              {(student) => {
                return (
                  <div
                    classList={{
                      "flex items-center justify-between p-4": true,
                    }}
                    onClick={() => {
                      vm.ui.$input_student_select.methods.select(student);
                    }}
                  >
                    <div>{student.nickname}</div>
                    <Show when={student.selected}>
                      <Check class="w-4 h-4 text-gray-500" />
                    </Show>
                  </div>
                );
              }}
            </For>
          </ListView>
          <div class="mt-2">
            <Button class="w-full" store={vm.ui.$btn_confirm_student}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet class="" store={vm.ui.$dialog_workout_plan_select}>
        <div class="w-screen bg-w-bg-2 max-h-screen">
          <div class="p-2 ">
            <ListView store={vm.request.workout_plan.list} class="space-y-2">
              <For each={state().workout_plan_response}>
                {(vv) => {
                  return (
                    <div
                      classList={{
                        "flex items-center justify-between p-4 rounded-md bg-w-bg-5": true,
                      }}
                      onClick={() => {
                        vm.ui.$input_workout_plan_select.methods.select(vv);
                      }}
                    >
                      <div class="text-sm text-w-fg-1">{vv.title}</div>
                      <Show when={vv.selected}>
                        <div class="">
                          <Check class="w-4 h-4 text-w-fg-1" />
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </ListView>
          </div>
          <div class="p-2">
            <Button class="w-full" store={vm.ui.$btn_confirm_workout_plan}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
