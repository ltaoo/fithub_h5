import { For, Match, Show, Switch } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Input } from "@/components/ui";
import { SetValueUnit } from "@/biz/set_value_input";
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

export function ActionInputViewModel(props: { defaultValue?: {} }) {
  const ui = {
    $input_set_count: new InputCore({ defaultValue: "3" }),
    $input_set_rest: new InputCore({ defaultValue: "90" }),
    $input_set_weight: new InputCore({ defaultValue: "RPE 6" }),
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
                defaultValue: "次",
                options: [
                  {
                    label: "次",
                    value: "次",
                  },
                  {
                    label: "秒",
                    value: "秒",
                  },
                  {
                    label: "分",
                    value: "分",
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
        actions: _set_actions,
        set_type: _type,
        set_count: ui.$input_set_count.value,
        set_rest_duration: ui.$input_set_rest.value,
        set_weight: ui.$input_set_weight.value,
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
        ui.$sets.append();
        // ui.$sets.showField("rest_duration");
      }
      if ([WorkoutPlanSetType.HIIT].includes(type)) {
        ui.$sets.showField("rest_duration");
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    setValue(value: { type?: WorkoutPlanSetType; actions: typeof _set_actions }) {
      console.log("[COMPONENT]action-input - setValue", value);
      if (value.type !== undefined) {
        _type = value.type;
        if ([WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(_type)) {
          ui.$sets.showField("rest_duration");
        }
        if ([WorkoutPlanSetType.HIIT].includes(_type)) {
          ui.$sets.showField("rest_duration");
        }
      }
      (() => {
        if ([WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(_type)) {
          return;
        }
        if ([WorkoutPlanSetType.Normal, WorkoutPlanSetType.Super].includes(_type)) {
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
            if (_type === WorkoutPlanSetType.Decreasing) {
              $input.fields.reps_unit.setValue("秒");
              $input.fields.rest_duration.show();
            }
            $input.setValue(node);
          }
        }
      })();
      _set_actions = value.actions;
      bus.emit(Events.Change, _state.value);
      bus.emit(Events.StateChange, { ..._state });
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
      <div class="z-10 relative inline-block">{props.name}</div>
      <div class="z-0 absolute left-2 -bottom-0 w-[110%] h-[8px] bg-blue-300"></div>
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
    reps_unit: SingleFieldCore<SelectCore<string>>;
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
              vm.ui.$sets.append();
              vm.refresh();
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
