/**
 * @file 训练日记录
 */
import { For, Show } from "solid-js";
import { ChevronLeft, Loader, StopCircle } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Dialog, Input, ListView, ScrollView } from "@/components/ui";
import { WorkoutActionCard } from "@/components/workout-action-card";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { CountdownViewModel } from "@/biz/countdown";
import { WorkoutActionMultipleSelectViewModel } from "@/biz/workout_action_multiple_select";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import {
  ButtonCore,
  ButtonInListCore,
  CheckboxCore,
  DialogCore,
  InputCore,
  InputInListCore,
  PresenceCore,
  ScrollViewCore,
} from "@/domains/ui";
import { RefCore } from "@/domains/ui/cur";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { WorkoutActionSelectDialogView } from "@/components/workout-action-select-dialog";
import { WeightInput } from "@/components/weight-input";
import { WeightInputViewModel } from "@/biz/weight_input";
import { Countdown } from "@/components/countdown";
import { Sheet } from "@/components/ui/sheet";
import { Presence } from "@/components/ui/presence";
import { FormInputInterface } from "@/domains/ui/formv2/types";
import { SetCompleteBtn } from "@/components/set-complete-btn";
import { ToolsBar } from "@/components/tools-bar";
import { Result } from "@/domains/result";

export function HomeWorkoutDayUpdateViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
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
  };
  const methods = {
    beforeShowNumInput(opt: { step_idx: number; set_idx: number; act_idx: number; x: number; y: number }) {
      console.log(opt.x, opt.y);
      const keyboard_height = 420;
      if (props.app.screen.height - opt.y < keyboard_height) {
        const v = keyboard_height - (props.app.screen.height - opt.y);
        if (v > 0) {
          methods.setHeight(v);
        }
      }
    },
    showNumInput(opt: { key: string; for: "reps" | "weight" }) {
      ui.$ref_input_key.select(opt.key);
      const input = inputs.get(opt.key);
      if (!input) {
        return;
      }
      ui.$weight_input.setValue({
        text: input.value,
        unit: "kg",
      });
      if (!ui.$weight_input_dialog.state.open) {
        ui.$weight_input_dialog.show();
      }
    },
    handleCompleteSet(opt: { step_idx: number; set_idx: number; act_idx: number }) {
      console.log("[PAGE]workout_day/create - handleCompleteSet", opt);
      if (ui.$weight_input_dialog.state.open) {
        ui.$weight_input_dialog.hide();
      }
      const input_reps = ui.inputs.get(`reps.${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`);
      const input_weight = ui.inputs.get(`weight.${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`);
      const input_check = ui.inputs.get(`check.${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`);
      if (!input_reps || !input_weight || !input_check) {
        console.log("[PAGE]workout_day/create - no inputs", input_reps, input_weight, input_check);
        return;
      }
      if (input_check.value === true) {
        input_check.setValue(false);
        return;
      }

      const vv_reps = Number(input_reps.value || input_reps.placeholder);
      const vv_weight = Number(input_weight.value || input_weight.placeholder);

      const errors: { msg: string }[] = [];

      if (isNaN(vv_reps)) {
        errors.push({
          msg: `不合法的数量`,
        });
      }
      if (isNaN(vv_weight)) {
        errors.push({
          msg: `不合法的重量`,
        });
      }
      if (errors.length > 0) {
        console.log("[PAGE]workout_day/create - errors", errors);
        return;
      }
      input_check.setValue(true);
      _cur_step_idx = opt.step_idx;
      _next_set_idx = opt.set_idx + 1;
      if (_next_set_idx >= _steps[opt.step_idx].sets.length) {
        _next_set_idx = 0;
        _cur_step_idx = opt.step_idx + 1;
      }
      methods.refreshWorkoutDayStats({
        step_idx: _cur_step_idx,
        set_idx: _next_set_idx,
      });
      if (_cur_step_idx >= _steps.length) {
        // methods.refreshWorkoutDayStats();
        ui.$dialog_confirm_complete.show();
        return;
      }
      const next_set = _steps[opt.step_idx].sets[opt.set_idx + 1];
      if (next_set) {
        for (let i = 0; i < next_set.actions.length; i++) {
          const input_prev_reps = ui.inputs.get(`reps.${opt.step_idx}-${opt.set_idx}-${i}`);
          const input_prev_weight = ui.inputs.get(`weight.${opt.step_idx}-${opt.set_idx}-${i}`);
          const input_reps = ui.inputs.get(`reps.${opt.step_idx}-${opt.set_idx + 1}-${i}`);
          const input_weight = ui.inputs.get(`weight.${opt.step_idx}-${opt.set_idx + 1}-${i}`);
          if (input_prev_reps && input_reps) {
            input_reps.setPlaceholder(input_prev_reps.value || input_prev_reps.placeholder);
          }
          if (input_prev_weight && input_weight) {
            const v = Number(input_prev_weight.value || input_prev_weight.placeholder);
            if (!isNaN(v)) {
              input_weight.setPlaceholder(v.toString());
            }
          }
        }
      }
      const payload = {
        actions: [] as { id: number; reps: string; weight: string }[],
      };
      console.log("[PAGE]workout_day/create", payload);
      const set = _steps[opt.step_idx].sets[opt.set_idx];
      if (opt.act_idx === set.actions.length - 1) {
        console.log("[PAGE]workout_day/create - complete the set");
        if (!ui.$countdown_presence.state.visible) {
          ui.$countdown_presence.show();
          ui.$countdown.start();
        }
      }
      // const actions = set.actions[opt.act_idx];
      bus.emit(Events.StateChange, { ..._state });
    },
    handleDeleteAction(opt: { step_idx: number; set_idx: number; act_idx: number }) {
      console.log("[PAGE]workout_day/create - handleDeleteSet", opt);
    },
    refreshWorkoutDayStats(opt: { step_idx: number; set_idx: number }) {
      const total = {
        sets: 0,
        weight: 0,
        tips: [] as string[],
      };
      const data: {
        step_idx: number;
        set_idx: number;
        act_idx: number;
        reps: number;
        weight: number;
        completed: boolean;
      }[] = [];
      for (let i = 0; i < _steps.length; i++) {
        const step = _steps[i];
        for (let j = 0; j < step.sets.length; j++) {
          const set = step.sets[j];
          let set_completed = false;
          for (let k = 0; k < set.actions.length; k++) {
            const input_reps = ui.inputs.get(`reps.${i}-${j}-${k}`);
            const input_weight = ui.inputs.get(`weight.${i}-${j}-${k}`);
            const input_check = ui.inputs.get(`check.${i}-${j}-${k}`);

            const completed = input_check?.value === true;
            if (completed === false) {
              set_completed = false;
            }
            if (completed === true) {
              const vv_reps = Number(input_reps?.value || input_reps?.placeholder);
              const vv_weight = Number(input_weight?.value || input_weight?.placeholder);
              data.push({
                step_idx: i,
                set_idx: j,
                act_idx: k,
                reps: vv_reps,
                weight: vv_weight,
                completed: completed,
              });
              total.weight += vv_weight * vv_reps;
            }
          }
          if (set_completed === false) {
            total.tips.push(`${i + 1}/${j + 1}组未完成`);
          }
          if (set_completed) {
            total.sets += 1;
          }
        }
      }
      console.log("[PAGE]workout_day/create - total", total);
      props.storage.set("pending_workout_day", {
        step_idx: opt.step_idx,
        set_idx: opt.set_idx,
        data,
      });
    },
    async showWorkoutActionProfile(id: number | string) {
      ui.$workout_action_profile_dialog.show();
      const r = await request.workout_action.profile.run({ id });
      if (r.error) {
        props.app.tip({
          text: ["获取动作详情失败", r.error.message],
        });
        return;
      }
      _cur_workout_action = r.data;
      bus.emit(Events.StateChange, { ..._state });
    },
    setHeight(height: number) {
      _height = height;
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const inputs = new Map<string, InputCore<any>>();
  const btns = new Map<string, ButtonCore>();
  const ui = {
    inputs,
    btns,
    $ref_input_key: new RefCore<string>(),
    $view: new ScrollViewCore(),
    $workout_plan_dialog_btn: new ButtonCore(),
    $action_select_dialog: new DialogCore({}),
    $action_select_view: new ScrollViewCore(),
    $action_select: WorkoutActionMultipleSelectViewModel({
      list: $workout_action_list,
      defaultValue: [],
      client: props.client,
    }),
    $start_btn: new ButtonCore(),
    $cur_step_ref: new RefCore<{ id?: number | string; idx: number }>(),
    $input_reps: new InputInListCore({
      defaultValue: "",
    }),
    $input_weight: new InputInListCore({
      defaultValue: "",
    }),
    $workout_action_change_btn: new ButtonInListCore<{ id?: number | string; idx: number }>({
      onClick(v) {
        ui.$action_select.request.action.list.init();
        ui.$cur_step_ref.select(v);
        ui.$workout_action_dialog.ui.$dialog.show();
      },
    }),
    $workout_action_dialog: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      client: props.client,
      list: $workout_action_list,
      onOk(acts) {
        const v = ui.$cur_step_ref.value;
        console.log("[PAGE]workout_day/create", acts, v);
        if (acts.length === 0) {
          props.app.tip({
            text: ["请选择动作"],
          });
          return;
        }
        if (v) {
          const step = _steps[v.idx];
          if (acts.length === 1) {
            _steps = [
              ..._steps.slice(0, v.idx),
              {
                id: step.id,
                idx: step.idx,
                sets: step.sets.map((set) => {
                  return {
                    actions: acts.map((act) => {
                      return {
                        id: Number(act.id),
                        zh_name: act.zh_name,
                        reps: 0,
                        weight: "",
                      };
                    }),
                  };
                }),
              },
              ..._steps.slice(v.idx + 1),
            ];
          }
          ui.$cur_step_ref.clear();
          ui.$workout_action_dialog.methods.clear();
          ui.$workout_action_dialog.ui.$dialog.hide();
          bus.emit(Events.StateChange, { ..._state });
          return;
        }
        _steps = [
          ..._steps,
          {
            idx: _steps.length,
            sets: [
              {
                actions: acts.map((act) => {
                  return {
                    id: Number(act.id),
                    zh_name: act.zh_name,
                    reps: 0,
                    weight: "",
                  };
                }),
              },
            ],
          },
        ];
        ui.$workout_action_dialog.methods.clear();
        ui.$workout_action_dialog.ui.$dialog.hide();
        bus.emit(Events.StateChange, { ..._state });
      },
    }),
    $weight_input_dialog: new DialogCore({
      onOk() {
        const v = ui.$weight_input.value;
        console.log("[PAGE]workout_day/create", v);
        ui.$weight_input_dialog.hide();
      },
    }),
    $weight_input: WeightInputViewModel({}),
    $countdown: CountdownViewModel({}),
    $countdown_presence: new PresenceCore(),
    $workout_action_profile_dialog: new DialogCore({ footer: false }),
    $tools: new PresenceCore(),
    $dialog_confirm_complete: new DialogCore({}),
  };
  let _height = 0;
  let _steps: {
    id?: number | string;
    idx: number;
    sets: {
      actions: {
        id: number;
        zh_name: number | string;
        reps: number;
        weight: string;
      }[];
    }[];
  }[] = [];
  let _cur_workout_action: WorkoutActionProfile | null = null;
  let _cur_step_idx = 0;
  let _next_set_idx = 0;
  let _state = {
    get steps() {
      return _steps;
    },
    get height() {
      return _height;
    },
    get actions() {
      return ui.$action_select.state.actions;
    },
    get selectedActions() {
      return ui.$action_select.state.value;
    },
    get loading() {
      return request.workout_action.profile.loading;
    },
    get cur_workout_action() {
      return _cur_workout_action;
    },
    get next_set_idx() {
      return _next_set_idx;
    },
    get cur_step_idx() {
      return _cur_step_idx;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$action_select.onStateChange((v) => {
    bus.emit(Events.StateChange, { ..._state });
  });
  ui.$weight_input.onSubmit((v) => {
    console.log("[PAGE]workout_day/create", v);
    ui.$weight_input_dialog.hide();
  });
  ui.$weight_input_dialog.onCancel(() => {
    methods.setHeight(0);
  });
  ui.$weight_input.onChange((v) => {
    const key = ui.$ref_input_key.value;
    if (!key) {
      props.app.tip({
        text: ["请先选择输入框"],
      });
      return;
    }
    const input = inputs.get(key);
    if (!input) {
      props.app.tip({
        text: ["输入框不存在"],
      });
      return;
    }
    console.log("[PAGE]workout_day/create", v);
    input.setValue(v === 0 ? "" : v.toString());
  });
  ui.$countdown.onStop((v) => {
    ui.$countdown_presence.hide();
  });

  request.workout_action.profile.onStateChange((v) => {
    bus.emit(Events.StateChange, { ..._state });
  });
  return {
    state: _state,
    ui,
    request,
    methods,
    async ready() {
      const pending_workout_day = props.storage.get("pending_workout_day");
      if (pending_workout_day) {
        _cur_step_idx = pending_workout_day.step_idx;
        _next_set_idx = pending_workout_day.set_idx;
      }
      const workout_plan_id = props.view.query.workout_plan_id;
      if (!workout_plan_id) {
        return;
      }

      const r = await request.workout_plan.profile.run({ id: Number(workout_plan_id) });
      if (r.error) {
        props.app.tip({
          text: ["获取计划内容失败"],
        });
        return;
      }
      const { steps } = r.data;
      _steps = steps.map((step, idx) => {
        console.log(step);
        return {
          id: step.id,
          idx,
          sets: (() => {
            if (step.set_type === WorkoutPlanSetType.Normal) {
              //       actions[step.action.id] = true;
              const r1 = new Array(step.set_count).fill(0).map((_, index) => {
                return {
                  actions: [
                    {
                      id: Number(step.action.id),
                      zh_name: step.action.zh_name,
                      reps: step.reps,
                      weight: step.weight,
                    },
                  ],
                };
              });
              return r1;
            }
            if (step.set_type === WorkoutPlanSetType.Combo) {
              const r2 = new Array(step.set_count).fill(0).map((_, index) => {
                return {
                  actions: step.actions.map((act) => {
                    //     actions[act.action.id] = true;
                    return {
                      id: Number(act.action.id),
                      zh_name: act.action.zh_name,
                      reps: act.reps,
                      weight: act.weight,
                    };
                  }),
                };
              });
              return r2;
            }
            if (step.set_type === WorkoutPlanSetType.Free) {
              const r3 = step.sets3.map((set) => {
                return {
                  actions: set.actions.map((act) => {
                    //     actions[act.action.id] = true;
                    return {
                      id: Number(act.action.id),
                      zh_name: act.action.zh_name,
                      reps: act.reps,
                      weight: act.weight,
                    };
                  }),
                };
              });
              return r3;
            }
            return [];
          })(),
        };
      });
      _steps.forEach((step, a) => {
        step.sets.forEach((set, b) => {
          set.actions.forEach((action, c) => {
            const k = `${a}-${b}-${c}`;
            const pending_action = pending_workout_day?.data.find(
              (item) => item.step_idx === a && item.set_idx === b && item.act_idx === c
            );
            inputs.set(
              `reps.${k}`,
              new InputCore({ defaultValue: pending_action?.reps || "", placeholder: String(action.reps) })
            );
            inputs.set(
              `weight.${k}`,
              new InputCore({ defaultValue: pending_action?.weight || "", placeholder: action.weight })
            );
            inputs.set(`check.${k}`, new InputCore({ defaultValue: pending_action?.completed || false }));
            btns.set(
              `delete.${k}`,
              new ButtonCore({
                onClick() {
                  methods.handleDeleteAction({
                    step_idx: a,
                    set_idx: b,
                    act_idx: c,
                  });
                },
              })
            );
          });
        });
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeWorkoutDayUpdatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutDayUpdateViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div
          class="bg-white p-4 rounded-lg transition-all duration-300"
          style={{ transform: `translateY(${-state().height}px)` }}
        >
          {/* <div class="flex gap-2">
            <Button variant="subtle" store={vm.ui.$workout_action_dialog.ui.$show_btn}>
              添加训练动作
            </Button>
            <Button variant="subtle" store={vm.ui.$workout_plan_dialog_btn}>
              选择训练计划
            </Button>
            <Button variant="subtle" store={vm.ui.$start_btn}>
              开始计时
            </Button>
          </div> */}
          <div class="mt-4 space-y-8">
            <For each={state().steps}>
              {(step, a) => {
                return (
                  <div>
                    {/* <Button store={vm.ui.$workout_action_change_btn.bind({ id: step.id, idx: idx() })}>修改动作</Button> */}
                    <div class="mt-4 space-y-2">
                      <For each={step.sets}>
                        {(set, b) => {
                          return (
                            <div class="w-full">
                              <div
                                classList={{
                                  "bg-gray-100": state().cur_step_idx === a() && state().next_set_idx === b(),
                                }}
                                class="flex items-center gap-2 p-4 border rounded-md"
                              >
                                <div class="space-y-2">
                                  <For each={set.actions}>
                                    {(action, c) => {
                                      return (
                                        <div class="gap-2">
                                          <div
                                            onClick={() => {
                                              vm.methods.showWorkoutActionProfile(action.id);
                                            }}
                                          >
                                            {action.zh_name}
                                          </div>
                                          <div class="flex items-center gap-2 mt-2">
                                            <Show when={vm.ui.inputs.get(`reps.${a()}-${b()}-${c()}`)}>
                                              <div
                                                class="relative"
                                                onClick={(event) => {
                                                  const client = event.currentTarget.getBoundingClientRect();
                                                  vm.methods.beforeShowNumInput({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                    x: client.x,
                                                    y: client.y,
                                                  });
                                                  vm.methods.showNumInput({
                                                    key: `reps.${a()}-${b()}-${c()}`,
                                                    for: "reps",
                                                  });
                                                }}
                                              >
                                                <div class="absolute inset-0"></div>
                                                <Input
                                                  store={vm.ui.inputs.get(`reps.${a()}-${b()}-${c()}`)!}
                                                  class="w-[68px] border border-gray-300 rounded-md p-2"
                                                />
                                              </div>
                                            </Show>
                                            <Show when={vm.ui.inputs.get(`weight.${a()}-${b()}-${c()}`)}>
                                              <div
                                                class="relative"
                                                onClick={(event) => {
                                                  const client = event.currentTarget.getBoundingClientRect();
                                                  vm.methods.beforeShowNumInput({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                    x: client.x,
                                                    y: client.y,
                                                  });
                                                  vm.methods.showNumInput({
                                                    key: `weight.${a()}-${b()}-${c()}`,
                                                    for: "weight",
                                                  });
                                                }}
                                              >
                                                <div class="absolute inset-0"></div>
                                                <Input
                                                  store={vm.ui.inputs.get(`weight.${a()}-${b()}-${c()}`)!}
                                                  class="w-[68px] border border-gray-300 rounded-md p-2"
                                                />
                                              </div>
                                            </Show>
                                            <Show when={vm.ui.inputs.get(`check.${a()}-${b()}-${c()}`)}>
                                              <SetCompleteBtn
                                                store={vm.ui.inputs.get(`check.${a()}-${b()}-${c()}`)!}
                                                onClick={(event) => {
                                                  vm.methods.handleCompleteSet({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                  });
                                                }}
                                              />
                                              {/* <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                  console.log(e.target.checked);
                                                  vm.methods.handleCompleteSet({
                                                    idx: a(),
                                                    set_idx: b(),
                                                    checked: e.target.checked,
                                                  });
                                                }}
                                              /> */}
                                            </Show>
                                            <Show when={vm.ui.btns.get(`delete.${a()}-${b()}-${c()}`)}>
                                              <Button
                                                variant="subtle"
                                                store={vm.ui.btns.get(`delete.${a()}-${b()}-${c()}`)!}
                                              >
                                                删除
                                              </Button>
                                            </Show>
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </For>
                                </div>
                                {/* <div>
                                  <div class="h-[24px]"></div>
                                  <input
                                    class="mt-4"
                                    type="checkbox"
                                    onChange={(e) => {
                                      console.log(e.target.checked);
                                      vm.methods.handleCompleteSet({
                                        idx: a(),
                                        set_idx: b(),
                                        checked: e.target.checked,
                                      });
                                    }}
                                  />
                                  完成
                                </div> */}
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        {/* <div class="transition-all duration-300" style={{ transform: `translateY(${state().height}px)` }}></div> */}
      </ScrollView>
      <WorkoutActionSelectDialogView store={vm.ui.$workout_action_dialog} />
      <Sheet store={vm.ui.$weight_input_dialog} position="bottom" size="sm">
        <div class="w-screen border border-t-gray-200">
          <WeightInput store={vm.ui.$weight_input} />
        </div>
      </Sheet>
      <Presence store={vm.ui.$countdown_presence}>
        <div class="absolute left-1/2 bottom-10 -translate-x-1/2">
          <div class="flex items-center gap-2 bg-white p-4 rounded-lg">
            <Countdown store={vm.ui.$countdown} />
          </div>
        </div>
      </Presence>
      <div class="absolute right-4 bottom-10">
        <ToolsBar store={vm.ui.$tools}>
          <div class="flex items-center gap-2">
            <div class="px-4">30:50</div>
            <div class="px-4">结束</div>
          </div>
        </ToolsBar>
      </div>
      <Sheet store={vm.ui.$workout_action_profile_dialog} position="bottom" size="sm">
        <div class="relative w-screen min-h-[320px] border border-t-gray-200 bg-white">
          <Show when={state().loading}>
            <div class="absolute inset-0 flex items-center justify-center">
              <Loader class="w-8 h-8 animate-spin" />
            </div>
          </Show>
          <Show when={state().cur_workout_action}>
            <WorkoutActionCard {...state().cur_workout_action!} />
          </Show>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_confirm_complete} position="bottom" size="sm">
        <div class="w-screen min-h-[320px] border border-t-gray-200 bg-white">
          <div class="flex items-center justify-center">
            <div class="text-2xl">确定完成训练吗？</div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
