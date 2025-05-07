import { $workout_action_list } from "@/store";
import { ViewComponentProps } from "@/store/types";
import { MuscleSelectViewModel } from "@/biz/muscle_select";
import { EquipmentSelectViewModel } from "@/biz/equipment_select";
import {
  WorkoutPlanStepType,
  WorkoutPlanStepTypeTextMap,
  WorkoutPlanSetType,
  WorkoutSetTypeTextMap,
  WorkoutPlanStepTypeOptions,
  WorkoutSetTypeOptions,
} from "@/biz/workout_plan/constants";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { WorkoutPlanStepBody, WorkoutPlanPreviewPayload } from "@/biz/workout_plan/types";
import { WorkoutActionMultipleSelectViewModel } from "@/biz/workout_action_multiple_select";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import { ObjectFieldCore, SingleFieldCore, ArrayFieldCore } from "@/domains/ui/formv2";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { Result } from "@/domains/result";

export function WorkoutPlanEditorViewModel(props: Pick<ViewComponentProps, "client" | "app">) {
  function handleSelectAction(
    action: { id: number | string; name: string } | null,
    extra: Partial<{ silence: boolean }> = {}
  ) {
    if (!action) {
      return;
    }
    const profile = $action_select.methods.find(action);
    console.log("[PAGE]home_workout_plan_create - handleSelectAction", action, $action_select.state.actions, profile);
    if (!profile) {
      return;
    }
    const { equipments, muscles } = profile;
    const existing_equipments = $values.fields.equipments.value.map((e) => e.id);
    const next_equipments = [...new Set([...existing_equipments, ...equipments.map((e) => e.id)])];
    const existing_muscles = $values.fields.muscles.value.map((m) => m.id);
    const next_muscles = [...new Set([...existing_muscles, ...muscles.map((m) => m.id)])];

    $values.fields.equipments.setValue(
      next_equipments.flatMap((id) => {
        const matched = $equipment_select.state.equipments.find((item) => item.id === id);
        if (!matched) {
          return [];
        }
        return [matched];
      })
    );
    $values.fields.muscles.setValue(
      next_muscles.flatMap((id) => {
        const matched = $muscle_select.state.muscles.find((item) => item.id === id);
        if (!matched) {
          return [];
        }
        return [matched];
      })
    );
    if (extra.silence) {
      return;
    }
    $values.refresh();
  }

  async function toBody() {
    const r = await $values.validate();
    if (r.error) {
      return Result.Err(r.error);
    }
    const values = r.data;
    return values;
  }
  const action_select_vm_list: WorkoutActionSelectViewModel[] = [];
  const $action_unit = () =>
    new SingleFieldCore({
      name: "unit",
      label: "单位",
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
        ],
      }),
    });
  const $action_weight = () =>
    new SingleFieldCore({
      name: "weight",
      label: "重量",
      input: new InputCore({
        defaultValue: "12RM",
      }),
    });
  const $action_rest_duration = () =>
    new SingleFieldCore({
      name: "rest",
      label: "休息时间",
      input: new InputCore({
        defaultValue: 0,
        type: "number",
      }),
    });
  const $action_reps = () =>
    new SingleFieldCore({
      name: "reps",
      label: "计数",
      input: new InputCore({
        defaultValue: 12,
        type: "number",
      }),
    });
  const $action_note = () =>
    new SingleFieldCore({
      name: "note",
      label: "动作备注",
      input: new InputCore({
        defaultValue: "",
      }),
    });
  const $normal_set_value = (events: { onSelectAction?: (action: WorkoutActionProfile | null) => void }) => {
    return new ObjectFieldCore({
      name: "sets1",
      label: "组设置",
      fields: {
        action: new SingleFieldCore({
          name: "action",
          label: "动作",
          input: WorkoutActionSelectViewModel({
            defaultValue: null,
            client: props.client,
            list: $workout_action_list,
            // onCreate(vm) {
            //   if ($action_select.state.actions.length !== 0) {
            //     vm.methods.setActions($action_select.state.actions);
            //   }
            //   action_select_vm_list.push(vm);
            // },
            onChange: (action) => {
              if (events.onSelectAction) {
                events.onSelectAction(action);
              }
              handleSelectAction(action);
            },
          }),
        }),
        reps: $action_reps(),
        unit: $action_unit(),
        weight: $action_weight(),
        rest: $action_rest_duration(),
        note: $action_note(),
      },
    });
  };

  const $combo_set_values = (events: { onSelectAction?: (action: WorkoutActionProfile | null) => void }) => {
    return new ObjectFieldCore({
      name: "sets2",
      label: "组",
      hidden: true,
      fields: {
        actions: new ArrayFieldCore({
          name: "actions",
          label: "动作",
          field: (index: number) => {
            return new ObjectFieldCore({
              name: `set_${index}`,
              label: "",
              fields: {
                action: new SingleFieldCore({
                  name: "action",
                  label: "动作",
                  input: WorkoutActionSelectViewModel({
                    defaultValue: null,
                    client: props.client,
                    list: $workout_action_list,
                    // onCreate(vm) {
                    //   if ($action_select.state.actions.length !== 0) {
                    //     vm.methods.setActions($action_select.state.actions);
                    //   }
                    //   action_select_vm_list.push(vm);
                    // },
                    onChange: (action) => {
                      if (events.onSelectAction) {
                        events.onSelectAction(action);
                      }
                      handleSelectAction(action);
                    },
                  }),
                }),
                reps: $action_reps(),
                unit: $action_unit(),
                weight: $action_weight(),
                rest_duration: $action_rest_duration(),
                note: $action_note(),
              },
            });
          },
        }),
        note: new SingleFieldCore({
          name: "note",
          label: "组备注",
          input: new InputCore({
            defaultValue: "",
          }),
        }),
      },
    });
  };
  const $free_set_values = (events: { onSelectAction?: (action: WorkoutActionProfile | null) => void }) => {
    return new ArrayFieldCore({
      name: "sets3",
      label: "组设置",
      hidden: true,
      field: (index: number) => {
        return new ObjectFieldCore({
          name: `set_${index}`,
          label: "组",
          fields: {
            actions: new ArrayFieldCore({
              name: "actions",
              label: "动作",
              field: (index: number) => {
                return new ObjectFieldCore({
                  name: `set_${index}`,
                  label: "",
                  fields: {
                    id: new SingleFieldCore({
                      name: "id",
                      label: "动作Id",
                      hidden: true,
                      input: new InputCore({
                        defaultValue: 0,
                      }),
                    }),
                    action: new SingleFieldCore({
                      name: "action",
                      label: "动作",
                      input: WorkoutActionSelectViewModel({
                        defaultValue: null,
                        client: props.client,
                        list: $workout_action_list,
                        // onCreate(vm) {
                        //   if ($action_select.state.actions.length !== 0) {
                        //     vm.methods.setActions($action_select.state.actions);
                        //   }
                        //   action_select_vm_list.push(vm);
                        // },
                        onChange: (action) => {
                          if (events.onSelectAction) {
                            events.onSelectAction(action);
                          }
                          handleSelectAction(action);
                        },
                      }),
                    }),
                    reps: $action_reps(),
                    unit: $action_unit(),
                    weight: $action_weight(),
                    rest_duration: $action_rest_duration(),
                    note: $action_note(),
                  },
                });
              },
            }),
            rest_duration: new SingleFieldCore({
              name: "rest_duration",
              label: "休息时长",
              input: new InputCore({
                defaultValue: 90,
              }),
            }),
            note: new SingleFieldCore({
              name: "note",
              label: "组备注",
              input: new InputCore({
                defaultValue: "",
              }),
            }),
          },
        });
      },
    });
  };

  const $action_select = WorkoutActionMultipleSelectViewModel({
    defaultValue: [],
    client: props.client,
    list: $workout_action_list,
  });
  const $muscle_select = MuscleSelectViewModel({ defaultValue: [], client: props.client });
  const $equipment_select = EquipmentSelectViewModel({ defaultValue: [], client: props.client });

  const $values = new ObjectFieldCore({
    name: "",
    label: "",
    fields: {
      title: new SingleFieldCore({
        name: "title",
        label: "标题",
        input: new InputCore({
          defaultValue: "",
        }),
      }),
      overview: new SingleFieldCore({
        name: "overview",
        label: "描述",
        input: new InputCore({
          defaultValue: "",
          type: "textarea",
        }),
      }),
      level: new SingleFieldCore({
        name: "level",
        label: "难度",
        input: new InputCore({
          defaultValue: 1,
          type: "number",
        }),
      }),
      tags: new SingleFieldCore({
        name: "tags",
        label: "标签",
        input: new TagInputCore({
          defaultValue: [],
        }),
      }),
      steps: new ArrayFieldCore({
        name: "steps",
        label: "动作",
        field: (index: number) => {
          const field = new ObjectFieldCore({
            name: `step_${index}`,
            label: "动作",
            fields: {
              id: new SingleFieldCore({
                name: "id",
                label: "阶段Id",
                hidden: true,
                input: new InputCore({
                  defaultValue: 0,
                }),
              }),

              type: new SingleFieldCore({
                name: "type",
                label: "类型",
                input: new SelectCore({
                  defaultValue: WorkoutPlanStepType.Strength,
                  options: WorkoutPlanStepTypeOptions,
                }),
              }),

              set_type: new SingleFieldCore({
                name: "set_type",
                label: "内容类型",
                input: new SelectCore({
                  defaultValue: WorkoutPlanSetType.Normal,
                  options: WorkoutSetTypeOptions,
                  onChange(value) {
                    if (!value) {
                      return;
                    }
                    if (value === WorkoutPlanSetType.Normal) {
                      field.showField("action");
                      field.showField("reps");
                      field.showField("unit");
                      field.showField("weight");
                      field.showField("note");
                      field.showField("set_count");
                      field.showField("set_rest_duration");

                      field.hideField("title");
                      field.hideField("actions");
                      field.hideField("sets3");
                    }
                    if (value === WorkoutPlanSetType.Super) {
                      field.showField("title");
                      field.showField("actions");
                      field.showField("set_count");
                      field.showField("set_rest_duration");

                      field.hideField("action");
                      field.hideField("reps");
                      field.hideField("unit");
                      field.hideField("weight");
                      field.hideField("note");
                      field.hideField("sets3");
                    }
                    if (value === WorkoutPlanSetType.Super) {
                      field.showField("title");
                      field.showField("sets3");

                      field.hideField("set_count");
                      field.hideField("set_rest_duration");
                      field.hideField("action");
                      field.hideField("reps");
                      field.hideField("unit");
                      field.hideField("weight");
                      field.hideField("note");
                      field.hideField("actions");
                    }
                  },
                }),
              }),

              action_id: new SingleFieldCore({
                name: "action_id",
                label: "动作Id",
                hidden: true,
                input: new InputCore({
                  defaultValue: 0,
                }),
              }),
              action: new SingleFieldCore({
                name: "action",
                label: "动作",
                input: WorkoutActionSelectViewModel({
                  defaultValue: null,
                  client: props.client,
                  list: $workout_action_list,
                  // onCreate(vm) {
                  //   console.log("[PAGE]home_workout_plan_create - onCreate", index, vm.value);
                  //   if ($action_select.state.actions.length !== 0) {
                  //     vm.methods.setActions($action_select.state.actions);
                  //   }
                  //   action_select_vm_list.push(vm);
                  // },
                  onChange: (action) => {
                    handleSelectAction(action);
                    if (field.fields.title.dirty) {
                      return;
                    }
                    field.fields.title.setValue(action?.zh_name ?? action?.name ?? "");
                  },
                }),
              }),

              actions: new ArrayFieldCore({
                name: "actions",
                label: "动作",
                hidden: true,
                field: (index: number) => {
                  return new ObjectFieldCore({
                    name: `action_${index}`,
                    label: "",
                    fields: {
                      id: new SingleFieldCore({
                        name: "id",
                        label: "动作Id",
                        hidden: true,
                        input: new InputCore({
                          defaultValue: 0,
                        }),
                      }),
                      action: new SingleFieldCore({
                        name: "action",
                        label: "动作",
                        input: WorkoutActionSelectViewModel({
                          defaultValue: null,
                          client: props.client,
                          list: $workout_action_list,
                          // onCreate(vm) {
                          //   if ($action_select.state.actions.length !== 0) {
                          //     vm.methods.setActions($action_select.state.actions);
                          //   }
                          //   action_select_vm_list.push(vm);
                          // },
                          onChange(action) {
                            handleSelectAction(action);
                            if (field.fields.title.dirty) {
                              return;
                            }
                            // @ts-ignore
                            const value1 = field.fields.actions.value as { action: WorkoutActionProfile }[];
                            const actions = value1.flatMap((a) => {
                              const matched = $action_select.state.actions.find((action) => action.id === a.action?.id);
                              if (!matched) {
                                return [];
                              }
                              return [matched];
                            });
                            const name = (() => {
                              return actions.map((a) => a.zh_name ?? a.name).join("+") + "超级组";
                            })();
                            field.fields.title.setValue(name);
                          },
                        }),
                      }),
                      reps: $action_reps(),
                      unit: $action_unit(),
                      weight: $action_weight(),
                      rest_duration: $action_rest_duration(),
                      note: $action_note(),
                    },
                  });
                },
              }),

              reps: $action_reps(),
              unit: $action_unit(),
              weight: $action_weight(),
              note: $action_note(),

              set_count: new SingleFieldCore({
                name: "set_count",
                label: "组数",
                input: new InputCore({
                  defaultValue: 3,
                  type: "number",
                }),
              }),
              set_rest_duration: new SingleFieldCore({
                name: "set_rest_duration",
                label: "组间休息",
                input: new InputCore({
                  defaultValue: 90,
                  type: "number",
                }),
              }),
              title: new SingleFieldCore({
                name: "title",
                label: "阶段标题",
                hidden: true,
                input: new InputCore({
                  defaultValue: "",
                }),
              }),
              sets3: $free_set_values({}),
              step_note: new SingleFieldCore({
                name: "step_note",
                label: "阶段备注",
                input: new InputCore({
                  defaultValue: "",
                }),
              }),
            },
          });
          return field;
        },
      }),
      muscles: new SingleFieldCore({
        name: "muscles",
        label: "主要锻炼肌肉",
        input: $muscle_select,
      }),
      equipments: new SingleFieldCore({
        name: "equipments",
        label: "所需器械",
        input: $equipment_select,
      }),
      estimated_duration: new SingleFieldCore({
        name: "estimated_duration",
        label: "预计时长",
        input: new InputCore({
          defaultValue: 60,
          type: "number",
        }),
      }),
      points: new ArrayFieldCore({
        name: "points",
        label: "注意事项",
        field: (index: number) => {
          return new SingleFieldCore({
            name: `point_${index}`,
            label: "",
            input: new InputCore({
              defaultValue: "",
            }),
          });
        },
      }),
      suggestions: new ArrayFieldCore({
        name: "suggestions",
        label: "建议",
        field: (index: number) => {
          return new SingleFieldCore({
            name: `suggestion_${index}`,
            label: "",
            input: new InputCore({
              defaultValue: "",
            }),
          });
        },
      }),
    },
  });

  const $action_select_dialog = new DialogCore({
    title: "动作选择",
  });
  const $action_search_input = new InputCore({
    defaultValue: "",
  });
  const $action_search_btn = new ButtonCore({
    onClick() {
      const value = $action_search_input.value;
      if (!value) {
        props.app.tip({
          text: ["请输入搜索关键字"],
        });
        return;
      }
      $action_select.methods.search(value);
    },
  });
  const $action_select_view = new ScrollViewCore({});

  $action_select_dialog.onOk(() => {
    const selected_actions = $action_select.state.selected;
    if (selected_actions.length === 0) {
      props.app.tip({
        text: ["请选择动作"],
      });
      return;
    }
    if (selected_actions.length === 1) {
      const field = $values.fields.steps.append();
      console.log("[PAGE]home_workout_plan_create", field);
      const action = selected_actions[0];
      field.setValue({
        set_type: WorkoutPlanSetType.Normal,
        type: WorkoutPlanStepType.Strength,
        action,
        reps: 12,
        unit: "次",
        weight: "12RM",
        rest_duration: 90,
        note: "",
        actions: [],
        sets3: [],
      });
      field.fields.title.hide();
      $action_select_dialog.hide();
      handleSelectAction(action, { silence: true });
      $action_select.methods.clear();
      $values.refresh();
      return;
    }
    const field = $values.fields.steps.append();
    field.setValue({
      set_type: WorkoutPlanSetType.Super,
      type: WorkoutPlanStepType.Strength,
      title: selected_actions.map((act) => act.zh_name).join("+") + "超级组",
      actions: selected_actions.map((action) => ({
        action,
        reps: 12,
        unit: "次",
        weight: "12RM",
        rest_duration: 0,
        note: "",
      })),
      sets3: [],
      note: "",
    });
    $action_select_dialog.hide();
    field.fields.title.show();
    for (let i = 0; i < selected_actions.length; i += 1) {
      handleSelectAction(selected_actions[i], { silence: true });
    }
    $action_select.methods.clear();
    $values.refresh();
  });
  $action_search_input.onEnter(() => {
    $action_search_btn.click();
  });
  $action_select_view.onReachBottom(async () => {
    await $action_select.request.action.list.loadMore();
    $action_select_view.finishLoadingMore();
  });

  // $action_select.onActionsLoaded(() => {
  //   console.log(
  //     "[PAGEModel]home_workout_plan_create - $action_select.onActionsLoaded",
  //     $action_select.state.actions,
  //     action_select_vm_list
  //   );
  //   for (let i = 0; i < action_select_vm_list.length; i += 1) {
  //     action_select_vm_list[i].methods.setActions($action_select.state.actions);
  //   }
  // });

  return {
    $values,
    $action_select,
    $muscle_select,
    $equipment_select,
    $action_select_dialog,
    $action_search_input,
    $action_search_btn,
    $action_select_view,
    $normal_set_value,
    $combo_set_values,
    $free_set_values,
    toBody,
    ready() {
      $workout_action_list.init();
    },
  };
}
