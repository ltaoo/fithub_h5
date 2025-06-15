import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutPlanSelectView } from "@/components/workout-plan-select";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { useViewModel } from "@/hooks";
import { ButtonCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutPlanList, fetchWorkoutPlanListProcess } from "@/biz/workout_plan/services";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { MoreHorizontal } from "lucide-solid";
import { Button } from "@/components/ui";
import { WorkoutActionSelectView } from "@/components/workout-action-select3";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import { fetchWorkoutActionList, fetchWorkoutActionListProcess } from "@/biz/workout_action/services";

function CatchUpOnViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client })
      ),
    },
    workout_action: {
      list: $workout_action_list,
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };

  const ui = {
    $view: new ScrollViewCore({}),
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "选择计划",
          onClick() {
            ui.$menu.hide();
            ui.$workout_plan_select.ui.$dialog.show();
          },
        }),
      ],
    }),
    $form: new ObjectFieldCore({
      label: "",
      name: "",
      fields: {
        sets: new ArrayFieldCore({
          label: "",
          name: "sets",
          field() {
            return new ObjectFieldCore({
              label: "",
              name: "",
              fields: {
                remark: new SingleFieldCore({
                  label: "",
                  name: "remark",
                  input: new InputCore({ defaultValue: "" }),
                }),
                actions: new ArrayFieldCore({
                  label: "",
                  name: "actions",
                  field() {
                    return new ObjectFieldCore({
                      label: "",
                      name: "",
                      fields: {
                        action: new SingleFieldCore({
                          label: "动作",
                          name: "action",
                          input: new InputCore({ defaultValue: "" }),
                        }),
                        reps: new SingleFieldCore({
                          label: "计数",
                          name: "reps",
                          input: new InputCore({ defaultValue: "" }),
                        }),
                        reps_unit: new SingleFieldCore({
                          label: "计数单位",
                          name: "reps_unit",
                          input: new InputCore({ defaultValue: "" }),
                        }),
                        weight: new SingleFieldCore({
                          label: "计数",
                          name: "reps",
                          input: new InputCore({ defaultValue: "" }),
                        }),
                        weight_unit: new SingleFieldCore({
                          label: "计数单位",
                          name: "reps_unit",
                          input: new InputCore({ defaultValue: "" }),
                        }),
                      },
                    });
                  },
                }),
              },
            });
          },
        }),
      },
    }),
    $btn_add_workout_act: new ButtonCore({
      onClick() {
        ui.$workout_action_select.init();
        ui.$workout_action_select.ui.$dialog.show();
      },
    }),
    $workout_action_select: WorkoutActionSelectViewModel({
      defaultValue: [],
      list: request.workout_action.list,
      app: props.app,
      client: props.client,
      onOk(actions) {
        if (actions.length === 0) {
          return;
        }
      },
    }),
    $workout_plan_select: WorkoutPlanSelectViewModel({ defaultValue: [], list: request.workout_plan.list }),
  };
  let _state = {};
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayCatchUpOnView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(CatchUpOnViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Flex class="justify-between gap-2">
            <Button class="w-full" store={vm.ui.$btn_add_workout_act}>
              添加动作
            </Button>
            <IconButton
              class="w-[40px]"
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6" />
            </IconButton>
          </Flex>
        }
      >
        <div></div>
      </PageView>
      <Sheet ignore_safe_height store={vm.ui.$workout_plan_select.ui.$dialog} app={props.app}>
        <WorkoutPlanSelectView store={vm.ui.$workout_plan_select} />
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$workout_action_select.ui.$dialog} app={props.app}>
        <WorkoutActionSelectView store={vm.ui.$workout_action_select} app={props.app} />
      </Sheet>
    </>
  );
}
