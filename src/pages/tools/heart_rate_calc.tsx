import { createSignal, For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button, Input } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { Result } from "@/domains/result";
import { toNumber } from "@/utils/primitive";

enum IntensityLevel {
  CardioHealth = "心肺健康",
  CardioImprovement = "提升心肺",
  Performance = "运动表现",
}
const intensity_levels = [IntensityLevel.CardioHealth, IntensityLevel.CardioImprovement, IntensityLevel.Performance];
const intensityLevelConfig = {
  [IntensityLevel.CardioHealth]: {
    mhr_range: { min: 0.64, max: 0.76 },
    hrr_range: { min: 0.4, max: 0.59 },
    rpe_range: { min: 12, max: 13 },
    talk_test: "可以舒适地谈话但不可以唱歌",
  },
  [IntensityLevel.CardioImprovement]: {
    mhr_range: { min: 0.77, max: 0.95 },
    hrr_range: { min: 0.6, max: 0.89 },
    rpe_range: { min: 14, max: 17 },
    talk_test: "不确定谈话时是否舒适，暂停呼吸才能说出几个词",
  },
  [IntensityLevel.Performance]: {
    mhr_range: { min: 0.96, max: 1.0 },
    hrr_range: { min: 0.9, max: 1.0 },
    rpe_range: { min: 18, max: 20 },
    talk_test: "绝对不能舒适地谈话",
  },
};

function HeartRateCalcViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    map_rpe_text(rpe: number) {
      if (rpe >= 6 && rpe <= 7) {
        return "极其轻松";
      }
      if (rpe >= 8 && rpe <= 9) {
        return "非常轻松";
      }
      if (rpe >= 10 && rpe <= 11) {
        return "较轻松";
      }
      if (rpe >= 12 && rpe <= 13) {
        return "有点费力";
      }
      if (rpe >= 14 && rpe <= 15) {
        return "费力";
      }
      if (rpe >= 16 && rpe <= 17) {
        return "非常费力";
      }
      if (rpe >= 18 && rpe <= 20) {
        return "极其费力";
      }
      return "未知强度";
    },
    calc() {
      const age = toNumber(ui.$input_age.value);
      const resting_heart_rate = toNumber(ui.$input_heart_rate.value);
      const intensity_level = ui.$input_intensity_level.value;
      if (resting_heart_rate === null) {
        return Result.Err("请输入合法静息心率");
      }
      if (age === null) {
        return Result.Err("请输入合法年龄值");
      }
      if (!age) {
        return Result.Err("请输入年龄");
      }
      const max_heart_rate = 220 - age;
      const mhr_target_range = (() => {
        const range = intensityLevelConfig[intensity_level].mhr_range;
        return {
          min: Math.round(max_heart_rate * range.min),
          max: Math.round(max_heart_rate * range.max),
        };
      })();
      // 保留心率
      const reserve_heart_rate = max_heart_rate - resting_heart_rate;
      const hrr_target_range = (() => {
        const range = intensityLevelConfig[intensity_level].hrr_range;
        return {
          min: Math.round(reserve_heart_rate * range.min + resting_heart_rate),
          max: Math.round(reserve_heart_rate * range.max + resting_heart_rate),
        };
      })();
      _results = [
        {
          title: "最大心率法 (%MHR)",
          text: `${mhr_target_range.min} - ${mhr_target_range.max} 次/分`,
          subtitle: "",
        },
        {
          title: "卡式公式 (%HRR)",
          text: `${hrr_target_range.min} - ${hrr_target_range.max} 次/分`,
          subtitle: "",
        },
        {
          title: "自感疲劳度 (RPE)",
          text: `${intensityLevelConfig[intensity_level].rpe_range.min} - ${intensityLevelConfig[intensity_level].rpe_range.max}`,
          subtitle: methods.map_rpe_text(intensityLevelConfig[intensity_level].rpe_range.min),
        },
        {
          title: "谈话测试",
          text: intensityLevelConfig[intensity_level].talk_test,
        },
      ];
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $input_heart_rate: new InputCore({ defaultValue: 60 }),
    $input_age: new InputCore({ defaultValue: 18 }),
    $input_intensity_level: new InputCore({ defaultValue: IntensityLevel.CardioHealth }),
    $btn_submit: new ButtonCore({
      onClick() {
        methods.calc();
      },
    }),
  };
  let _results: { title: string; text: string; subtitle?: string }[] = [];
  let _state = {
    get intensity_level() {
      return ui.$input_intensity_level.value;
    },
    get results() {
      return _results;
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

  ui.$input_intensity_level.onChange(() => {
    methods.calc();
  });
  ui.$input_intensity_level.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      methods.calc();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HeartRateCalcToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HeartRateCalcViewModel, [props]);

  return (
    <PageView store={vm}>
      <div class="space-y-2">
        <div class="field">
          <div class="text-sm text-w-fg-0">年龄</div>
          <div class="mt-1">
            <Input store={vm.ui.$input_age} />
          </div>
        </div>
        <div class="field">
          <div class="text-sm text-w-fg-0">静息心率(次/分)</div>
          <div class="mt-1">
            <Input store={vm.ui.$input_heart_rate} />
          </div>
        </div>
        <div class="field">
          <div class="text-sm text-w-fg-0">运动强度</div>
          <div class="mt-1">
            <div class="grid grid-cols-3 gap-2">
              <For each={intensity_levels}>
                {(level) => {
                  return (
                    <div
                      classList={{
                        "p-2 border-2 border-w-fg-3 text-w-fg-1 rounded-lg": true,
                        "border-w-fg-2 bg-w-bg-5 text-w-fg-0": state().intensity_level === level,
                      }}
                      onClick={() => {
                        vm.ui.$input_intensity_level.setValue(level);
                      }}
                    >
                      <div class="text-center">{level}</div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <Button class="w-full" store={vm.ui.$btn_submit}>
          计算
        </Button>
      </div>
      <div class="mt-8">
        <div class="text-w-fg-0">计算结果</div>
        <div class="mt-2 space-y-2">
          <For each={state().results}>
            {(result) => {
              return (
                <div class="w-full p-4 border-2 border-w-fg-3 rounded-lg">
                  <div class="space-y-1.5">
                    <div class="text-sm text-w-fg-0">{result.title}</div>
                    <div class="text-xl font-bold">{result.text}</div>
                    <Show when={result.subtitle}>
                      <div class="text-xs text-w-fg-1">{result.subtitle}</div>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </PageView>
  );
}
