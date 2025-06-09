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
import { PageView } from "@/components/page-view";

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
      <PageView store={vm}>
        <div class="p-2 rounded-lg text-w-fg-0 text-sm text-center">输入动作常用重量和次数</div>
        <div class="">
          <div class="space-y-2">
            <div class="field">
              <div class="text-sm text-w-fg-0">重量(单位kg)</div>
              <Input store={vm.ui.$input_weight} />
            </div>
            <div class="field">
              <div class="text-sm text-w-fg-0">次数</div>
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
                      class="p-4 border-2 border-w-fg-3 rounded-lg text-center text-w-fg-0"
                      onClick={() => {
                        vm.methods.showDialogWithText(v.text);
                      }}
                    >
                      <div class="text-2xl">{v.v}</div>
                      <div>kg</div>
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
      </PageView>
      <Sheet store={vm.ui.$dialog_rm_calc_rule} app={props.app}>
        <div class="min-h-[80px] p-2">
          <div>{state().text}</div>
        </div>
      </Sheet>
    </>
  );
}
