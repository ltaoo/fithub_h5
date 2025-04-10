/**
 * 健身动作录入
 */
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ScrollView, Textarea } from "@/components/ui";
import { WorkoutActionType } from "@/biz/workout_action/constants";
import { createWorkoutAction } from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { parseJSONStr } from "@/utils";

import { WorkoutActionValuesView } from "./action_form";
import { WorkoutActionViewModel } from "./model";

function HomeActionCreatePageViewModel(props: ViewComponentProps) {
  let _loading = false;
  let _state = {
    get loading() {
      return _loading;
    },
  };
  const request = {
    action: {
      create: new RequestCore(createWorkoutAction, { client: props.client }),
    },
  };
  const $model = WorkoutActionViewModel(props);
  const ui = {
    $view: new ScrollViewCore({}),
    $values: $model.$values,
    $back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $submit: new ButtonCore({
      async onClick() {
        const r = await $model.toBody();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        const body = r.data;
        const r2 = await request.action.create.run(body);
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
    }),
    $json_btn: new ButtonCore({
      onClick() {
        ui.$json_dialog.show();
      },
    }),
    $json_input: new InputCore({
      defaultValue: "",
    }),
    $json_dialog: new DialogCore({
      title: "导入 JSON",
      onOk() {
        const v = ui.$json_input.value;
        if (!v) {
          props.app.tip({
            text: ["请输入 JSON"],
          });
          return;
        }
        const r1 = parseJSONStr<{
          name: string;
          chinese_name: string;
          alias: string[];
          tags: string[];
          target_muscles: {
            id: string;
            name: string;
            chinese_name: string;
            contraction_types: string[];
          }[];
          benefits: string[];
          starting_position: string;
          range_and_breathing: string[];
          action_points: string[];
          advanced_actions: {
            id: string;
            name: string;
            chinese_name: string;
          }[];
          regressed_actions: {
            id: string;
            name: string;
            chinese_name: string;
          }[];
          problems: {
            problem: string;
            muscles: {
              id: string;
              name: string;
              reason: string;
              solution: string;
              actions: {
                id: string;
                name: string;
                description: string;
              }[];
            }[];
          }[];
        }>(v);
        if (r1.error) {
          props.app.tip({
            text: [r1.error.message],
          });
          return;
        }
        const json = r1.data;
        console.log(json);
        const values = {
          name: json.name,
          zh_name: json.chinese_name,
          alias: json.alias,
          overview: json.benefits.join("\n"),
          type: WorkoutActionType.RESISTANCE,
          level: 5,
          tags1: json.tags,
          muscles: json.target_muscles
            .map((muscle) => {
              const matched = $model.muscles.find((m) => m.zh_name === muscle.chinese_name);
              if (!matched) {
                return null;
              }
              return {
                id: matched.id,
              };
            })
            .filter((v) => v !== null),
          details: {
            start_position: json.starting_position,
            steps: json.range_and_breathing,
          },
          points: json.action_points,
          problems: json.problems.map((problem) => {
            return {
              title: problem.problem,
              reason: problem.muscles.map((muscle) => muscle.reason).join("\n"),
              solutions: problem.muscles.map((muscle) => muscle.solution),
            };
          }),
        };
        ui.$json_dialog.hide();
        $model.$values.setValue(values);
        $model.$values.refresh();
      },
    }),
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: {
      state: typeof _state;
    };
  };

  const bus = base<TheTypesOfEvents>();

  const _methods = {
    setState(state: Partial<typeof _state>) {
      _state = { ..._state, ...state };
      bus.emit(Events.StateChange, { state: _state });
    },
  };
  return {
    state: _state,
    methods: _methods,
    ui,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeActionCreatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeActionCreatePageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <div class="bg-white p-4 rounded-lg">
          <div class="flex flex-col gap-4">
            <WorkoutActionValuesView store={vm.ui.$values} />
          </div>
        </div>
        <div class="h-[68px]"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div class="flex gap-2">
            <Button variant="subtle" store={vm.ui.$back}>
              返回
            </Button>
            <Button variant="subtle" store={vm.ui.$json_btn}>
              导入JSON
            </Button>
            <Button store={vm.ui.$submit}>提交</Button>
          </div>
        </div>
      </ScrollView>
      <Dialog store={vm.ui.$json_dialog}>
        <div class="w-[520px] p-4">
          <Textarea store={vm.ui.$json_input} />
        </div>
      </Dialog>
    </>
  );
}
