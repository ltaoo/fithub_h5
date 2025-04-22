/**
 * @file 创建训练计划
 */
import { For, Show, Switch, Match } from "solid-js";
import { ArrowDown, ArrowUp, Loader, MoreHorizontal, Trash } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Dialog, DropdownMenu, Input, ListView, ScrollView, Textarea } from "@/components/ui";
import { WorkoutPlanPreviewCard } from "@/components/workout-plan-share-card";
import { WorkoutActionSelect2View } from "@/components/workout-action-select2";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";
import { WorkoutPlanPreviewPayload, WorkoutPlanStepBody } from "@/biz/workout_plan/types";
import { createWorkoutPlan } from "@/biz/workout_plan/services";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { WorkoutActionType } from "@/biz/workout_action/constants";
import { WorkoutPlanSetType, WorkoutPlanStepType } from "@/biz/workout_plan/constants";
import { Result } from "@/domains/result";
import { SetValueUnit } from "@/biz/set_value_input";
import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { RefCore } from "@/domains/ui/cur";
import { ButtonCore, DialogCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { seconds_to_hour, seconds_to_hour_with_template } from "@/utils";

import { WorkoutPlanValuesView } from "./workout_plan_values";
import { ActionInput, ActionInputViewModel } from "./components/action-input";
import { WorkoutPlanEditorViewModel } from "./model";

function HomeWorkoutPlanCreateViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      create: new RequestCore(createWorkoutPlan, { client: props.client }),
    },
  };
  const methods = {
    calc_estimated_duration(
      v: { set_count: string; set_rest_duration: string; actions: { reps: number; reps_unit: SetValueUnit }[] }[]
    ) {
      const actions = v;
      let duration = 0;
      for (let i = 0; i < actions.length; i += 1) {
        const set = actions[i];
        let set_duration = Number(set.set_rest_duration);
        for (let j = 0; j < set.actions.length; j += 1) {
          const act = set.actions[j];
          const reps = act.reps;
          const reps_unit = act.reps_unit;
          if (reps_unit === "秒") {
            set_duration += Number(reps);
          }
          if (reps_unit === "分") {
            set_duration += Number(reps) * 60;
          }
          if (reps_unit === "次") {
            // 一次大概是 6s
            set_duration += Number(reps) * 6;
          }
        }
        duration += set_duration * Number(set.set_count);
      }
      // console.log("[PAGE]workout_plan/create - estimated duration", duration);
      const text = seconds_to_hour_with_template(duration, {
        hours(v: number) {
          return `${v}小时`;
        },
        minutes(v: number, v2) {
          return `${v2}分钟`;
        },
        seconds(v: number) {
          return "";
        },
      });
      ui.$input_duration.setValue(text);
      return duration;
    },
    async submit() {
      const r = await ui.$input_actions.validate();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const value_actions = r.data;
      console.log("[PAGE]workout_plan/create submit", value_actions);
      if (value_actions.length === 0) {
        props.app.tip({
          text: ["请至少选择一个动作"],
        });
        return;
      }
      const value_title = ui.$input_title.value;
      const value_overview = ui.$input_overview.value;
      const value_estimated_duration = methods.calc_estimated_duration(value_actions);
      if (!value_title) {
        props.app.tip({
          text: ["请输入计划名称"],
        });
        return;
      }
      const muscle_ids: Record<number, boolean> = {};
      const equipment_ids: Record<number, boolean> = {};
      for (let i = 0; i < value_actions.length; i += 1) {
        for (let j = 0; j < value_actions[i].actions.length; j += 1) {
          const act = value_actions[i].actions[j];
          const profile = _action_profiles[act.action.id];
          if (profile) {
            profile.muscles.forEach((m) => (muscle_ids[m.id] = true));
            profile.equipments.forEach((m) => (equipment_ids[m.id] = true));
          }
        }
      }
      const body = {
        title: value_title,
        overview: value_overview,
        tags: "",
        level: 5,
        details: JSON.stringify(value_actions),
        steps: (() => {
          const result: WorkoutPlanStepBody[] = [];
          for (let i = 0; i < value_actions.length; i += 1) {
            const set_value = value_actions[i];
            const actions: WorkoutPlanStepBody["actions"] = [];
            for (let j = 0; j < set_value.actions.length; j += 1) {
              const act = value_actions[i].actions[j];
              actions.push({
                set_idx: i + 1,
                idx: j + 1,
                action_id: act.action.id,
                reps: act.reps,
                unit: act.reps_unit,
                weight: act.weight,
                rest_duration: act.rest_duration,
                note: "",
              });
            }
            result.push({
              title: "",
              idx: i + 1,
              type: WorkoutPlanStepType.Strength,
              set_type: set_value.set_type,
              set_count: Number(set_value.set_count),
              set_rest_duration: Number(set_value.set_rest_duration),
              set_weight: set_value.set_weight,
              actions,
              note: "",
            });
          }
          return result;
        })(),
        points: "",
        suggestions: "",
        muscle_ids: Object.keys(muscle_ids).join(","),
        equipment_ids: Object.keys(equipment_ids).join(","),
        estimated_duration: value_estimated_duration,
      };
      const r2 = await request.workout_plan.create.run(body);
      if (r2.error) {
        props.app.tip({
          text: [r2.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["创建成功"],
      });
      // props.history.back();
    },
    cancel() {
      props.history.back();
    },
  };
  const $model = WorkoutPlanEditorViewModel(props);
  const ui = {
    $view: new ScrollViewCore(),
    $input_title: new InputCore({
      defaultValue: "",
    }),
    $input_overview: new InputCore({
      defaultValue: "",
    }),
    $input_actions: new ArrayFieldCore({
      label: "actions",
      name: "",
      field(count) {
        return new SingleFieldCore({
          label: "",
          name: "",
          input: ActionInputViewModel({}),
        });
      },
    }),
    $input_duration: new InputCore({ defaultValue: "0" }),
    $workout_action_select: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      list: $workout_action_list,
      client: props.client,
      async onOk(actions) {
        for (let i = 0; i < actions.length; i += 1) {
          const act = actions[i];
          if (!_action_profiles[act.id]) {
            const profile = $workout_action_list.response.dataSource.find((v) => v.id === act.id);
            if (profile) {
              _action_profiles[act.id] = profile;
            }
          }
        }
        const field_value = ui.$ref_action_in_menu.value;
        console.log("[PAGE]home_workout_plan/create - $workout_action_select onOk", field_value);
        if (field_value) {
          const $field = ui.$input_actions.getFieldWithId(field_value.id);
          if (!$field) {
            props.app.tip({
              text: ["异常操作", "没有匹配的输入项"],
            });
            return;
          }
          const menu_type = ui.$ref_menu_type.value;
          if (menu_type === "change_action") {
            $field.field.input.setValue({
              actions: actions.map((act) => {
                return {
                  action: {
                    id: Number(act.id),
                    zh_name: act.zh_name,
                  },
                  reps: 12,
                  reps_unit: "次" as const,
                  weight: "12RM",
                  rest_duration: 90,
                };
              }),
            });
            const r = await ui.$input_actions.validate();
            if (r.data) {
              methods.calc_estimated_duration(r.data);
            }
            ui.$workout_action_select.clear();
            ui.$workout_action_select.ui.$dialog.hide();
            return;
          }
          return;
        }
        // 新增动作
        for (let i = 0; i < actions.length; i += 1) {
          const $input = ui.$input_actions.append();
          $input.setValue({
            set_type: WorkoutPlanSetType.Normal,
            set_count: "3",
            set_rest_duration: "90",
            set_weight: "RPE 6",
            actions: [
              {
                action: {
                  id: Number(actions[i].id),
                  zh_name: actions[i].zh_name,
                },
                reps: 12,
                reps_unit: "次",
                weight: "12RM",
                rest_duration: 90,
              },
            ],
          });
        }
        const r = await ui.$input_actions.validate();
        if (r.data) {
          methods.calc_estimated_duration(r.data);
        }
        ui.$workout_action_select.clear();
        ui.$workout_action_select.ui.$dialog.hide();
        bus.emit(Events.StateChange, { ..._state });
      },
    }),
    $ref_action_in_menu: new RefCore<{ id: number; idx: number }>(),
    $ref_menu_type: new RefCore<"change_action" | "add_action">(),
    $menu: new DropdownMenuCore({
      align: "start",
      items: [
        new MenuItemCore({
          label: "修改动作",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            ui.$workout_action_select.setValue(
              $field.field.input.actions.map((act) => {
                return {
                  id: act.action.id,
                  zh_name: act.action.zh_name,
                };
              })
            );
            if (
              [WorkoutPlanSetType.Normal, WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(
                $field.field.input.type
              )
            ) {
              ui.$workout_action_select.methods.setMode("single");
            }
            if ([WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes($field.field.input.type)) {
              ui.$workout_action_select.methods.setMode("multiple");
            }
            ui.$ref_menu_type.select("change_action");
            ui.$menu.hide();
            ui.$workout_action_select.ui.$dialog.show();
          },
        }),
        new MenuItemCore({
          label: "设为常规组",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            $field.field.input.setType(WorkoutPlanSetType.Normal);
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "设为超级组",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            $field.field.input.setType(WorkoutPlanSetType.Super);
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "设为递减组",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            $field.field.input.setType(WorkoutPlanSetType.Decreasing);
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "设为递增组",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            $field.field.input.setType(WorkoutPlanSetType.Increasing);
            ui.$menu.hide();
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "HIIT",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            $field.field.input.setType(WorkoutPlanSetType.HIIT);
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "在前面插入",
          onClick() {},
        }),
        new MenuItemCore({
          label: "在后面插入",
        }),
        new MenuItemCore({
          label: "上移",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            ui.$input_actions.upIdx($field.idx);
            bus.emit(Events.StateChange, { ..._state });
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "下移",
          onClick() {
            const field_value = ui.$ref_action_in_menu.value;
            if (!field_value) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            const $field = ui.$input_actions.getFieldWithId(field_value.id);
            if (!$field) {
              return;
            }
            ui.$input_actions.downIdx($field.idx);
            bus.emit(Events.StateChange, { ..._state });
            ui.$menu.hide();
          },
        }),
        new MenuItemCore({
          label: "删除",
        }),
      ],
    }),
    $action_select: $model.$action_select,
    $back: new ButtonCore({
      onClick() {
        methods.cancel();
      },
    }),
    $submit: new ButtonCore({
      async onClick() {
        methods.submit();
      },
    }),
  };
  let _action_profiles: Record<string, WorkoutActionProfile> = {};
  let _state = {
    get actions() {
      return ui.$action_select.state.actions;
    },
    get selectedActions() {
      return ui.$action_select.state.selected;
    },
    get fields() {
      return ui.$input_actions.state.fields;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  ui.$action_select.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    methods,
    ui,
    state: _state,
    ready() {
      $model.ready();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanCreatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanCreateViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div class="bg-white p-4">
          <div class="space-y-2">
            <div class="field">
              <div>标题</div>
              <Input store={vm.ui.$input_title} />
            </div>
            <div class="field">
              <div>概要</div>
              <Textarea store={vm.ui.$input_overview} />
            </div>
            <div class="field">
              <div>动作</div>
              <div class="w-full space-y-3 my-2">
                <div class="space-y-12">
                  <For
                    each={state().fields}
                    fallback={
                      <div class="flex justify-center p-4 rounded-md bg-gray-100">
                        <div
                          onClick={() => {
                            vm.ui.$ref_action_in_menu.clear();
                            vm.ui.$workout_action_select.ui.$dialog.show();
                          }}
                        >
                          <div>点击添加动作</div>
                        </div>
                      </div>
                    }
                  >
                    {(field, index) => {
                      const $inner = vm.ui.$input_actions.mapFieldWithIndex(index());
                      if (!$inner) {
                        return null;
                      }
                      return (
                        <>
                          <div class="relative border border-gray-200 rounded-lg bg-white shadow-sm">
                            <Switch>
                              <Match when={$inner.field.symbol === "SingleFieldCore"}>
                                <ActionInput
                                  store={$inner.field.input}
                                  onShowActionSelect={() => {
                                    vm.ui.$ref_menu_type.select("add_action");
                                    vm.ui.$ref_action_in_menu.select({
                                      id: field.id,
                                      idx: index(),
                                    });
                                    const $field = vm.ui.$input_actions.getFieldWithId(field.id);
                                    if (!$field) {
                                      return;
                                    }
                                    vm.ui.$workout_action_select.methods.setDisabled(
                                      $field.field.input.actions.map((act) => act.action.id)
                                    );
                                    vm.ui.$workout_action_select.ui.$dialog.show();
                                  }}
                                />
                              </Match>
                            </Switch>
                            <div
                              class="z-20 absolute right-4 top-2"
                              onClick={(event) => {
                                const client = event.currentTarget.getBoundingClientRect();
                                vm.ui.$ref_action_in_menu.select({
                                  id: field.id,
                                  idx: index(),
                                });
                                vm.ui.$menu.toggle({ x: client.x + 18, y: client.y + 18 });
                              }}
                            >
                              <MoreHorizontal class="w-6 h-6" />
                            </div>
                          </div>
                          <Show when={state().fields.length - 1 === index()}>
                            <div class=""></div>
                          </Show>
                        </>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
            <div class="field">
              <div>预计时长</div>
              <Input store={vm.ui.$input_duration} />
            </div>
          </div>
        </div>
        <div class="h-[112px]"></div>
      </ScrollView>
      <div class="absolute bottom-0 w-full bg-white">
        <div class="flex justify-center w-full">
          <div class="self-end px-4 py-2 border" onClick={vm.methods.cancel}>
            <div>取消</div>
          </div>
          <div
            class="p-4 border rounded-md bg-white"
            onClick={() => {
              vm.ui.$ref_action_in_menu.clear();
              vm.ui.$workout_action_select.ui.$dialog.show();
            }}
          >
            添加动作
          </div>
          <div class="self-end px-4 py-2 border" onClick={vm.methods.submit}>
            <div>提交</div>
          </div>
        </div>
        <div class="h-[48px]"></div>
      </div>
      <Sheet store={vm.ui.$workout_action_select.ui.$dialog} position="bottom" size="sm">
        <div class="w-screen bg-white" style={{ "z-index": 999 }}>
          <WorkoutActionSelect3View store={vm.ui.$workout_action_select} />
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
