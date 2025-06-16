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
  WorkoutPlanDetailsJSON250424,
} from "@/biz/workout_plan/services";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import { WorkoutPlanSetType, WorkoutPlanStepType } from "@/biz/workout_plan/constants";
import { getSetValueUnit, SetValueUnit } from "@/biz/set_value_input";
import { map_parts_with_ids } from "@/biz/muscle/data";
import { HumanBodyViewModel } from "@/biz/muscle/human_body";
import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { seconds_to_hour, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";
import { debounce } from "@/utils/lodash/debounce";

import { ActionInput, ActionInputViewModel } from "./components/action-input";
import { ListCore } from "@/domains/list";

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
  function calc_estimated_duration(
    v: { set_count: number; set_rest_duration: number; actions: { reps: number; reps_unit: SetValueUnit }[] }[]
  ) {
    const actions = v;
    let duration = 0;
    for (let i = 0; i < actions.length; i += 1) {
      const set = actions[i];
      let set_duration = Number(set.set_rest_duration);
      for (let j = 0; j < set.actions.length; j += 1) {
        const act = set.actions[j];
        const reps = Number(act.reps);
        const reps_unit = act.reps_unit;
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
    const text = seconds_to_hour_with_template(duration, seconds_to_hour_template1);
    ui.$input_duration.setValue(text);
    return duration;
  }
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    calc_estimated_duration,
    debounce_calc_estimated_duration: debounce(800, () => {
      ui.$input_actions.validate().then((r) => {
        // console.log("before methods.calc_estimated_duration", r.data);
        if (r.data) {
          methods.calc_estimated_duration(r.data);
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
      // @ts-ignore
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
      const value_estimated_duration = methods.calc_estimated_duration(value_actions);
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
          if (!act.reps) {
            return Result.Err("存在未填写的表单");
          }
          if (!act.reps_unit) {
            return Result.Err("存在未填写的表单");
          }
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
      props.history.back();
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
          actions: vv.actions.map((vvv) => {
            return {
              action: vvv.action,
              reps: vvv.reps,
              reps_unit: vvv.reps_unit,
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
            if (!act_ids.includes(act.action_id)) {
              act_ids.push(act.action_id);
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
            set_count: 3,
            set_rest_duration: 90,
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
    methods.debounce_calc_estimated_duration();
  });
  ui.$workout_action_select.ui.$dialog.onStateChange(() => methods.refresh());

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
