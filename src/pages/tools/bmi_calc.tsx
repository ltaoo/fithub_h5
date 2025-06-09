/**
 * @file BMI计算
 */
import { For, Match, Show, Switch } from "solid-js";
import { Frown, Info, Meh, Smile } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { PageView } from "@/components/page-view";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { Result } from "@/domains/result";
import { toFixed } from "@/utils";

export function BMICalcViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    calcBMI() {
      const weight = Number(ui.$input_weight.value);
      const height = Number(ui.$input_height.value);
      if (Number.isNaN(weight)) {
        return Result.Err("请输入合法体重值");
      }
      if (Number.isNaN(height)) {
        return Result.Err("请输入合法身高值");
      }
      if (!weight) {
        return Result.Err("请输入体重");
      }
      if (!height) {
        return Result.Err("请输入身高");
      }
      const bmi = toFixed(weight / Math.pow(height / 100, 2), 1);

      const range = _ranges.find((r) => {
        return bmi >= r.value[0] && bmi < r.value[1];
      });
      if (!range) {
        return Result.Err("BMI超出范围");
      }
      range.cur = bmi;
      return Result.Ok(range);
    },
    showDialogWithSpecialRule(idx: number) {
      _idx = idx;
      ui.$dialog_bmi_rule.show();
      methods.refresh();
    },
    showDialogBMIRule() {
      ui.$dialog_bmi_rule.show();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $input_weight: new InputCore({ defaultValue: 60 }),
    $input_height: new InputCore({ defaultValue: 170 }),
    $btn_submit: new ButtonCore({
      async onClick() {
        const r = await methods.calcBMI();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _cur_range = r.data;
        methods.refresh();
      },
    }),
    $dialog_bmi_rule: new DialogCore({}),
  };
  let _ranges = [
    {
      value: [Number.NEGATIVE_INFINITY, 18.5],
      value_text: "<18.5",
      text: "体重过轻",
      icon: "frown",
      cur: 0,
    },
    {
      value: [18.5, 25],
      value_text: "18.5~25",
      text: "正常",
      icon: "smile",
      cur: 0,
    },
    {
      value: [25, 30],
      value_text: "25~30",
      text: "超重",
      icon: "meh",
      cur: 0,
    },
    {
      value: [30, Number.POSITIVE_INFINITY],
      value_text: ">=30",
      text: "肥胖",
      icon: "frown",
      cur: 0,
    },
  ];
  let _cur_range: (typeof _ranges)[number] | null = null;
  let _idx = 0;
  let _text = "";
  let _state = {
    get range() {
      return _cur_range;
    },
    get text() {
      return _text;
    },
    get ranges() {
      return _ranges;
    },
    get idx() {
      return _idx;
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

export function BMICalcToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(BMICalcViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center justify-between">
            <div></div>
            <div
              class="p-2 rounded-full"
              onClick={() => {
                vm.methods.showDialogBMIRule();
              }}
            >
              <Info class="w-6 h-6 text-w-fg-1" />
            </div>
          </div>
        }
      >
        <div class="space-y-2">
          <div class="field">
            <div class="text-sm text-w-fg-0">体重(单位kg)</div>
            <Input store={vm.ui.$input_weight} />
          </div>
          <div class="field">
            <div class="text-sm text-w-fg-0">身高(单位cm)</div>
            <Input store={vm.ui.$input_height} />
          </div>
        </div>
        <div class="mt-8">
          <Button class="w-full" store={vm.ui.$btn_submit}>
            计算
          </Button>
        </div>
        <div class="mt-8 pb-12">
          <Show when={state().range}>
            <div class="p-4 border-2 border-w-fg-3 rounded-lg text-center text-w-fg-0">
              <div class="flex justify-center">
                <Switch>
                  <Match when={state().range?.icon === "smile"}>
                    <Smile class="w-12 h-12 text-w-fg-0" />
                  </Match>
                  <Match when={state().range?.icon === "meh"}>
                    <Meh class="w-12 h-12 text-w-fg-0" />
                  </Match>
                  <Match when={state().range?.icon === "frown"}>
                    <Frown class="w-12 h-12 text-w-fg-0" />
                  </Match>
                </Switch>
              </div>
              <div class="mt-4">
                <div class="text-xl">{state().range?.cur}</div>
                <div class="">{state().range?.text}</div>
              </div>
            </div>
          </Show>
        </div>
      </PageView>
      <Sheet store={vm.ui.$dialog_bmi_rule} app={props.app}>
        <div class="min-h-[80px] p-2">
          <div class="p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0">
            <div>BMI 计算公式为</div>
            <div class="text-sm">体重kg / (身高m * 身高m)</div>
          </div>
          <div class="mt-2 space-y-2">
            <For each={state().ranges}>
              {(range) => {
                return (
                  <div class="p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0">
                    <div class="">{range.text}</div>
                    <div class="text-sm">{range.value_text}</div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </Sheet>
    </>
  );
}
