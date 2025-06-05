import { Show } from "solid-js";
import { ChevronLeft, Send } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ScrollView } from "@/components/ui";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { createStudent } from "@/biz/student/services";

import { MemberValuesViewModel } from "./model";
import { MemberBasicValues } from "./components/basic-values";

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
      ui.$btn_submit.setLoading(true);
      const r = await request.student.create.run({
        name: values.name,
        age: Number(values.age),
        gender: Number(values.gender),
      });
      ui.$btn_submit.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["创建成功"],
      });
      props.history.back();
    },
  };
  const vm = MemberValuesViewModel();
  const ui = {
    $view: new ScrollViewCore({ disabled: true }),
    $values_basic: vm.ui.$basic_values,
    $dialog_test: new DialogCore(),
    $btn_submit: new ButtonCore({
      onClick() {
        methods.submit();
      },
    }),
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

  // vm.onStepChange((step) => {
  //   if (!$content) {
  //     return;
  //   }
  //   $content.style.transform = `translate(-${step * 100}%)`;
  // });

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Button class="w-full" store={vm.ui.$btn_submit}>
            创建
          </Button>
        }
      >
        <div class="panel relative flex-shrink-0">
          <div
            onClick={() => {
              //
            }}
          >
            <MemberBasicValues store={vm.ui.$values_basic} />
          </div>
        </div>
      </PageView>
    </>
  );
}
