/**
 * @file 训练计划创建/单个动作输入
 */
import { For, Match, Show, Switch } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select";

import { base, Handler } from "@/domains/base";
import { InputCore, SelectCore } from "@/domains/ui";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { FormInputInterface } from "@/domains/ui/formv2/types";
import { WorkoutActionType } from "@/biz/workout_action/constants";
import { getSetValueUnit, RepsSetValueOptions, SetValueUnit, WeightSetValueOptions } from "@/biz/input_set_value";
import {
  WorkoutPlanSetType,
  WorkoutPlanSetTypeOptions,
  WorkoutPlanStepTypeTextMap,
  WorkoutSetTypeTextMap,
} from "@/biz/workout_plan/constants";
import { WeightInputModel } from "@/biz/input_with_keyboard/input_weight";
import { RepsInputModel } from "@/biz/input_with_keyboard/input_reps";
import { RestInputModel } from "@/biz/input_with_keyboard/input_rest";
import { InputWithKeyboardModel } from "@/biz/input_with_keyboard";
import { diff, diff2 } from "@/utils/diff";

import { SetValueArrayField, SetValueField } from "./field";
import { WeightInputView } from "./input-weight";
import { RepsInputView } from "./input-reps";
import { NumInputView } from "./input-num";
import { RestInputView } from "./input-rest";

export function DefaultSetValue(action: { id: number; zh_name: string }) {
  return {
    set_type: WorkoutPlanSetType.Normal,
    set_count: "3",
    set_rest_duration: {
      num: "90",
      unit: getSetValueUnit("秒"),
    },
    set_weight: {
      num: "6",
      unit: getSetValueUnit("RPE"),
    },
    set_note: "",
    // set_tags: [],
    actions: [
      {
        action,
        reps: {
          num: "12",
          unit: getSetValueUnit("次"),
        },
        weight: {
          num: "12",
          unit: getSetValueUnit("RM"),
        },
        rest_duration: {
          num: "30",
          unit: getSetValueUnit("秒"),
        },
      },
    ],
  };
}

