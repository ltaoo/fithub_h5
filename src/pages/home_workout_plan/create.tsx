/**
 * @file 创建训练计划
 */
import { For, Show, Switch, Match } from "solid-js";
import { ArrowDown, ArrowUp, Binary, Bird, ChevronLeft, Loader, MoreHorizontal, Plus, Trash } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Dialog, DropdownMenu, Input, ListView, ScrollView, Textarea } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";
import { createWorkoutPlan, WorkoutPlanDetailsJSON250424 } from "@/biz/workout_plan/services";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { WorkoutPlanSetType, WorkoutPlanStepType } from "@/biz/workout_plan/constants";
import { getSetValueUnit, SetValueUnit } from "@/biz/set_value_input";
import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { RefCore } from "@/domains/ui/cur";
import { ButtonCore, DialogCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { seconds_to_hour, seconds_to_hour_template1, seconds_to_hour_with_template } from "@/utils";

import { WorkoutPlanValuesView } from "./workout_plan_values";
import { ActionInput, ActionInputViewModel } from "./components/action-input";
import { WorkoutPlanEditorViewModel } from "./model";
import { InputTextView } from "@/components/ui/input-text";
import { WorkoutPlanTagSelectView } from "@/components/workout-plan-tag-select";
import { WorkoutPlanTagSelectViewModel } from "@/biz/workout_plan_tag_select";
import { Presence } from "@/components/ui/presence";

function HomeWorkoutPlanCreateViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      create: new RequestCore(createWorkoutPlan, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
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
      props.history.push("root.workout_plan_profile", {
        id: String(r2.data.id),
      });
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
    $input_tag: WorkoutPlanTagSelectViewModel(),
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
          ui.$input_actions.validate().then((r) => {
            if (r.data) {
              methods.calc_estimated_duration(r.data);
            }
          });
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
                reps_unit: "次",
                weight: "12RM",
                rest_duration: 30,
              },
            ],
          });
        }
        ui.$input_actions.validate().then((r) => {
          if (r.data) {
            methods.calc_estimated_duration(r.data);
          }
        });
        ui.$workout_action_select.clear();
        ui.$workout_action_select.ui.$dialog.hide();
        bus.emit(Events.StateChange, { ..._state });
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
    $btn_back: new ButtonCore({
      onClick() {
        methods.cancel();
      },
    }),
    $btn_submit: new ButtonCore({
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
    get muscles() {
      return Object.values(_action_profiles)
        .map((act) => {
          return act.muscles;
        })
        .reduce((a, b) => {
          return [...a, ...b];
        }, []);
    },
    get equipments() {
      return Object.values(_action_profiles)
        .map((act) => {
          return act.equipments;
        })
        .reduce((a, b) => {
          return [...a, ...b];
        }, []);
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
  const [state, vm] = useViewModel(HomeWorkoutPlanCreateViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div class="bg-white p-4">
          <div>
            <div class="flex items-center gap-2">
              <Button
                store={vm.ui.$btn_back}
                icon={<ChevronLeft class="w-6 h-6 text-gray-800" />}
                class="flex items-center justify-center p-2 rounded-full bg-gray-200"
              ></Button>
              <div class="text-gray-600">创建训练计划</div>
            </div>
          </div>
          <div class="mt-4 space-y-4">
            <div class="field relative">
              <div class="flex">
                <div class="text-lg text-gray-800">标题</div>
                <div class="text-red-500">*</div>
              </div>
              <Input store={vm.ui.$input_title} class="mt-1" />
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">概要</div>
              </div>
              <Textarea store={vm.ui.$input_overview} class="mt-1" />
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">动作</div>
                <div class="text-red-500">*</div>
              </div>
              <div class="w-full space-y-3 my-2">
                <div class="">
                  <Show
                    when={state().fields.length}
                    fallback={
                      <div
                        class="flex justify-center p-4 rounded-md bg-gray-100"
                        onClick={() => {
                          vm.ui.$ref_action_in_menu.clear();
                          vm.ui.$workout_action_select.ui.$dialog.show();
                        }}
                      >
                        <div class="flex flex-col items-center text-gray-600">
                          <div>
                            <Plus class="w-8 h-8" />
                          </div>
                          <div>点击添加动作</div>
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
                                  class="z-0 absolute right-4 top-2"
                                  onClick={(event) => {
                                    // const client = event.currentTarget.getBoundingClientRect();
                                    // vm.ui.$ref_action_in_menu.select({
                                    //   id: field.id,
                                    //   idx: index(),
                                    // });
                                    // vm.ui.$menu.toggle({ x: client.x + 18, y: client.y + 18 });
                                    vm.ui.$menu.toggle({ x: 240 + 18, y: 0 + 18 });
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
                  </Show>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">预计时长</div>
              </div>
              <InputTextView store={vm.ui.$input_duration} class="mt-1" />
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">锻炼部位</div>
              </div>
              <div class="mt-1">
                <div class="flex flex-wrap gap-2">
                  <For each={state().muscles}>
                    {(v) => {
                      return (
                        <div>
                          <div>{v.id}</div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">所需器械</div>
              </div>
              <div class="mt-1">
                <div class="flex flex-wrap gap-2">
                  <For each={state().equipments}>
                    {(v) => {
                      return (
                        <div>
                          <div>{v.id}</div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="flex">
                <div class="text-lg text-gray-800">标签</div>
              </div>
              <WorkoutPlanTagSelectView store={vm.ui.$input_tag} class="mt-1" />
            </div>
          </div>
        </div>
        <div class="h-[112px]"></div>
      </ScrollView>
      <div class="z-10 fixed bottom-0 w-full py-2 bg-white">
        <div class="flex justify-center gap-2 w-full">
          <div class="flex items-center">
            <div class="flex items-center justify-center p-2 rounded-full bg-gray-200" onClick={vm.methods.cancel}>
              <ChevronLeft class="w-10 h-10 text-gray-800" />
            </div>
          </div>
          <div class="flex items-center">
            <div
              class="flex items-center justify-center p-4 rounded-full bg-gray-200"
              onClick={() => {
                vm.ui.$ref_action_in_menu.clear();
                vm.ui.$workout_action_select.ui.$dialog.show();
              }}
            >
              <Bird class="w-16 h-16 text-gray-800" />
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex items-center justify-center p-2 rounded-full bg-gray-200" onClick={vm.methods.submit}>
              <Binary class="w-10 h-10 text-gray-800" />
            </div>
          </div>
        </div>
        <div class="h-4"></div>
        <div class="safe-area-bottom"></div>
      </div>
      <Sheet store={vm.ui.$workout_action_select.ui.$dialog} position="bottom" size="sm">
        <div class="w-screen bg-white">
          <WorkoutActionSelect3View store={vm.ui.$workout_action_select} />
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
