import { Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { createStudent } from "@/biz/student/services";

import { MemberDietValues } from "./components/diet-values";
import { MemberExerciseValues } from "./components/exercise-values";
import { MemberGoalValues } from "./components/goals-values";
import { MemberRiskValues } from "./components/risk-values";
import { MemberValuesViewModel } from "./model";

function StudentQuestionnaireViewModel(props: ViewComponentProps) {
  const steps = [
    {
      title: "经验与偏好",
    },
    {
      title: "目标",
    },
    {
      title: "风险筛查",
    },
    {
      title: "饮食习惯",
    },
    // {
    //   title: "训练计划",
    // },
  ];
  const request = {
    student: {
      create: new RequestCore(createStudent, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    title() {
      return steps[_cur_step].title;
    },
    nextStep() {
      _cur_step += 1;
      if (_cur_step >= steps.length) {
        methods.submit();
        return;
      }
      bus.emit(Events.StepChange, _cur_step);
      bus.emit(Events.StateChange, { ..._state });
    },
    prevStep() {
      _cur_step -= 1;
      if (_cur_step < 0) {
        return;
      }
      bus.emit(Events.StepChange, _cur_step);
      bus.emit(Events.StateChange, { ..._state });
    },
    async submit() {
      const basic_r = await vm.ui.$basic_values.validate();
      if (basic_r.error) {
        return;
      }
      const fitness_r = await vm.ui.$fitness_values.validate();
      if (fitness_r.error) {
        return;
      }
      const goal_r = await vm.ui.$goal_values.validate();
      if (goal_r.error) {
        return;
      }
      const risk_r = await vm.ui.$risk_values.validate();
      if (risk_r.error) {
        return;
      }
      const diet_r = await vm.ui.$diet_values.validate();
      if (diet_r.error) {
        return;
      }
      const values = {
        name: basic_r.data.name,
        age: basic_r.data.age,
        gender: basic_r.data.gender,
        // height: basic_r.data.height,
        // weight: basic_r.data.weight,
        fitness: fitness_r.data,
        goal: goal_r.data,
        risk: risk_r.data,
        diet: diet_r.data,
      };
      console.log(values);
      const r = await request.student.create.run({
        name: values.name,
        age: Number(values.age),
        gender: Number(values.gender),
      });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["创建成功"],
      });
    },
  };
  const vm = MemberValuesViewModel();
  const ui = {
    $view: new ScrollViewCore({}),
    $values_fitness: vm.ui.$fitness_values,
    $values_goal: vm.ui.$goal_values,
    $values_risk: vm.ui.$risk_values,
    $values_diet: vm.ui.$diet_values,
  };
  let _cur_step = 0;
  let _state = {
    get cur_step() {
      return _cur_step;
    },
    get prev_step_enabled() {
      return _cur_step > 0;
    },
    get next_step_enabled() {
      return _cur_step < steps.length - 1;
    },
    get can_submit() {
      return _cur_step === steps.length - 1;
    },
  };
  enum Events {
    StepChange,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StepChange]: number;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function StudentQuestionnaireView(props: ViewComponentProps) {
  let $content: HTMLDivElement | undefined;

  const [state, vm] = useViewModel(StudentQuestionnaireViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view}>
      <div class="overflow-hidden">
        <div ref={$content} class="flex h-full transition-transform duration-500 ease-in-out">
          <div class="flex">
            <div class="panel w-screen h-screen p-4 relative flex-shrink-0">
              <div class="text-2xl font-bold">训练目标</div>
              <div class="mt-4">
                <MemberGoalValues store={vm.ui.$values_goal} />
              </div>
            </div>
            <div class="panel w-screen h-screen p-4 relative flex-shrink-0">
              <div class="text-2xl font-bold">训练经验与偏好</div>
              <div class="mt-4">
                <MemberExerciseValues store={vm.ui.$values_fitness} />
              </div>
            </div>
            <div class="panel w-screen h-screen p-4 relative flex-shrink-0">
              <div class="text-2xl font-bold">风险筛查</div>
              <div class="mt-4">
                <MemberRiskValues store={vm.ui.$values_risk} />
              </div>
            </div>
            <div class="panel w-screen h-screen p-4 relative flex-shrink-0">
              <div class="text-2xl font-bold">饮食习惯</div>
              <div class="mt-4">
                <MemberDietValues store={vm.ui.$values_diet} />
              </div>
            </div>
            <div class="panel w-screen h-screen p-4 relative flex-shrink-0">
              <div class="text-2xl font-bold">训练计划</div>
              <div class="mt-4">{/* <MemberTrainingPlan store={vm.ui.$values_training_plan} /> */}</div>
            </div>
          </div>
        </div>
        <div class="fixed bottom-4 left-1/2 -translate-x-1/2">
          <div class="flex items-center justify-between space-x-4 pb-8">
            <div
              classList={{
                "px-4 py-2 rounded-md bg-gray-200 text-gray-500": true,
                "opacity-50": !state().prev_step_enabled,
              }}
              onClick={() => {
                vm.methods.prevStep();
              }}
            >
              <div>上一步</div>
            </div>
            <div
              class="relative px-4 py-2 rounded-md bg-gray-200 text-gray-500"
              onClick={() => {
                vm.methods.nextStep();
              }}
            >
              <div>{state().can_submit ? "提交" : "下一步"}</div>
              <Show when={state().can_submit}>
                <div class="absolute top-12 left-1/2 -translate-x-1/2">
                  <div class="whitespace-nowrap text-sm text-gray-300">提交后仍可编辑所有信息</div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </ScrollView>
  );
}
