/**
 * @file 训练计划创建的核心实现
 */
import { $workout_action_list } from "@/store";
import { ViewComponentProps } from "@/store/types";

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
import { Result } from "@/domains/result";
import { WorkoutPlanTagSelectViewModel } from "@/biz/workout_plan_tag_select";
import {
  createWorkoutPlan,
  fetchWorkoutPlanProfile,
  fetchWorkoutPlanProfileProcess,
  updateWorkoutPlan,
} from "@/biz/workout_plan/services";
import { WorkoutPlanBodyDetailsJSON250424, WorkoutPlanBodyDetailsJSON250627 } from "@/biz/workout_plan/types";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import { WorkoutPlanSetType, WorkoutPlanStepType } from "@/biz/workout_plan/constants";
import { getSetValueUnit, SetValueUnit } from "@/biz/input_set_value";
import { map_parts_with_ids } from "@/biz/muscle/data";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { ListCore } from "@/domains/list";
import { seconds_to_hour_text, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";
import { debounce } from "@/utils/lodash/debounce";

import { ActionInput, DefaultSetValue, StepInputViewModel } from "./components/action-input";

function calc_estimated_duration(
  actions: {
    set_count: string;
    set_rest_duration: {
      num: string;
      unit: SetValueUnit;
    };
    actions: {
      reps: {
        num: string;
        unit: SetValueUnit;
      };
    }[];
  }[]
) {
  let duration = 0;
  for (let i = 0; i < actions.length; i += 1) {
    const set = actions[i];
    let set_duration = Number(set.set_rest_duration.num);
    for (let j = 0; j < set.actions.length; j += 1) {
      const act = set.actions[j];
      const reps = Number(act.reps.num);
      const reps_unit = act.reps.unit;
      if (reps_unit === getSetValueUnit("秒")) {
        set_duration += reps;
      }
      if (reps_unit === getSetValueUnit("分")) {
        set_duration += reps * 60;
      }
      if (reps_unit === getSetValueUnit("次")) {
        // 所有动作按一次大概是 6s 计算
        set_duration += reps * 6;
      }
    }
    duration += set_duration * Number(set.set_count);
  }
  console.log("[PAGE]workout_plan/create - estimated duration", duration);
  return duration;
}

export function WorkoutPlanEditorViewModel(props: Pick<ViewComponentProps, "history" | "client" | "app">) {
  const request = {
    workout_plan: {
      create: new RequestCore(createWorkoutPlan, { client: props.client }),
      update: new RequestCore(updateWorkoutPlan, { client: props.client }),
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_action: {
      list_by_ids: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
    },
    equipment: {
      list: new ListCore(
        new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client })
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
    debounce_calc_estimated_duration: debounce(800, () => {
      ui.$input_actions.validate().then((r) => {
        // console.log("before methods.calc_estimated_duration", r.data);
        if (r.data) {
          const v = calc_estimated_duration(r.data);
          const text = seconds_to_hour_with_template(v, seconds_to_hour_template1);
          ui.$input_duration.setValue(text);
        }
      });
    }),
    async refreshMuscles() {
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
    },
    async refreshEquipments() {
      const equipment_ids = [
        ...new Set(
          Object.keys(_action_profiles)
            .map((id) => {
              const profile = _action_profiles[id];
              return profile.equipments.map((m) => m.id);
            })
            .reduce((a, b) => {
              return [...a, ...b];
            }, [])
        ),
      ];
      if (equipment_ids.length === 0) {
        return;
      }
      const r3 = await request.equipment.list.search({ ids: equipment_ids });
      if (r3.error) {
        return;
      }
      _equipments = r3.data.dataSource.map((v) => {
        return {
          id: v.id,
          zh_name: v.zh_name,
        };
      });
      methods.refresh();
    },
    async toBody() {
      const value_title = ui.$input_title.value;
      const value_overview = ui.$input_overview.value;
      const value_suggestions = ui.$input_suggestions.value;
      const status = ui.$input_status.state.value;
      const value_tags = ui.$input_tags.value;
      if (!value_title) {
        return Result.Err("请输入计划名称");
      }
      const r = await ui.$input_actions.validate();
      if (r.error) {
        return Result.Err(r.error);
      }
      const value_actions = r.data;
      if (value_actions.length === 0) {
        return Result.Err("请至少添加一个动作");
      }
      const value_estimated_duration = calc_estimated_duration(value_actions);
      // const text = seconds_to_hour_with_template(value_estimated_duration, seconds_to_hour_template1);
      // ui.$input_duration.setValue(text);
      const muscle_ids: Record<number, boolean> = {};
      const equipment_ids: Record<number, boolean> = {};
      for (let i = 0; i < value_actions.length; i += 1) {
        const vvv = value_actions[i];
        if (!vvv.set_count) {
          return Result.Err("存在未填写的表单");
        }
        if (!vvv.set_rest_duration) {
          return Result.Err("存在未填写的表单");
        }
        if (!vvv.set_weight) {
          return Result.Err("存在未填写的表单");
        }
        for (let j = 0; j < value_actions[i].actions.length; j += 1) {
          const act = value_actions[i].actions[j];
          if (!act.action) {
            return Result.Err("存在未选择动作");
          }
          if (!act.reps) {
            return Result.Err("存在未填写的表单");
          }
          // if (!act.reps_unit) {
          //   return Result.Err("存在未填写的表单");
          // }
          if (!act.weight) {
            return Result.Err("存在未填写的表单");
          }
          if (!act.rest_duration) {
            return Result.Err("存在未填写的表单");
          }
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
        tags: value_tags.join(","),
        status: status ? 1 : 2,
        level: 5,
        details: ((): WorkoutPlanBodyDetailsJSON250627 => {
          const steps: WorkoutPlanBodyDetailsJSON250627["steps"] = [];
          for (let i = 0; i < value_actions.length; i += 1) {
            const set_value = value_actions[i];
            const actions: WorkoutPlanBodyDetailsJSON250627["steps"][number]["actions"] = [];
            for (let j = 0; j < set_value.actions.length; j += 1) {
              const act = value_actions[i].actions[j];
              if (act.action) {
                actions.push({
                  action: {
                    id: act.action.id,
                    zh_name: act.action.zh_name,
                  },
                  reps: {
                    num: act.reps.num,
                    unit: act.reps.unit,
                  },
                  weight: {
                    num: act.weight.num,
                    unit: act.weight.unit,
                  },
                  rest_duration: {
                    num: act.rest_duration.num,
                    unit: act.rest_duration.unit,
                  },
                });
              }
            }
            steps.push({
              set_type: set_value.set_type ?? WorkoutPlanSetType.Normal,
              set_count: Number(set_value.set_count),
              set_rest_duration: {
                num: set_value.set_rest_duration.num,
                unit: set_value.set_rest_duration.unit,
              },
              set_weight: {
                num: set_value.set_weight.num,
                unit: set_value.set_weight.unit,
              },
              set_note: set_value.set_note,
              set_tags: "",
              actions,
            });
          }
          return {
            v: "250627",
            steps,
          };
        })(),
        points: "",
        suggestions: value_suggestions ? JSON.stringify([value_suggestions]) : "",
        muscle_ids: Object.keys(muscle_ids).join(","),
        equipment_ids: Object.keys(equipment_ids).join(","),
        estimated_duration: value_estimated_duration,
      };
      return Result.Ok(body);
    },
    async create() {
      const r = await methods.toBody();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const body = r.data;
      ui.$btn_create_submit.setLoading(true);
      // console.log("[PAGE]workout_plan/create", body);
      const r2 = await request.workout_plan.create.run(body);
      ui.$btn_create_submit.setLoading(false);
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
    async update() {
      const r = await methods.toBody();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const id = request.workout_plan.profile.response?.id;
      if (!id) {
        props.app.tip({
          text: ["缺少id参数"],
        });
        return;
      }
      const body = r.data;
      ui.$btn_update_submit.setLoading(true);
      // console.log("[PAGE]workout_plan/update", body);
      const r2 = await request.workout_plan.update.run({
        ...body,
        id,
      });
      ui.$btn_update_submit.setLoading(false);
      if (r2.error) {
        props.app.tip({
          text: [r2.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["更新成功"],
      });
      props.history.back({ data: { update: true } });
    },
    async fetch(id: number) {
      const r = await request.workout_plan.profile.run({ id });
      if (r.error) {
        return;
      }
      const data = r.data;
      ui.$input_title.setValue(data.title);
      ui.$input_overview.setValue(data.overview);
      for (let i = 0; i < data.steps.length; i += 1) {
        const vv = data.steps[i];
        const field = ui.$input_actions.append({ silence: true });
        field.setValue({
          set_type: vv.set_type,
          set_count: vv.set_count,
          set_rest_duration: vv.set_rest_duration,
          set_weight: vv.set_weight,
          set_note: vv.set_note,
          // set_tags: vv.set_tags,
          actions: vv.actions.map((vvv) => {
            return {
              action: vvv.action,
              reps: vvv.reps,
              weight: vvv.weight,
              rest_duration: vvv.rest_duration,
            };
          }),
        });
      }
      ui.$input_duration.setValue(data.estimated_duration_text);
      ui.$input_suggestions.setValue(data.suggestions);
      ui.$input_tags.setValue(data.tags);
      ui.$input_actions.refresh();
      (async () => {
        const act_ids: number[] = [];
        for (let i = 0; i < data.steps.length; i += 1) {
          const vv = data.steps[i];
          for (let j = 0; j < vv.actions.length; j += 1) {
            const act = vv.actions[j];
            if (!act_ids.includes(act.action.id)) {
              act_ids.push(act.action.id);
            }
          }
        }
        const r = await request.workout_action.list_by_ids.run({ ids: act_ids });
        if (r.error) {
          return;
        }
        for (let i = 0; i < r.data.list.length; i += 1) {
          const act = r.data.list[i];
          _action_profiles[act.id] = act;
        }
        // console.log("[PAGE]workout_plan/model -before methods.refreshMuscles", _action_profiles);
        methods.refreshMuscles();
        methods.refreshEquipments();
      })();
      methods.refresh();
    },
  };
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
      field(count) {
        return new SingleFieldCore({
          input: StepInputViewModel({ app: props.app }),
        });
      },
    }),
    $input_duration: new InputCore({ defaultValue: "0" }),
    $input_suggestions: new InputCore({ defaultValue: "", placeholder: "例如围训练期饮食注意事项" }),
    $input_tags: WorkoutPlanTagSelectViewModel(),
    $workout_action_select: WorkoutActionSelectViewModel({
      defaultValue: [],
      list: $workout_action_list,
      app: props.app,
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
        methods.refreshMuscles();
        methods.refreshEquipments();
        const field_value = ui.$ref_action_in_menu.value;
        const menu_type = ui.$ref_menu_type.value;
        console.log("[PAGE]home_workout_plan/create - $workout_action_select onOk", field_value, menu_type, actions);
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
                    if (
                      $field.field.input.value.set_type &&
                      [WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)
                    ) {
                      return {
                        num: "30",
                        unit: getSetValueUnit("秒"),
                      };
                    }
                    return {
                      num: "12",
                      unit: getSetValueUnit("次"),
                    };
                  })(),
                  weight: {
                    num: "12",
                    unit: getSetValueUnit("RM"),
                  },
                  rest_duration: {
                    num: "30",
                    unit: getSetValueUnit("秒"),
                  },
                };
              }),
            });
          }
          if (menu_type === "add_action") {
            for (let i = 0; i < actions.length; i += 1) {
              const act = actions[i];
              const _$f = $field.field.input.ui.$form.fields.actions.append();
              if (
                $field.field.input.value.set_type &&
                [WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)
              ) {
                _$f.showField("rest_duration");
              }
              _$f.setValue({
                action: {
                  id: Number(act.id),
                  zh_name: act.zh_name,
                },
                reps: (() => {
                  if (
                    $field.field.input.value.set_type &&
                    [WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)
                  ) {
                    return {
                      num: "30",
                      unit: getSetValueUnit("秒"),
                    };
                  }
                  return {
                    num: "12",
                    unit: getSetValueUnit("次"),
                  };
                })(),
                weight: {
                  num: "12",
                  unit: getSetValueUnit("RM"),
                },
                rest_duration: {
                  num: "30",
                  unit: getSetValueUnit("秒"),
                },
              });
            }
          }
          ui.$workout_action_select.clear();
          ui.$workout_action_select.ui.$dialog.hide();
          return;
        }

        // 新增动作
        for (let i = 0; i < actions.length; i += 1) {
          const act = actions[i];
          const $input = ui.$input_actions.append();
          $input.setValue(
            DefaultSetValue({
              id: act.id,
              zh_name: act.zh_name,
            })
          );
        }
        ui.$input_actions.validate().then((r) => {
          console.log("before methods.calc_estimated_duration", r.data);
          if (r.data) {
            const v = calc_estimated_duration(r.data);
            const text = seconds_to_hour_with_template(v, seconds_to_hour_template1);
            ui.$input_duration.setValue(text);
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
              $field.field.input.value.actions.map((act) => {
                return {
                  id: act.action!.id,
                  zh_name: act.action!.zh_name,
                };
              })
            );
            if (
              $field.field.input.value.set_type &&
              [WorkoutPlanSetType.Normal, WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(
                $field.field.input.value.set_type
              )
            ) {
              ui.$workout_action_select.methods.setMode("single");
            }
            if (
              $field.field.input.value.set_type &&
              [WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes($field.field.input.value.set_type)
            ) {
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
        // new MenuItemCore({
        //   label: "在前面插入",
        //   onClick() {},
        // }),
        // new MenuItemCore({
        //   label: "在后面插入",
        // }),
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
    $btn_create_submit: new ButtonCore({
      async onClick() {
        methods.create();
      },
    }),
    $btn_update_submit: new ButtonCore({
      async onClick() {
        methods.update();
      },
    }),
    $muscle: HumanBodyViewModel({ highlighted: [], disabled: true }),
  };
  let _action_profiles: Record<string, WorkoutActionProfile> = {};
  let _equipments: { id: number; zh_name: string }[] = [];
  let _state = {
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
  ui.$input_actions.onChange(() => {
    console.log("[PAGE]workout_plan/model - input_actions.onChange");
    methods.debounce_calc_estimated_duration();
  });
  ui.$workout_action_select.ui.$dialog.onStateChange(() => methods.refresh());
  ui.$muscle.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      ui.$workout_action_select.request.action.list.init();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
