import { Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { createStudent } from "@/biz/student/services";

import { MemberValuesViewModel } from "./model";
import { MemberBasicValues } from "./components/basic-values";
import { ChevronLeft, Search, Send } from "lucide-solid";
import { Sheet } from "@/components/ui/sheet";
import { DragSelectView } from "@/components/drag-select";

export function MemberCreateViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      create: new RequestCore(createStudent, { client: props.client }),
    },
  };
  const methods = {
    back() {
      props.history.back();
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
      const values = {
        name: basic_r.data.name,
        age: basic_r.data.age,
        gender: basic_r.data.gender,
        // height: basic_r.data.height,
        // weight: basic_r.data.weight,
      };
      if (!values.name) {
        props.app.tip({
          text: ["请输入姓名"],
        });
        return;
      }
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
    $view: new ScrollViewCore({ disabled: true }),
    $values_basic: vm.ui.$basic_values,
    $dialog_test: new DialogCore(),
  };
  const steps = [
    {
      title: "基本信息",
    },
  ];
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
  }
  type TheTypesOfEvents = {
    [Events.StepChange]: number;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    ui,
    methods,
    state: _state,
    ready() {},
    onStepChange(handler: Handler<TheTypesOfEvents[Events.StepChange]>) {
      return bus.on(Events.StepChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeStudentCreatePage(props: ViewComponentProps) {
  let $content: HTMLDivElement | undefined;

  const [state, vm] = useViewModel(MemberCreateViewModel, [props]);

  vm.onStepChange((step) => {
    if (!$content) {
      return;
    }
    $content.style.transform = `translate(-${step * 100}%)`;
  });

  return (
    <>
      <div class="z-0 fixed top-0 left-0 w-full">
        <div class="flex items-center gap-2 p-4 border-b">
          <div
            class="flex items-center justify-center p-2 rounded-full bg-gray-200"
            onClick={() => {
              vm.methods.back();
            }}
          >
            <ChevronLeft class="w-6 h-6 text-gray-800" />
          </div>
          <div>新增学员</div>
          <div
            class="flex items-center justify-center p-2 rounded-full bg-gray-200"
            onClick={() => {
              vm.ui.$dialog_test.show();
            }}
          >
            <Search class="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </div>
      <div class="absolute top-[74px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view} class="scroll-view w-full h-full overflow-y-auto bg-white">
          <div class="">
            <div class="panel p-4 relative flex-shrink-0">
              <div
                onClick={() => {
                  //
                }}
              >
                <MemberBasicValues store={vm.ui.$values_basic} />
              </div>
            </div>
            <div class="fixed bottom-0 left-0 w-full pb-8">
              <div class="relative flex items-center justify-center py-4">
                <div
                  class="p-4 rounded-full bg-gray-200"
                  onClick={() => {
                    vm.methods.submit();
                  }}
                >
                  <Send class="w-8 h-8 text-gray-800" />
                </div>
              </div>
              <Show when={state().can_submit}>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div class="whitespace-nowrap text-sm text-gray-300">提交后仍可编辑所有信息</div>
                </div>
              </Show>
              <div class="safe-height"></div>
            </div>
          </div>
        </ScrollView>
      </div>
    </>
  );
}
