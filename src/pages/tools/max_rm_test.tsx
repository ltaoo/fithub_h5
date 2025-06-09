/**
 * @file 1RM 测试
 */
import { For, Show } from "solid-js";
import { CircleCheck, CircleX, MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Input, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";
import { Divider } from "@/components/divider";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ButtonCore, CheckboxCore, DialogCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { SetCountdownViewModel } from "@/biz/set_countdown";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { toFixed } from "@/utils";

import { MaxRMCountdownView } from "./components/max-rm-countdown";
import { MaxRMCompleteBtn } from "./components/max-rm-complete-btn";
import { RequestCore } from "@/domains/request";
import {
  createWorkoutActionHistory,
  fetchWorkoutActionHistoryListOfWorkoutAction,
  fetchWorkoutActionHistoryListOfWorkoutActionProcess,
} from "@/biz/workout_action/services";
import { getSetValueUnit } from "@/biz/set_value_input";
import { ListCore } from "@/domains/list";
import { SetValueView } from "@/components/set-value-view";

function round_to_nearest_five(num: number): number {
  const last_digit = num % 10;
  const tens = Math.floor(num / 10) * 10;

  if (last_digit <= 3) {
    return tens;
  } else if (last_digit <= 7) {
    return tens + 5;
  }
  return tens + 10;
}
enum StepType {
  Workout = 1,
  Resting = 2,
}
export function MaxRMTestViewModel(props: ViewComponentProps) {
  const request = {
    workout_action_history: {
      create: new RequestCore(createWorkoutActionHistory, { client: props.client }),
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutAction, {
          process: fetchWorkoutActionHistoryListOfWorkoutActionProcess,
          client: props.client,
        }),
        {
          pageSize: 10,
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
    showDialogOfRMStep() {
      ui.$dialog_rm_step.show();
    },
    handleWorkoutFailed() {
      _result = {
        success: true,
        status_text: "测试成功",
        show_submit_btn: true,
      };
      if (_cur_step_idx < 6) {
        _result = {
          success: false,
          status_text: "测试失败",
          show_submit_btn: false,
        };
      }
      _view_step += 1;
      methods.refresh();
    },
    handleWorkoutComplete() {
      const is_last_step = _cur_step_idx === _steps.length - 1;
      const cur_step = _steps[_cur_step_idx];
      _max_weight = cur_step.weight;
      if (is_last_step) {
        _steps.push({
          idx: _steps.length,
          text: `休息3-5分钟`,
          weight: 0,
          reps: 0,
          radio: 0,
          type: StepType.Resting,
          $countdown: SetCountdownViewModel({
            countdown: 3 * 60,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        });
        _steps.push({
          idx: _steps.length,
          ...(() => {
            const radio = cur_step.radio + 0.05;
            const raw_weight = _expect_max_weight * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 1;
            return {
              text: `尝试 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        });
      }
      _cur_step_idx += 1;
      const next_step = _steps[_cur_step_idx];
      if (next_step.type === StepType.Resting) {
        next_step.$countdown.start();
      }
      methods.refresh();
    },
    handleCountdownStop() {
      console.log("[PAGE]tools/max_rm_test - handleCountdownStop", _cur_step_idx, _steps.length, _steps);
      _cur_step_idx += 1;
      methods.refresh();
    },
    buildTestSteps() {
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
      const t1 = "重量 / (1.0278 - 0.0278 * 次数)";
      _values = [
        {
          v: v1,
          text: t1,
        },
      ];
      _expect_max_weight = v1;
      _steps = [
        {
          idx: 0,
          ...(() => {
            const radio = 0.5;
            const raw_weight = v1 * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 10;
            return {
              text: `以 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 1,
          text: "休息30s",
          weight: 0,
          reps: 0,
          radio: 0,
          type: StepType.Resting,
          $countdown: SetCountdownViewModel({
            countdown: 30,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false }),
        },
        {
          idx: 2,
          ...(() => {
            const radio = 0.75;
            const raw_weight = v1 * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 5;
            return {
              text: `以 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 3,
          text: "休息 3-5min",
          weight: 0,
          reps: 0,
          radio: 0,
          type: StepType.Resting,
          $countdown: SetCountdownViewModel({
            countdown: 3 * 60,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 4,
          ...(() => {
            const radio = 0.9;
            const raw_weight = v1 * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 1;
            return {
              text: `以 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 5,
          text: "休息 3-5min",
          weight: 0,
          reps: 0,
          radio: 0,
          type: StepType.Resting,
          $countdown: SetCountdownViewModel({
            countdown: 3 * 60,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 6,
          ...(() => {
            const radio = 1;
            const raw_weight = v1 * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 1;
            return {
              text: `尝试 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 7,
          text: "休息 3-5min",
          weight: 0,
          reps: 0,
          radio: 0,
          type: StepType.Resting,
          $countdown: SetCountdownViewModel({
            countdown: 3 * 60,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
        {
          idx: 8,
          ...(() => {
            const radio = 1.05;
            const raw_weight = v1 * radio;
            const weight = round_to_nearest_five(toFixed(raw_weight, 0));
            const reps = 1;
            return {
              text: `尝试 ${weight}kg 重量做 ${reps} 次`,
              weight,
              reps,
              radio,
            };
          })(),
          type: StepType.Workout,
          $countdown: SetCountdownViewModel({
            countdown: 0,
            remaining: 0,
            exceed: 0,
            finished: false,
            onStop: methods.handleCountdownStop,
          }),
          // $completed: new CheckboxCore({ value: false, onChange: methods.handleWorkoutComplete }),
        },
      ];
      _view_step += 1;
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $input_weight: new InputCore({ defaultValue: 80 }),
    $input_reps: new InputCore({ defaultValue: 12 }),
    $btn_submit: new ButtonCore({
      onClick() {
        methods.buildTestSteps();
      },
    }),
    $dialog_rm_step: new DialogCore({}),
    $btn_save_max_rm: new ButtonCore({
      onClick() {
        ui.$select_workout_action.request.action.list.init();
        ui.$select_workout_action.ui.$dialog.show();
      },
    }),
    $select_workout_action: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      list: $workout_action_list,
      multiple: false,
      client: props.client,
      async onOk(actions) {
        if (actions.length === 0) {
          return;
        }
        const action = actions[0];
        ui.$select_workout_action.ui.$btn_submit.setLoading(true);
        const r = await request.workout_action_history.create.run({
          workout_action_id: Number(action.id),
          reps: 1,
          reps_unit: getSetValueUnit("次"),
          weight: _max_weight,
          weight_unit: getSetValueUnit("公斤"),
        });
        ui.$select_workout_action.ui.$btn_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        ui.$select_workout_action.ui.$dialog.hide();
        if (_result) {
          _result.show_submit_btn = false;
        }
        request.workout_action_history.list.init({
          workout_action_id: action.id,
        });
        props.app.tip({
          text: ["提交成功"],
        });
        methods.refresh();
      },
      onError(err) {
        props.app.tip({
          text: [err.message],
        });
      },
    }),
  };
  let _values: {
    v: number;
    text: string;
  }[] = [];
  /** 通过公式计算出的「预计最大RM」 */
  let _expect_max_weight = 0;
  /** 在执行步骤过程中「实际最大RM」 */
  let _max_weight = 0;
  let _steps: {
    idx: number;
    text: string;
    weight: number;
    reps: number;
    radio: number;
    type: StepType;
    $countdown: SetCountdownViewModel;
  }[] = [];
  let _view_step = 1;
  let _cur_step_idx = 0;
  let _result: { success: boolean; status_text: string; show_submit_btn: boolean } | null = null;
  let _state = {
    get values() {
      return _values;
    },
    get view_step() {
      return _view_step;
    },
    get steps() {
      return _steps.map((s) => {
        return {
          ...s,
          is_cur: s.idx === _cur_step_idx,
        };
      });
    },
    get cur_step_idx() {
      return _cur_step_idx;
    },
    get max_weight() {
      return _max_weight;
    },
    get result() {
      return _result;
    },
    get workout_action_history() {
      return request.workout_action_history.list.response;
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

  request.workout_action_history.list.onStateChange(() => methods.refresh());

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

export function MaxRMTestToolView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MaxRMTestViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center justify-between">
            <div></div>
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.showDialogOfRMStep();
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </div>
          </div>
        }
      >
        <Show when={state().view_step === 1}>
          <div class="">
            <div class="p-2 rounded-lg text-w-fg-0 text-sm text-center">输入要测试动作常用重量和次数</div>
            <div class="space-y-2 mt-4">
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
                  开始测试
                </Button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={state().view_step === 2}>
          <div class="space-y-2">
            <For each={state().steps}>
              {(v, idx) => {
                return (
                  <div
                    classList={{
                      "flex items-center justify-between p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0": true,
                      "border-w-fg-2 bg-w-bg-5 text-w-fg-0": v.is_cur,
                      "text-w-fg-2": idx() < state().cur_step_idx,
                    }}
                  >
                    <div class="flex">
                      <div class="w-[24px]">{idx() + 1}.</div>
                      <div>{v.text}</div>
                    </div>
                    <Show when={v.type === StepType.Resting}>
                      <MaxRMCountdownView store={v.$countdown} highlight={v.is_cur} />
                    </Show>
                    <Show when={v.type === StepType.Workout}>
                      <MaxRMCompleteBtn
                        highlight={v.is_cur}
                        onOk={() => {
                          vm.methods.handleWorkoutComplete();
                        }}
                        onFailed={() => {
                          vm.methods.handleWorkoutFailed();
                        }}
                      />
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
        <Show when={state().result}>
          <div class="flex flex-col items-center">
            <Show when={state().result?.success} fallback={<CircleX class="w-12 h-12 text-red-500" />}>
              <CircleCheck class="w-12 h-12 text-green-500" />
            </Show>
            <div class="mt-2 text-w-fg-0 text-center">{state().result?.status_text}</div>
          </div>
          <Divider />
          <Show when={state().result?.success}>
            <div class="text-center text-w-fg-1">你的 1RM 值为</div>
            <div class="flex justify-center text-xl">
              <div class="flex items-end text-w-fg-0">
                <div class="text-3xl">{state().max_weight}</div>
                <div>kg</div>
              </div>
            </div>
            <Show when={state().result?.show_submit_btn}>
              <div class="py-2">
                <Button class="w-full" store={vm.ui.$btn_save_max_rm}>
                  保存
                </Button>
              </div>
            </Show>
          </Show>
          <div class="mt-4 space-y-2">
            <For each={state().workout_action_history.dataSource}>
              {(v) => {
                return (
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <div class="text-w-fg-0">{v.action.zh_name}</div>
                    <div class="mt-2">
                      <SetValueView
                        weight={v.weight}
                        weight_unit={v.weight_unit}
                        reps={v.reps}
                        reps_unit={v.reps_unit}
                      />
                    </div>
                    <div class="text-sm text-w-fg-1">{v.created_at}</div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </PageView>
      <Sheet store={vm.ui.$dialog_rm_step} app={props.app}>
        <div class="min-h-[80px] p-2 text-w-fg-0">
          <div class="text-xl text-center">最大重量（1RM）测试方案</div>
          <div class="mt-2 text-sm">
            <div>1. 以预期 1RM 重量的 50% 的重量做 10 次</div>
            <div>2. 休息 30s</div>
            <div>3. 以预期 1RM 重量的 75% 的重量做 5 次</div>
            <div>4. 休息 3-5min</div>
            <div>5. 以预期 1RM 重量的 90%-95% 的重量做 1 次</div>
            <div>6. 休息 3-5min</div>
            <div>7. 尝试 1RM 重量</div>
            <div>8. 休息 3-5min</div>
            <div>9. 如果尝试成功，增加重量并尝试新的 1RM 重量</div>
            <div>10. 重复「尝试成功-增加重量」，直到失败为止</div>
            <div>11. 成功的最大重量，即为 1RM 重量</div>
          </div>
        </div>
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$select_workout_action.ui.$dialog} app={props.app}>
        <WorkoutActionSelect3View store={vm.ui.$select_workout_action} app={props.app} />
      </Sheet>
    </>
  );
}
