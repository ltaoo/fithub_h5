/**
 * @file 基础代谢计算
 */
import { For, Show } from "solid-js";
import { CircleHelp } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/select";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { RefCore } from "@/domains/ui/cur";
import { toFixed, update_arr_item } from "@/utils";
import { Result } from "@/domains/result";
import { toNumber } from "@/utils/primitive";

export function BMRCalcViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    calcBMR() {
      const weight = toNumber(ui.$input_weight.value);
      const age = toNumber(ui.$input_age.value);
      const height = toNumber(ui.$input_height.value);
      const gender = ui.$input_gender.value;
      const activity = ui.$input_activity.value ?? 1.2;
      if (weight === null) {
        return Result.Err("请输入合法体重值");
      }
      if (height === null) {
        return Result.Err("请输入合法身高值");
      }
      if (age === null) {
        return Result.Err("请输入合法年龄值");
      }
      if (!weight) {
        return Result.Err("请输入体重");
      }
      if (!height) {
        return Result.Err("请输入身高");
      }
      if (!age) {
        return Result.Err("请输入年龄");
      }
      const v1_m = toFixed(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age, 0);
      const v1_w = toFixed(447.593 + 9.247 * weight + 3.098 * height - 4.33 * age, 0);
      const v1 = gender === "man" ? v1_m : v1_w;
      const v2_m = toFixed(10 * weight + 6.25 * height - 5 * age + 5, 0);
      const v2_w = toFixed(10 * weight + 6.25 * height - 5 * age - 161, 0);
      const v2 = gender === "man" ? v2_m : v2_w;
      const v3_m = toFixed(67 + 13.73 * weight + 5 * height - 6.9 * age, 0);
      const v3_w = toFixed(655 + 9.56 * weight + 1.85 * height - 4.98 * age, 0);
      const v3 = gender === "man" ? v3_m : v3_w;
      return Result.Ok([
        {
          v: v1,
          idx: 0,
          tdee: toFixed(v1 * activity, 0),
        },
        {
          v: v2,
          idx: 1,
          tdee: toFixed(v2 * activity, 0),
        },
        {
          v: v3,
          idx: 2,
          tdee: toFixed(v3 * activity, 0),
        },
      ]);
    },
    async calcTDEE() {
      const activity = ui.$input_activity.value;
      if (!activity) {
        props.app.tip({
          text: ["请选择活动系数"],
        });
        return;
      }
      if (_values.length === 0) {
        const r = await methods.calcBMR();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _values = r.data;
      }
      for (let i = 0; i < _values.length; i += 1) {
        const v = _values[i].v;
        const v2 = v * activity;
        _values = update_arr_item(_values, i, {
          v,
          idx: _values[i].idx,
          tdee: v2,
        });
      }
      methods.refresh();
    },
    showDialogWithSpecialRule(idx: number) {
      _idx = idx;
      ui.$dialog_rm_calc_rule.show();
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $input_age: new InputCore({ defaultValue: 18 }),
    $input_weight: new InputCore({ defaultValue: 60 }),
    $input_height: new InputCore({ defaultValue: 170 }),
    $input_gender: new RefCore<string>({ defaultValue: "man" }),
    $input_activity: new SelectCore({
      defaultValue: 1.2,
      options: [
        { label: "久坐不动", value: 1.2 },
        { label: "轻度活动", value: 1.375 },
        { label: "中度活动", value: 1.55 },
        { label: "高强度活动", value: 1.725 },
        { label: "极强度活动", value: 1.9 },
      ],
    }),
    $btn_submit: new ButtonCore({
      async onClick() {
        const r = await methods.calcBMR();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _values = r.data;
        methods.refresh();
      },
    }),
    $btn_submit2: new ButtonCore({
      onClick() {
        methods.calcTDEE();
      },
    }),
    $dialog_rm_calc_rule: new DialogCore({}),
    $dialog_rm_step: new DialogCore({}),
  };
  let _values: {
    v: number;
    tdee: number;
    idx: number;
  }[] = [];
  let _idx = 0;
  let _text = "";
  let _state = {
    get values() {
      return _values;
    },
    get text() {
      return _text;
    },
    get idx() {
      return _idx;
    },
    get gender() {
      return ui.$input_gender.value;
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

  ui.$input_gender.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function BMRCalcToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(BMRCalcViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <div class="space-y-2">
          <div class="field">
            <div class="text-sm text-w-fg-0">年龄</div>
            <div class="mt-1">
              <Input store={vm.ui.$input_age} />
            </div>
          </div>
          <div class="field">
            <div class="text-sm text-w-fg-0">体重(单位kg)</div>
            <div class="mt-1">
              <Input store={vm.ui.$input_weight} />
            </div>
          </div>
          <div class="field">
            <div class="text-sm text-w-fg-0">身高(单位cm)</div>
            <div class="mt-1">
              <Input store={vm.ui.$input_height} />
            </div>
          </div>
          <div class="field">
            <div class="text-sm text-w-fg-0">性别</div>
            <div class="flex gap-2 mt-1">
              <div
                classList={{
                  "w-[60px] p-2 border-2 rounded-lg text-center": true,
                  "border-w-fg-2 text-w-fg-0 bg-w-bg-5": state().gender === "man",
                  "border-w-fg-3 text-w-fg-1": state().gender !== "man",
                }}
                onClick={() => {
                  vm.ui.$input_gender.select("man");
                }}
              >
                <div>男</div>
              </div>
              <div
                classList={{
                  "w-[60px] p-2 border-2 rounded-lg text-center": true,
                  "border-w-fg-2 text-w-fg-0 bg-w-bg-5": state().gender === "woman",
                  "border-w-fg-3 text-w-fg-1": state().gender !== "woman",
                }}
                onClick={() => {
                  vm.ui.$input_gender.select("woman");
                }}
              >
                <div>女</div>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="text-sm text-w-fg-0">活动系数</div>
            <div class="mt-1">
              <Select store={vm.ui.$input_activity} />
            </div>
          </div>
        </div>
        <div class="mt-8">
          <Button class="w-full" store={vm.ui.$btn_submit}>
            计算
          </Button>
        </div>
        <div class="mt-8 pb-12">
          <div class="grid grid-cols-3 gap-2">
            <For each={state().values}>
              {(v) => {
                return (
                  <div
                    class="p-4 border-2 border-w-fg-3 rounded-lg text-center text-w-fg-0"
                    onClick={() => {
                      vm.methods.showDialogWithSpecialRule(v.idx);
                    }}
                  >
                    <div>
                      <div class="text-sm text-w-fg-1">基础代谢</div>
                      <div class="text-2xl">{v.v}</div>
                    </div>
                    <div class="mt-2">
                      <div class="text-sm text-w-fg-1">总消耗</div>
                      <div class="text-2xl">{v.tdee}</div>
                    </div>
                    <div class="flex justify-center mt-2">
                      <CircleHelp class="w-6 h-6 text-w-fg-1" />
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div>
            <Show when={state().values.length}>
              <div class="mt-2 text-sm text-w-fg-1">单位：kcal 大卡</div>
              <div class="mt-1 text-sm text-w-fg-1">总消耗是根据「活动系数」计算</div>
            </Show>
          </div>
        </div>
        {/* <div class="mt-8">
              <div>
                <Select store={vm.ui.$input_activity} />
              </div>
              <div class="mt-2">
                <Button class="w-full" store={vm.ui.$btn_submit2}>
                  计算总消耗
                </Button>
              </div>
            </div> */}
      </PageView>
      <Sheet store={vm.ui.$dialog_rm_calc_rule} app={props.app}>
        <div class="min-h-[80px] p-2">
          <div class="text-w-fg-0">
            <Show when={state().idx === 0}>
              <div class="text-xl">哈里斯 - Benedict公式</div>
              <div class="mt-4 space-y-2">
                <div class="">
                  <div>男性</div>
                  <div>88.362 + (13.397 * 体重) + (4.799 * 身高) - (5.677 * 年龄)</div>
                </div>
                <div>
                  <div>女性</div>
                  <div>447.593 + (9.247 * 体重) + (3.098 * 身高) - (4.330 * 年龄)</div>
                </div>
              </div>
            </Show>
            <Show when={state().idx === 1}>
              <div class="text-xl">Mifflin - St Jeor 公式</div>
              <div class="mt-4 space-y-2">
                <div>
                  <div>男性</div>
                  <div>(10 * 体重) + (6.25 * 身高) - (5 * 年龄) + 5</div>
                </div>
                <div>
                  <div>女性</div>
                  <div>(10 * 体重) + (6.25 * 身高) - (5 * 年龄) - 161</div>
                </div>
              </div>
            </Show>
            <Show when={state().idx === 2}>
              <div class="text-xl">中国成人适配公式</div>
              <div class="mt-4 space-y-2">
                <div>
                  <div>男性</div>
                  <div>67 + (13.73 * 体重) + (5 * 身高) - (6.9 * 年龄)</div>
                </div>
                <div>
                  <div>女性</div>
                  <div>655 + (9.56 * 体重) + (1.85 * 身高) - (4.98 * 年龄)</div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Sheet>
    </>
  );
}
