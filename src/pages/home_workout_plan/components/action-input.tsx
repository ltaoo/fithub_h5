import { For, Match, Show, Switch } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Input } from "@/components/ui";
import { getSetValueUnit, SetValueUnit } from "@/biz/set_value_input";
import { base, Handler } from "@/domains/base";
import { InputCore, SelectCore } from "@/domains/ui";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { Select } from "@/components/ui/select";
import { FormInputInterface } from "@/domains/ui/formv2/types";
import { diff, diff2 } from "@/utils/diff";
import { WorkoutActionType } from "@/biz/workout_action/constants";
import { WorkoutPlanSetType, WorkoutPlanStepTypeTextMap, WorkoutSetTypeTextMap } from "@/biz/workout_plan/constants";

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
      return _value;
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

export function ActionInputViewModel(props: { defaultValue?: {}; onChange?: () => void }) {
  const ui = {
    $input_set_count: new InputCore({ defaultValue: "3" }),
    $input_set_rest: new InputCore({ defaultValue: "90" }),
    $input_set_weight: new InputCore({ defaultValue: "RPE 6" }),
    $input_set_note: new InputCore({ defaultValue: "" }),
    //  new InputCore({
    //       defaultValue: "3",
    //     })
    //     $inputs_reps: new Map<string, InputCore<string>>(),
    //     new InputCore({
    //       defaultValue: "12",
    //     }),
    //     $inputs_weight: new Map<string, InputCore<string>>(),
    //     new InputCore({
    //       defaultValue: "12RM",
    //     }),
    $sets: new ArrayFieldCore({
      label: "",
      name: "",
      field(count) {
        return new ObjectFieldCore({
          label: "",
          name: "",
          fields: {
            action: new SingleFieldCore({
              label: "动作",
              name: "action",
              input: WorkoutActionInput(),
            }),
            reps: new SingleFieldCore({
              label: "计数",
              name: "reps",
              input: new InputCore({ defaultValue: "12" }),
            }),
            reps_unit: new SingleFieldCore({
              label: "计数单位",
              name: "reps_unit",
              input: new SelectCore({
                defaultValue: getSetValueUnit("次"),
                options: [
                  {
                    label: "次",
                    value: getSetValueUnit("次"),
                  },
                  {
                    label: "秒",
                    value: getSetValueUnit("秒"),
                  },
                  {
                    label: "分",
                    value: getSetValueUnit("分"),
                  },
                  {
                    label: "千米",
                    value: getSetValueUnit("千米"),
                  },
                  {
                    label: "米",
                    value: getSetValueUnit("米"),
                  },
                ],
              }),
            }),
            weight: new SingleFieldCore({
              label: "阻力",
              name: "weight",
              input: new InputCore({ defaultValue: "12RM" }),
            }),
            rest_duration: new SingleFieldCore({
              label: "间歇",
              name: "rest_duration",
              hidden: true,
              input: new InputCore({ defaultValue: "0" }),
            }),
          },
        });
      },
    }),
  };

  let _type: WorkoutPlanSetType = WorkoutPlanSetType.Normal;
  let _set_actions: {
    /** 动作 */
    action: {
      id: number;
      zh_name: string;
    };
    /** 计数 */
    reps: number;
    /** 计数单位 */
    reps_unit: SetValueUnit;
    /** 阻力，有多种情况，可以是 50%1RM/12RM/RPE 6/RIR 2/自重/无 等等 */
    weight: string;
    /** 动作间隔休息时间 */
    rest_duration: number;
  }[] = [];

  let _state = {
    get type(): WorkoutPlanSetType {
      return _type;
    },
    get value() {
      return {
        /** 组内动作 */
        actions: _set_actions,
        /** 组类型 */
        set_type: _type,
        /** 组数 */
        set_count: ui.$input_set_count.value,
        /** 组间歇 */
        set_rest_duration: ui.$input_set_rest.value,
        /** 组负荷，一般用于 HIIT */
        set_weight: ui.$input_set_weight.value,
        /** 动作说明 */
        set_note: ui.$input_set_note.value,
      };
    },
    get action() {
      return _set_actions[0] ?? null;
    },
    get actions() {
      return _set_actions;
    },
    get fields() {
      return ui.$sets.state.fields;
    },
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

  ui.$sets.onChange(async (changed) => {
    const field = ui.$sets.mapFieldWithIndex(changed.idx);
    if (field) {
      const r = await field.field.validate();
      if (r.data) {
        const value = r.data;
        _set_actions[changed.idx].reps = Number(value.reps);
        _set_actions[changed.idx].reps_unit = value.reps_unit!;
        _set_actions[changed.idx].weight = value.weight;
      }
    }
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
    get type() {
      return _type;
    },
    get actions() {
      return _set_actions;
    },
    setType(type: WorkoutPlanSetType) {
      _type = type;
      if ([WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(type)) {
        this.appendSet();
        return;
      }
      if ([WorkoutPlanSetType.HIIT].includes(type)) {
        ui.$sets.showField("rest_duration");
        ui.$sets.setFieldValue("reps_unit", getSetValueUnit("秒"));
        ui.$sets.setFieldValue("reps", "30");
        _set_actions = _set_actions.map((act) => {
          return {
            action: act.action,
            reps: 30,
            reps_unit: getSetValueUnit("秒"),
            weight: act.weight,
            rest_duration: act.rest_duration,
          };
        });
      } else {
        ui.$sets.hideField("rest_duration");
        ui.$sets.setFieldValue("reps_unit", "次");
        ui.$sets.setFieldValue("reps", "12");
        _set_actions = _set_actions.map((act) => {
          return {
            action: act.action,
            reps: 12,
            reps_unit: getSetValueUnit("次"),
            weight: act.weight,
            rest_duration: act.rest_duration,
          };
        });
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    setValue(value: { type?: WorkoutPlanSetType; actions: typeof _set_actions }) {
      console.log("[COMPONENT]action-input - setValue", value);
      if (value.type !== undefined) {
        _type = value.type;
        if ([WorkoutPlanSetType.HIIT].includes(_type)) {
          ui.$sets.showField("rest_duration");
        }
      }
      (() => {
        // if ([WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(_type)) {
        //   return;
        // }
        if ([WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(_type)) {
          const { nodes_added, nodes_removed, nodes_updated } = diff2(_set_actions, value.actions);
          console.log("[COMPONENT]action-input - setValue diff", nodes_updated);
          for (let i = 0; i < nodes_updated.length; i += 1) {
            const node = nodes_updated[i];
            const field = ui.$sets.fields.find((f) => {
              console.log("[COMPONENT]action-input - setValue walk $sets.fields", f.id, f.field.value);
              return f.field.value.action?.id === node.action.id;
            });
            if (field) {
              field.field.setValue(
                {
                  actions: value.actions,
                },
                { key: "actions" }
              );
              //     field.field.$input.setValue(value.actions[i]);
            }
          }
          for (let i = 0; i < nodes_removed.length; i += 1) {
            const node = nodes_removed[i];
            const field = ui.$sets.fields.find((f) => f.field.value.action?.id === node.action.id);
            if (field) {
              ui.$sets.remove(field.id);
            }
          }
          for (let i = 0; i < nodes_added.length; i += 1) {
            const node = nodes_added[i];
            const $input = ui.$sets.append();
            if ([WorkoutPlanSetType.HIIT].includes(_type)) {
              $input.fields.reps_unit.setValue("秒");
              $input.fields.reps.setValue("30");
              $input.fields.rest_duration.show();
              // $input.fields.rest_duration.setValue("30");
            }
            $input.setValue(node);
          }
        }
      })();
      _set_actions = value.actions;
      bus.emit(Events.Change, _state.value);
      bus.emit(Events.StateChange, { ..._state });
    },
    /** 递增递减组增加组 */
    appendSet() {
      const $first = ui.$sets.fields[0];
      const $created = ui.$sets.append();
      const idx = _set_actions.length;
      const prev_weight = $first.field.value.weight;
      const value_weight = ((): { type: "RM" | "%1RM" | "RIR" | "RPE" | "unknown"; v: string } => {
        const r1 = prev_weight.match(/([0-9]{1,})([rR][mM])/);
        if (r1) {
          return { type: "RM", v: r1[1] };
        }
        const r2 = prev_weight.match(/([0-9]{1,})(%1[rR][mM])/);
        if (r2) {
          return { type: "%1RM", v: r2[1] };
        }
        const r3 = prev_weight.match(/([0-9]{1,})([rR][iI][rR])/);
        if (r3) {
          return { type: "RIR", v: r3[1] };
        }
        const r4 = prev_weight.match(/([0-9]{1,})([rR][pP][eE])/);
        if (r4) {
          return { type: "RPE", v: r4[1] };
        }
        return { type: "unknown", v: prev_weight };
      })();
      const next_reps = Number($first.field.value.reps) * (idx + 1);
      const next_weight = (() => {
        if (value_weight.type === "RM") {
          return Number(value_weight.v) * (idx + 1) + "RM";
        }
        if (value_weight.type === "%1RM") {
          return Number(value_weight.v) - (idx + 1) * 5 + "%1RM";
        }
        return value_weight.v;
      })();
      const created = {
        action: _set_actions[0].action,
        reps: next_reps,
        reps_unit: $first.field.value.reps_unit as SetValueUnit,
        weight: next_weight,
        rest_duration: Number($first.field.value.rest_duration),
        note: "",
      };
      _set_actions = [..._set_actions, created];
      $created.fields.reps.setValue(String(next_reps));
      $created.fields.weight.setValue(next_weight);
      bus.emit(Events.Change, _state.value);
      this.refresh();
    },
    refresh() {
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
export type ActionInputViewModel = ReturnType<typeof ActionInputViewModel>;

function WorkoutActionNameView(props: { name?: string }) {
  return (
    <div class="relative inline-block">
      <div class="absolute left-2 -bottom-0 w-[110%] h-[8px] bg-blue-300"></div>
      <div class="relative inline-block">{props.name}</div>
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

function SetActionView(props: {
  type: WorkoutPlanSetType;
  store: ObjectFieldCore<{
    action: SingleFieldCore<WorkoutActionInput>;
    reps: SingleFieldCore<InputCore<string>>;
    reps_unit: SingleFieldCore<SelectCore<SetValueUnit>>;
    weight: SingleFieldCore<InputCore<string>>;
    rest_duration: SingleFieldCore<InputCore<string>>;
  }>;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <Show when={[WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(props.type)}>
        <WorkoutActionInputView store={props.store.fields.action.input} />
      </Show>
      <div class="flex items-center gap-2">
        <For each={state().fields}>
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
              <div>
                <div class="text-sm text-gray-600">{field.label}</div>
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
        </For>
      </div>
    </div>
  );
}

export function ActionInput(props: {
  store: ActionInputViewModel;
  onShowActionSelect?: (arg: { type: "add_action" | "change_action" }) => void;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="relative p-4">
      <div class="absolute left-3 -top-4">
        <div class="text-sm bg-white p-1">
          <div>{WorkoutSetTypeTextMap[state().type] || "未知"}</div>
        </div>
      </div>
      <Show when={[WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(state().type)}>
        <Show when={state().action}>
          <WorkoutActionNameView name={state().action?.action.zh_name} />
        </Show>
      </Show>
      <div class="space-y-1">
        <For each={state().fields}>
          {(field, index) => {
            const $inner = vm.ui.$sets.mapFieldWithIndex(index());
            if (!$inner) {
              return null;
            }
            return (
              <Switch>
                <Match when={$inner.field.symbol === "ObjectFieldCore"}>
                  <SetActionView store={$inner.field} type={state().type} />
                </Match>
              </Switch>
            );
          }}
        </For>
      </div>
      <Show when={[WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(state().type)}>
        <div class="flex justify-center mt-2">
          <div
            class="inline-block px-2 py-1 border rounded"
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
        <div class="flex justify-center mt-2">
          <div
            class="inline-block px-2 py-1 border rounded"
            onClick={() => {
              vm.appendSet();
            }}
          >
            新增组
          </div>
        </div>
      </Show>
      <div class="absolute right-4 -bottom-8 bg-white">
        <div class="flex gap-2">
          <div class="w-[45px]">
            <Input store={vm.ui.$input_set_count} />
          </div>
          <div class="w-[45px]">
            <Input store={vm.ui.$input_set_rest} />
          </div>
          <Show when={[WorkoutPlanSetType.HIIT].includes(state().type)}>
            <div class="w-[88px]">
              <Input store={vm.ui.$input_set_weight} />
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
