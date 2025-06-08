/**
 * @file 创建训练计划
 */
import { For, Show, Switch, Match } from "solid-js";
import { ChevronLeft, Dumbbell, MoreHorizontal, Pen, Plus, Send, Trash } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Checkbox, Dialog, DropdownMenu, Input, ListView, ScrollView, Textarea } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";
import { InputTextView } from "@/components/ui/input-text";
import { WorkoutPlanTagSelectView } from "@/components/workout-plan-tag-select";
import { Presence } from "@/components/ui/presence";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { Switcher } from "@/components/ui/switch";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { RefCore } from "@/domains/ui/cur";
import {
  ButtonCore,
  CheckboxCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  MenuItemCore,
  ScrollViewCore,
} from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { WorkoutPlanTagSelectViewModel } from "@/biz/workout_plan_tag_select";
import { createWorkoutPlan, WorkoutPlanDetailsJSON250424 } from "@/biz/workout_plan/services";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { WorkoutPlanSetType, WorkoutPlanStepType } from "@/biz/workout_plan/constants";
import { getSetValueUnit, SetValueUnit } from "@/biz/set_value_input";
import { map_parts_with_ids } from "@/biz/muscle/data";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { seconds_to_hour, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import { ActionInput, ActionInputViewModel } from "./components/action-input";
import { WorkoutPlanEditorViewModel } from "./model";

function WorkoutPlanCreateViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      create: new RequestCore(createWorkoutPlan, { client: props.client }),
    },
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
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
          if (reps_unit === getSetValueUnit("秒")) {
            set_duration += Number(reps);
          }
          if (reps_unit === getSetValueUnit("分")) {
            set_duration += Number(reps) * 60;
          }
          if (reps_unit === getSetValueUnit("次")) {
            // 一次大概是 6s
            set_duration += Number(reps) * 6;
          }
        }
        duration += set_duration * Number(set.set_count);
      }
      console.log("[PAGE]workout_plan/create - estimated duration", duration);
      const text = seconds_to_hour_with_template(duration, seconds_to_hour_template1);
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
      // console.log("[PAGE]workout_plan/create submit", value_actions);
      if (value_actions.length === 0) {
        props.app.tip({
          text: ["请至少选择一个动作"],
        });
        return;
      }
      const value_title = ui.$input_title.value;
      const value_overview = ui.$input_overview.value;
      const status = ui.$input_status.value;
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
        status: status ? 1 : 2,
        level: 5,
        details: ((): WorkoutPlanDetailsJSON250424 => {
          const steps: WorkoutPlanDetailsJSON250424["steps"] = [];
          for (let i = 0; i < value_actions.length; i += 1) {
            const set_value = value_actions[i];
            const actions: WorkoutPlanDetailsJSON250424["steps"][number]["actions"] = [];
            for (let j = 0; j < set_value.actions.length; j += 1) {
              const act = value_actions[i].actions[j];
              actions.push({
                action_id: act.action.id,
                action: {
                  id: act.action.id,
                  zh_name: act.action.zh_name,
                },
                reps: act.reps,
                reps_unit: act.reps_unit,
                weight: act.weight,
                rest_duration: act.rest_duration,
              });
            }
            steps.push({
              set_type: set_value.set_type,
              set_count: Number(set_value.set_count),
              set_rest_duration: Number(set_value.set_rest_duration),
              set_weight: set_value.set_weight,
              actions,
              set_note: set_value.set_note,
            });
          }
          return {
            v: "250424",
            steps,
          };
        })(),
        points: "",
        suggestions: "",
        muscle_ids: Object.keys(muscle_ids).join(","),
        equipment_ids: Object.keys(equipment_ids).join(","),
        estimated_duration: value_estimated_duration,
      };
      ui.$btn_submit.setLoading(true);
      const r2 = await request.workout_plan.create.run(body);
      ui.$btn_submit.setLoading(false);
      if (r2.error) {
        props.app.tip({
          text: [r2.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["创建成功"],
      });
      props.history.replace("root.workout_plan_profile", {
        id: String(r2.data.id),
      });
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
    $input_status: new CheckboxCore({ checked: false }),
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
    $input_tag: WorkoutPlanTagSelectViewModel(),
    $workout_action_select: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      list: $workout_action_list,
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
        (() => {
          const muscle_ids = [
            ...new Set(
              Object.keys(_action_profiles)
                .map((name) => {
                  const profile = _action_profiles[name];
                  return profile.muscles.map((m) => m.id);
                })
                .reduce((a, b) => {
                  return [...a, ...b];
                }, [])
            ),
          ];
          ui.$muscle.highlight_muscles(map_parts_with_ids(muscle_ids));
        })();
        (async () => {
          const equipment_ids = [
            ...new Set(
              Object.keys(_action_profiles)
                .map((name) => {
                  const profile = _action_profiles[name];
                  return profile.equipments.map((m) => m.id);
                })
                .reduce((a, b) => {
                  return [...a, ...b];
                }, [])
            ),
          ];
          const r3 = await request.equipment.list.run({ ids: equipment_ids });
          if (r3.error) {
            return;
          }
          _equipments = r3.data.list.map((v) => {
            return {
              id: v.id,
              zh_name: v.zh_name,
            };
          });
          methods.refresh();
        })();
        // ui.$input_actions.validate().then((r) => {
        //   console.log("------ fetch the values", r.data);
        //   if (r.data) {
        //     methods.calc_estimated_duration(r.data);
        //   }
        // });
        const field_value = ui.$ref_action_in_menu.value;
        const menu_type = ui.$ref_menu_type.value;
        console.log("[PAGE]home_workout_plan/create - $workout_action_select onOk", field_value, menu_type);
        if (field_value) {
          const $field = ui.$input_actions.getFieldWithId(field_value.id);
          if (!$field) {
            props.app.tip({
              text: ["异常操作", "没有匹配的输入项"],
            });
            return;
          }
          if (menu_type === "change_action") {
            $field.field.input.setValue({
              actions: actions.map((act) => {
                return {
                  action: {
                    id: Number(act.id),
                    zh_name: act.zh_name,
                  },
                  reps: (() => {
                    if ([WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)) {
                      return 30;
                    }
                    return 12;
                  })(),
                  reps_unit: (() => {
                    if ([WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)) {
                      return getSetValueUnit("秒");
                    }
                    return getSetValueUnit("次");
                  })(),
                  weight: "12RM",
                  rest_duration: 30,
                };
              }),
            });
          }
          if (menu_type === "add_action") {
            $field.field.input.setValue({
              actions: [
                ...$field.field.input.value.actions,
                ...actions.map((act) => {
                  return {
                    action: {
                      id: Number(act.id),
                      zh_name: act.zh_name,
                    },
                    reps: (() => {
                      if ([WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)) {
                        return 30;
                      }
                      return 12;
                    })(),
                    reps_unit: (() => {
                      if ([WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)) {
                        return "秒" as const;
                      }
                      return "次" as const;
                    })(),
                    weight: "12RM",
                    rest_duration: 30,
                  };
                }),
              ],
            });
          }
          ui.$workout_action_select.clear();
          ui.$workout_action_select.ui.$dialog.hide();
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
            set_note: "",
            actions: [
              {
                action: {
                  id: Number(actions[i].id),
                  zh_name: actions[i].zh_name,
                },
                reps: 12,
                reps_unit: getSetValueUnit("次"),
                weight: "12RM",
                rest_duration: 30,
              },
            ],
          });
        }
        ui.$input_actions.validate().then((r) => {
          console.log("before methods.calc_estimated_duration", r.data);
          if (r.data) {
            methods.calc_estimated_duration(r.data);
          }
        });
        ui.$workout_action_select.clear();
        ui.$workout_action_select.ui.$dialog.hide();
        methods.refresh();
      },
      onError(error) {
        props.app.tip({
          text: [error.message],
        });
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
        // new MenuItemCore({
        //   label: "设为递增组",
        //   onClick() {
        //     const field_value = ui.$ref_action_in_menu.value;
        //     if (!field_value) {
        //       props.app.tip({
        //         text: ["异常操作"],
        //       });
        //       return;
        //     }
        //     const $field = ui.$input_actions.getFieldWithId(field_value.id);
        //     if (!$field) {
        //       return;
        //     }
        //     $field.field.input.setType(WorkoutPlanSetType.Increasing);
        //     ui.$menu.hide();
        //     ui.$menu.hide();
        //   },
        // }),
        new MenuItemCore({
          label: "设为HIIT",
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
            ui.$input_actions.removeByIndex($field.idx);
            bus.emit(Events.StateChange, { ..._state });
            ui.$menu.hide();
          },
        }),
      ],
    }),
    $action_select: $model.$action_select,
    $dialog_act_remark: new DialogCore({}),
    $btn_act_remark_cancel: new ButtonCore({
      onClick() {
        ui.$dialog_act_remark.hide();
      },
    }),
    $btn_act_remark_submit: new ButtonCore({
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
        const remark = ui.$input_act_remark.value;
        if (!remark) {
          props.app.tip({
            text: ["请输入备注"],
          });
          return;
        }
        $field.field.input.setRemark(remark);
        ui.$dialog_act_remark.hide();
      },
    }),
    $input_act_remark: new InputCore({
      defaultValue: "",
    }),
    $btn_back: new ButtonCore({
      onClick() {
        methods.back();
      },
    }),
    $btn_add_act: new ButtonCore({
      onClick() {
        ui.$ref_action_in_menu.clear();
        ui.$workout_action_select.ui.$dialog.show();
      },
    }),
    $btn_submit: new ButtonCore({
      async onClick() {
        methods.submit();
      },
    }),
    $muscle: HumanBodyViewModel({ highlighted: [], disabled: true }),
  };
  let _action_profiles: Record<string, WorkoutActionProfile> = {};
  let _equipments: { id: number; zh_name: string }[] = [];
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
    get equipments() {
      return _equipments;
    },
    get enter() {
      return ui.$workout_action_select.ui.$dialog.state.enter;
    },
    get visible() {
      return ui.$workout_action_select.ui.$dialog.state.visible;
    },
    get exit() {
      return ui.$workout_action_select.ui.$dialog.state.exit;
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
    methods.refresh();
  });
  ui.$workout_action_select.ui.$dialog.onStateChange(() => methods.refresh());

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
  const [state, vm] = useViewModel(WorkoutPlanCreateViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center gap-2 w-full">
            <Button class="w-full" icon={<Plus class="w-4 h-4 text-w-fg-1" />} store={vm.ui.$btn_add_act}>
              添加动作
            </Button>
            <Button class="w-full" store={vm.ui.$btn_submit}>
              创建
            </Button>
          </div>
        }
      >
        <div class="space-y-4">
          <div class="field relative">
            <div class="flex">
              <div class=" text-w-fg-0">标题</div>
              <div class="text-red-500">*</div>
            </div>
            <Input store={vm.ui.$input_title} class="mt-1" />
          </div>
          <div class="field">
            <div class="flex">
              <div class=" text-w-fg-0">概要</div>
            </div>
            <Textarea store={vm.ui.$input_overview} class="mt-1" />
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-w-fg-0">训练内容</div>
              <div class="text-red-500">*</div>
            </div>
            <div class="w-full space-y-3 my-2">
              <div class="">
                <Show
                  when={state().fields.length}
                  fallback={
                    <div
                      class="flex justify-center p-4 border-2 border-w-fg-3 rounded-lg"
                      onClick={() => {
                        vm.ui.$ref_action_in_menu.clear();
                        vm.ui.$workout_action_select.ui.$dialog.show();
                      }}
                    >
                      <div class="flex flex-col items-center text-w-fg-1">
                        <div>
                          <Plus class="w-8 h-8" />
                        </div>
                        <div class="">点击添加动作</div>
                      </div>
                    </div>
                  }
                >
                  <div class="mt-4 space-y-12">
                    <For each={state().fields}>
                      {(field, index) => {
                        const $inner = vm.ui.$input_actions.mapFieldWithIndex(index());
                        if (!$inner) {
                          return null;
                        }
                        return (
                          <>
                            <div class="relative border-2 border-w-fg-3 rounded-lg shadow-sm">
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
                              <div class="z-0 absolute right-4 top-2">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="bg-w-bg-5 rounded-full p-2"
                                    onClick={(event) => {
                                      vm.ui.$ref_action_in_menu.select({
                                        id: field.id,
                                        idx: index(),
                                      });
                                      const $field = vm.ui.$input_actions.getFieldWithId(field.id);
                                      if (!$field) {
                                        return;
                                      }
                                      vm.ui.$input_act_remark.setValue($field.field.input.ui.$input_set_remark.value);
                                      vm.ui.$dialog_act_remark.show();
                                    }}
                                  >
                                    <Pen class="w-4 h-4 text-w-fg-1" />
                                  </div>
                                  <div
                                    class="bg-w-bg-5 rounded-full p-2"
                                    onClick={(event) => {
                                      const client = event.currentTarget.getBoundingClientRect();
                                      vm.ui.$ref_action_in_menu.select({
                                        id: field.id,
                                        idx: index(),
                                      });
                                      vm.ui.$menu.toggle({
                                        x: client.x,
                                        y: client.y,
                                        width: client.width,
                                        height: client.height,
                                      });
                                    }}
                                  >
                                    <MoreHorizontal class="w-4 h-4 text-w-fg-1" />
                                  </div>
                                </div>
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
                </Show>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-w-fg-0">标签</div>
            </div>
            <WorkoutPlanTagSelectView class="mt-1" store={vm.ui.$input_tag} app={props.app} />
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-w-fg-0">预计时长</div>
            </div>
            <div class="p-4">
              <InputTextView store={vm.ui.$input_duration} class="mt-1" />
            </div>
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-w-fg-0">锻炼部位</div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <BodyMusclePreview store={vm.ui.$muscle} />
              </div>
            </div>
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-w-fg-0">所需器械</div>
            </div>
            <div class="p-4 space-y-2">
              <For each={state().equipments}>
                {(v) => {
                  return (
                    <div>
                      <div class="text-w-fg-0">{v.zh_name}</div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
          <div class="field flex items-center gap-4">
            <div class="flex">
              <div class="text-w-fg-0">外部是否可见</div>
            </div>
            <Switcher store={vm.ui.$input_status} texts={["公开", "仅自己可见"]} />
          </div>
        </div>
      </PageView>
      <Sheet ignore_safe_height store={vm.ui.$workout_action_select.ui.$dialog} app={props.app}>
        <WorkoutActionSelect3View store={vm.ui.$workout_action_select} app={props.app} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_act_remark} app={props.app}>
        <div class="p-2">
          <div>
            <div class="text-xl">备注</div>
            <div class="mt-8">
              <Textarea store={vm.ui.$input_act_remark} />
            </div>
            <div class="flex items-center gap-2 mt-4">
              <Button class="w-full" variant="subtle" store={vm.ui.$btn_act_remark_cancel}>
                取消
              </Button>
              <Button class="w-full" store={vm.ui.$btn_act_remark_submit}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