function WorkoutActionInput() {
  let _value: { id: number; zh_name: string } | null = null;
  let _state = {
    get value() {
      return _value;
    },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: { id: number; zh_name: string } | null;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "input" as const,
    state: _state,
    get defaultValue() {
      return null;
    },
    get value() {
      return _state.value;
    },
    setValue(v: { id: number; zh_name: string }) {
      _value = v;
      bus.emit(Events.Change, _value);
      bus.emit(Events.StateChange, { ..._state });
    },
    ready() {},
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
type WorkoutActionInput = ReturnType<typeof WorkoutActionInput>;

export function StepInputViewModel(props: {
  defaultValue?: {};
  app: ViewComponentProps["app"];
  onChange?: () => void;
}) {
  const ui = {
    $form: new ObjectFieldCore({
      fields: {
        set_type: new SingleFieldCore({
          label: "类型",
          input: new SelectCore({ defaultValue: WorkoutPlanSetType.Normal, options: WorkoutPlanSetTypeOptions }),
        }),
        set_count: new SingleFieldCore({
          label: "组数",
          input: InputWithKeyboardModel({
            defaultValue: "3",
            app: props.app,
            onPaddingHeightChange(v) {
              props.app.setHeight(v);
            },
          }),
        }),
        set_rest_duration: new SingleFieldCore({
          label: "组间歇",
          input: RestInputModel({ defaultValue: "90", suffix: getSetValueUnit("秒"), app: props.app }),
        }),
        set_weight: new SingleFieldCore({
          label: "强度",
          input: WeightInputModel({ defaultValue: "6", suffix: getSetValueUnit("RPE"), app: props.app }),
        }),
        set_note: new SingleFieldCore({
          label: "备注",
          input: new InputCore({ defaultValue: "", placeholder: "该动作的额外说明或注意事项" }),
        }),
        actions: new ArrayFieldCore({
          field() {
            return new ObjectFieldCore({
              fields: {
                action: new SingleFieldCore({
                  label: "动作",
                  name: "action",
                  input: WorkoutActionInput(),
                }),
                reps: new SingleFieldCore({
                  label: "计数",
                  name: "reps",
                  input: RepsInputModel({ defaultValue: "12", suffix: getSetValueUnit("次"), app: props.app }),
                }),
                weight: new SingleFieldCore({
                  label: "阻力",
                  name: "weight",
                  input: WeightInputModel({ defaultValue: "12", suffix: getSetValueUnit("RM"), app: props.app }),
                }),
                rest_duration: new SingleFieldCore({
                  label: "间歇",
                  name: "rest_duration",
                  hidden: true,
                  input: RestInputModel({ defaultValue: "30", suffix: getSetValueUnit("秒"), app: props.app }),
                }),
              },
            });
          },
        }),
      },
    }),
  };

  type SetAction = {
    /** 动作 */
    action: {
      id: number;
      zh_name: string;
    };
    /** 计数 */
    reps: {
      num: string;
      unit: SetValueUnit;
    };
    /** 计数单位 */
    // reps_unit: SetValueUnit;
    /** 阻力，有多种情况，可以是 50%1RM/12RM/RPE 6/RIR 2/自重/无 等等 */
    weight: {
      num: string;
      unit: SetValueUnit;
    };
    // weight_unit: SetValueUnit;
    /** 动作间隔休息时间 */
    rest_duration: {
      num: string;
      unit: SetValueUnit;
    };
  };
  // let _type: WorkoutPlanSetType = WorkoutPlanSetType.Normal;
  // let _set_actions: {
  //   /** 动作 */
  //   action: {
  //     id: number;
  //     zh_name: string;
  //   };
  //   /** 计数 */
  //   reps: {
  //     num: string;
  //     unit: SetValueUnit;
  //   };
  //   /** 计数单位 */
  //   // reps_unit: SetValueUnit;
  //   /** 阻力，有多种情况，可以是 50%1RM/12RM/RPE 6/RIR 2/自重/无 等等 */
  //   weight: {
  //     num: string;
  //     unit: SetValueUnit;
  //   };
  //   // weight_unit: SetValueUnit;
  //   /** 动作间隔休息时间 */
  //   rest_duration: {
  //     num: string;
  //     unit: SetValueUnit;
  //   };
  // }[] = [];

  let _state = {
    get value() {
      // return {
      //   /** 组内动作 */
      //   actions: _set_actions,
      //   /** 组类型 */
      //   set_type: _type,
      //   /** 组数 */
      //   set_count: ui.$input_set_count.value,
      //   /** 组间歇 */
      //   set_rest_duration: ui.$input_set_rest.value,
      //   /** 组负荷，一般用于 HIIT */
      //   set_weight: ui.$input_set_weight.value,
      //   set_weight_unit: ui.$input_set_weight_unit.value,
      //   /** 动作说明 */
      //   set_note: ui.$input_set_remark.value,
      // };
      return ui.$form.value;
    },
    get type() {
      return ui.$form.fields.set_type.input.value ?? WorkoutPlanSetType.Normal;
    },
    get action() {
      return ui.$form.fields.actions.value[0] ?? null;
    },
    get actions() {
      return ui.$form.fields.actions.value;
    },
    // get fields() {
    //   return ui.$sets.state.fields;
    // },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: (typeof _state)["value"];
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  // ui.$form.fields.actions.onChange(async (changed) => {
  //   // console.log("[COMPONENT]workout_plan/component/action-input", changed);
  //   const field = ui.$form.fields.actions.mapFieldWithIndex(changed.idx);
  //   if (field) {
  //     const r = await field.field.validate();
  //     if (r.data) {
  //       const value = r.data;
  //       _set_actions[changed.idx].reps = value.reps;
  //       // _set_actions[changed.idx].reps_unit = value.reps.unit;
  //       _set_actions[changed.idx].weight = value.weight;
  //       // _set_actions[changed.idx].weight_unit = value.weight.unit;
  //     }
  //   }
  //   bus.emit(Events.Change, _state.value);
  // });
  ui.$form.onChange(() => {
    // console.log("[COMPONENT]workout_plan/component/action-input");
    bus.emit(Events.Change, _state.value);
  });

  return {
    shape: "input" as const,
    ui,
    state: _state,
    get defaultValue() {
      return props.defaultValue;
    },
    get value() {
      return _state.value;
    },
    // get actions() {
    //   return _set_actions;
    // },
    setType(type: WorkoutPlanSetType) {
      const actions = ui.$form.fields.actions.value;
      console.log("[COMPONENT]action-input - setType", type, actions);
      ui.$form.fields.set_type.setValue(type);
      if ([WorkoutPlanSetType.Normal].includes(type)) {
        const existing = ui.$form.fields.actions.value;
        ui.$form.fields.actions.setValue([existing[0]]);
        ui.$form.fields.actions.hideField("rest_duration");
      }
      if ([WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(type)) {
        const existing = ui.$form.fields.actions.value;
        ui.$form.fields.actions.setValue([existing[0]]);
        this.appendSet();
        ui.$form.fields.actions.hideField("rest_duration");
      }
      if ([WorkoutPlanSetType.Super].includes(type)) {
        const existing = ui.$form.fields.actions.value;
        ui.$form.fields.actions.setValue([existing[0]]);
        ui.$form.fields.actions.hideField("rest_duration");
        ui.$form.fields.actions.setFieldValue("reps", {
          num: "12",
          unit: getSetValueUnit("次"),
        });
      }
      if ([WorkoutPlanSetType.HIIT].includes(type)) {
        const existing = ui.$form.fields.actions.value;
        ui.$form.fields.actions.setValue([existing[0]]);
        ui.$form.fields.actions.showField("rest_duration");
        ui.$form.fields.actions.setFieldValue("reps", {
          num: "30",
          unit: getSetValueUnit("秒"),
        });
        // _set_actions = _set_actions.map((act) => {
        //   return {
        //     action: act.action,
        //     reps: {
        //       num: "30",
        //       unit: getSetValueUnit("秒"),
        //     },
        //     weight: act.weight,
        //     rest_duration: act.rest_duration,
        //   };
        // });
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    setValue(value: {
      type?: WorkoutPlanSetType;
      set_count?: string;
      set_rest_duration?: { num: string; unit: SetValueUnit };
      set_weight?: { num: string; unit: SetValueUnit };
      set_note?: string;
      actions: SetAction[];
    }) {
      // const existing_actions = ui.$form.fields.
      if (value.set_count) {
        ui.$form.fields.set_count.setValue(value.set_count);
      }
      if (value.set_rest_duration) {
        ui.$form.fields.set_rest_duration.setValue(value.set_rest_duration);
      }
      if (value.set_weight) {
        ui.$form.fields.set_weight.setValue(value.set_weight);
      }
      if (value.set_note) {
        ui.$form.fields.set_note.setValue(value.set_note);
      }
      let type = ui.$form.fields.set_type.input.value;
      // console.log("[COMPONENT]action-input - setValue", value);
      if (type && value.type) {
        type = value.type;
        if ([WorkoutPlanSetType.HIIT].includes(type)) {
          ui.$form.fields.actions.showField("rest_duration");
        }
      }
      (() => {
        // if ([WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(_type)) {
        //   return;
        // }
        if (type && [WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(type)) {
          const set_actions: { action: { id: number } }[] = [];
          for (let i = 0; i < ui.$form.fields.actions.value.length; i += 1) {
            const a = ui.$form.fields.actions.value[i];
            if (a.action) {
              set_actions.push({
                action: a.action,
              });
            }
          }
          const { nodes_added, nodes_removed, nodes_updated } = diff2(set_actions, value.actions);
          // console.log("[COMPONENT]action-input - setValue diff", nodes_updated);
          for (let i = 0; i < nodes_updated.length; i += 1) {
            const node = nodes_updated[i];
            const field = ui.$form.fields.actions.fields.find((f) => {
              // console.log("[COMPONENT]action-input - setValue walk $sets.fields", f.id, f.field.value);
              return f.field.value.action?.id === node.action.id;
            });
            if (field) {
              field.field.setValue(
                {
                  action: node,
                },
                { key: "action" }
              );
            }
          }
          for (let i = 0; i < nodes_removed.length; i += 1) {
            const node = nodes_removed[i];
            const field = ui.$form.fields.actions.fields.find((f) => f.field.value.action?.id === node.action.id);
            if (field) {
              ui.$form.fields.actions.remove(field.id);
            }
          }
          for (let i = 0; i < nodes_added.length; i += 1) {
            const node = nodes_added[i];
            const $input = ui.$form.fields.actions.append();
            if ([WorkoutPlanSetType.HIIT].includes(type)) {
              // $input.fields.reps_unit.setValue("秒");
              $input.fields.reps.setValue({
                num: "30",
                unit: getSetValueUnit("秒"),
              });
              $input.fields.rest_duration.show();
              // $input.fields.rest_duration.setValue("30");
            }
            $input.setValue(node);
          }
        }
      })();
      // _set_actions = value.actions;
      bus.emit(Events.Change, _state.value);
      bus.emit(Events.StateChange, { ..._state });
    },
    setRemark(v: string) {
      ui.$form.fields.set_note.setValue(v);
    },
    /** 递增递减组增加组 */
    appendSet() {
      const set_actions = ui.$form.fields.actions.value;
      const $first = ui.$form.fields.actions.fields[0];
      const idx = set_actions.length;
      const prev_weight = $first.field.value.weight;
      const value_weight = {
        num: prev_weight.num,
        unit: prev_weight.unit,
      };
      const next_reps = $first.field.value.reps;
      const next_weight = (() => {
        if (value_weight.unit === getSetValueUnit("RM")) {
          return {
            num: String(Number(value_weight.num) * (idx + 1)),
            unit: value_weight.unit,
          };
        }
        if (value_weight.unit === getSetValueUnit("%1RM")) {
          return {
            num: String(Number(value_weight.num) - (idx + 1) * 5),
            unit: value_weight.unit,
          };
        }
        return value_weight;
      })();
      const created = {
        action: set_actions[0].action,
        reps: next_reps,
        weight: next_weight,
        rest_duration: $first.field.value.rest_duration,
        note: "",
      };
      const $created = ui.$form.fields.actions.append();
      $created.setValue(created);
      bus.emit(Events.Change, _state.value);
      this.refresh();
    },
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type StepInputViewModel = ReturnType<typeof StepInputViewModel>;

function WorkoutActionNameView(props: { name?: string }) {
  return (
    <div class="relative inline-block">
      <div class="absolute top-1/2 -left-2 -bottom-0 -translate-y-1/2 w-[4px] h-[18px] bg-blue-500"></div>
      <div class="relative left-[4px] text-w-fg-0">{props.name}</div>
    </div>
  );
}

function WorkoutActionInputView(props: { store: WorkoutActionInput }) {
  const [state, vm] = useViewModelStore(props.store);
  return (
    <Show when={state().value} fallback={<div>选择动作</div>}>
      <WorkoutActionNameView name={state().value?.zh_name} />
    </Show>
  );
}

function SetActionInputView(props: {
  type: WorkoutPlanSetType;
  store: ObjectFieldCore<{
    action: SingleFieldCore<WorkoutActionInput>;
    reps: SingleFieldCore<RepsInputModel>;
    weight: SingleFieldCore<WeightInputModel>;
    rest_duration: SingleFieldCore<RestInputModel>;
  }>;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <Show when={[WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(props.type)}>
        <WorkoutActionInputView store={props.store.fields.action.input} />
      </Show>
      <div class="flex items-center gap-2">
        <SetValueField store={vm.fields.reps}>
          <RepsInputView store={vm.fields.reps} />
        </SetValueField>
        {/* <SetValueField store={vm.fields.reps_unit}>
          <Select store={vm.fields.reps_unit.input} />
        </SetValueField> */}
        <SetValueField store={vm.fields.weight}>
          <WeightInputView store={vm.fields.weight} />
        </SetValueField>
        {/* <SetValueField store={vm.fields.weight_unit}>
          <Select store={vm.fields.weight_unit.input} />
        </SetValueField> */}
        {/* <For each={state().fields}>
          {(field) => {
            if (field.name === "action") {
              return null;
            }
            if (field.hidden) {
              return null;
            }
            const $inner = props.store.mapFieldWithName(field.name);
            if (!$inner) {
              return null;
            }
            return (
              <div class="mt-2">
                <div class="text-sm text-w-fg-2">{field.label}</div>
                <Switch>
                  <Match when={$inner.symbol === "SingleFieldCore"}>
                    {(() => {
                      // @ts-ignore
                      const $input = $inner.input as FormInputInterface;
                      if ($input.shape === "input") {
                        return <Input store={$input} />;
                      }
                      if ($input.shape === "select") {
                        return <Select store={$input} />;
                      }
                      return null;
                    })()}
                  </Match>
                </Switch>
              </div>
            );
          }}
        </For> */}
      </div>
    </div>
  );
}

export function ActionInput(props: {
  store: StepInputViewModel;
  onShowActionSelect?: (arg: { type: "add_action" | "change_action" }) => void;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="relative p-4">
      <div class="absolute left-3 -top-4">
        <div class="text-sm p-1 text-w-fg-1">
          <div>{WorkoutSetTypeTextMap[state().type]}</div>
        </div>
      </div>
      <Show when={[WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(state().type)}>
        <Show when={state().action}>
          <WorkoutActionNameView name={state().action?.action?.zh_name} />
        </Show>
      </Show>
      <SetValueArrayField
        classList={{
          actions: true,
          "space-y-4": ![WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(state().type),
        }}
        store={vm.ui.$form.fields.actions}
        render={(field) => {
          return (
            <div>
              <Show
                when={[WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(
                  state().type
                )}
              >
                <WorkoutActionInputView store={field.fields.action.input} />
              </Show>
              <div class="flex items-center gap-2">
                <SetValueField store={field.fields.reps}>
                  <RepsInputView store={field.fields.reps} />
                </SetValueField>
                <SetValueField store={field.fields.weight}>
                  <WeightInputView store={field.fields.weight} />
                </SetValueField>
                <SetValueField store={field.fields.rest_duration}>
                  <RestInputView store={field.fields.rest_duration} />
                </SetValueField>
              </div>
            </div>
          );
        }}
      ></SetValueArrayField>
      <Show when={[WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(state().type)}>
        <div class="flex justify-center my-4">
          <div
            class="inline-block px-2 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-xl text-sm text-w-fg-1"
            onClick={() => {
              if (props.onShowActionSelect) {
                props.onShowActionSelect({ type: "add_action" });
              }
            }}
          >
            新增动作
          </div>
        </div>
      </Show>
      <Show when={[WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(state().type)}>
        <div class="flex justify-center my-4">
          <div
            class="inline-block px-2 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-xl text-sm text-w-fg-1"
            onClick={() => {
              vm.appendSet();
            }}
          >
            新增组
          </div>
        </div>
      </Show>
      <div class="flex items-center gap-2">
        <SetValueField store={vm.ui.$form.fields.set_count}>
          <NumInputView store={vm.ui.$form.fields.set_count}></NumInputView>
        </SetValueField>
        <SetValueField store={vm.ui.$form.fields.set_rest_duration}>
          <RepsInputView store={vm.ui.$form.fields.set_rest_duration}></RepsInputView>
        </SetValueField>
        <Show when={[WorkoutPlanSetType.HIIT].includes(state().type)}>
          <SetValueField store={vm.ui.$form.fields.set_weight}>
            <WeightInputView store={vm.ui.$form.fields.set_weight}></WeightInputView>
          </SetValueField>
        </Show>
      </div>
    </div>
  );
}
