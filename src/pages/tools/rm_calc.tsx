/**
 * @file RM 换算
 */
import { For } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { toFixed } from "@/utils";

export function RMCalcViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    showDialogWithText(text: string) {
      _text = text;
      ui.$dialog_rm_calc_rule.show();
      methods.refresh();
    },
    showDialogWithRMRule() {
      methods.showDialogWithText("");
    },
    showDialogOfRMStep() {
      ui.$dialog_rm_step.show();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $input_weight: new InputCore({ defaultValue: 80 }),
    $input_reps: new InputCore({ defaultValue: 12 }),
    $btn_submit: new ButtonCore({
      onClick() {
        const weight = Number(ui.$input_weight.value);
        const reps = Number(ui.$input_reps.value);
        if (Number.isNaN(weight)) {
          props.app.tip({
            text: ["请输入合法重量值"],
          });
          return;
        }
        if (Number.isNaN(reps)) {
          props.app.tip({
            text: ["请输入合法次数值"],
          });
          return;
        }
        if (!weight) {
          props.app.tip({
            text: ["请输入重量"],
          });
          return;
        }
        if (!reps) {
          props.app.tip({
            text: ["请输入次数"],
          });
          return;
        }
        const v1 = toFixed(weight / (1.0278 - 0.0278 * reps));
        const v2 = toFixed(0.033 * weight * reps + weight);
        const v3 = toFixed((100 * weight) / (101.3 - 2.67123 * reps));
        const t1 = "重量 / (1.0278 - 0.0278 * 次数)";
        const t2 = "(0.033 * 重量 * 次数) + 重量";
        const t3 = "(100 * 重量) / (101.3 - 2.67123 * 次数)";
        _values = [
          {
            v: v1,
            text: t1,
          },
          {
            v: v2,
            text: t2,
          },
          {
            v: v3,
            text: t3,
          },
        ];
        methods.refresh();
      },
    }),
    $dialog_rm_calc_rule: new DialogCore({}),
    $dialog_rm_step: new DialogCore({}),
  };
  let _values: {
    v: number;
    text: string;
  }[] = [];
  let _text = "";
  let _state = {
    get values() {
      return _values;
    },
    get text() {
      return _text;
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

export function RMCalcToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(RMCalcViewModel, [props]);

  return (
    <>
      <div class="z-0 fixed top-0 left-0 w-full">
        <NavigationBar1
          title="RM换算"
          history={props.history}
          extra={
            <div
              onClick={() => {
                vm.methods.showDialogOfRMStep();
              }}
            >
              <MoreHorizontal class="w-6 h-6" />
            </div>
          }
        />
      </div>
      <div class="absolute top-[74px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view}>
          <div class="p-4">
            <div class="space-y-2">
              <div>
                <div>重量(单位KG)</div>
                <Input store={vm.ui.$input_weight} />
              </div>
              <div>
                <div>次数</div>
                <Input store={vm.ui.$input_reps} />
              </div>
              <div>
                <Button class="w-full" store={vm.ui.$btn_submit}>
                  计算
                </Button>
              </div>
            </div>
            <div class="mt-8">
              <div class="flex items-center justify-between">
                <For each={state().values}>
                  {(v) => {
                    return (
                      <div
                        class="p-4 border rounded-md text-center"
                        onClick={() => {
                          vm.methods.showDialogWithText(v.text);
                        }}
                      >
                        <div class="text-2xl">{v.v}</div>
                        <div>KG</div>
                        {/* <div class="flex justify-center mt-4">
                          <Info class="w-4 h-4 text-gray-600" />
                        </div> */}
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </ScrollView>
      </div>
      <Sheet store={vm.ui.$dialog_rm_calc_rule}>
        <div class="w-screen min-h-[80px] p-4 bg-white">
          <div>{state().text}</div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_rm_step}>
        <div class="w-screen min-h-[80px] p-4 bg-white text-gray-800">
          <div class="text-xl">最大重量（1RM）测试方案</div>
          <div class="mt-2">
            <div>以预期 1RM 重量的 50% 的重量做 10 次</div>
            <div>休息 30s</div>
            <div>以预期 1RM 重量的 75% 的重量做 5 次</div>
            <div>休息 3-5min</div>
            <div>以预期 1RM 重量的 90%-95% 的重量做 1 次</div>
            <div>休息 3-5min</div>
            <div>尝试 1RM 重量</div>
            <div>休息 3-5min</div>
            <div>如果尝试成功，增加重量并尝试新的 1RM 重量</div>
            <div>重复「尝试成功-增加重量」，直到失败为止</div>
            <div>成功的最大重量，即为 1RM 重量</div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
