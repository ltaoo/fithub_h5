import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { InputWithKeyboardView } from "@/components/input-with-keyboard";
import { Select } from "@/components/ui/select";
import { Button, Input, Textarea } from "@/components/ui";
import { TabHeader } from "@/components/ui/tab-header";
import { Flex } from "@/components/flex/flex";
import { RepsInputView } from "@/pages/workout_plan/components/input-reps";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { FieldV2 } from "@/components/fieldv2/field";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputWithKeyboardModel } from "@/biz/input_with_keyboard";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import {
  fetchCardioWorkoutActionList,
  fetchCardioWorkoutActionListProcess,
  fetchWorkoutActionListProcess,
} from "@/biz/workout_action/services";
import {
  createWorkoutDayFree,
  WorkoutDayStepDetailsJSON250629,
  WorkoutDayStepProgressJSON250629,
} from "@/biz/workout_day/services";
import { RepsInputModel } from "@/biz/input_with_keyboard/input_reps";
import { getSetValueUnit } from "@/biz/input_set_value";
import { TimePickerModel } from "@/biz/time_picker/time";
import { ClockModel } from "@/biz/time_picker/clock";
import { TimePickerView } from "@/components/ui/time-picker";
import dayjs from "dayjs";
import { toNumber } from "@/utils/primitive";
import { WorkoutPlanSetType, WorkoutPlanType } from "@/biz/workout_plan/constants";
import { RefCore } from "@/domains/ui/cur";
import { toFixed } from "@/utils";
import { Result } from "@/domains/result";

function CardioViewModel(props: ViewComponentProps) {
  const request = {
    workout_action: {
      list: new ListCore(
        new RequestCore(fetchCardioWorkoutActionList, {
          process: fetchCardioWorkoutActionListProcess,
          client: props.client,
        }),
        {
          pageSize: 50,
        }
      ),
    },
    workout_day: {
      create_free: new RequestCore(createWorkoutDayFree, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickCardio(v: { label: string; value: number }) {
      ui.$ref_cardio_action.select({
        id: v.value,
        zh_name: v.label,
      });
      ui.$form.fields.action.input.select(v.value);
      methods.refresh();
    },
  };
  let CardioGroupWithType: { title: string; data: { label: string; value: number }[] }[] = [
    {
      title: "器械",
      data: [],
    },
    {
      title: "室内",
      data: [],
    },
    {
      title: "户外",
      data: [],
    },
  ];
  const $clock = ClockModel({ time: dayjs().valueOf() });
  const ui = {
    $view: new ScrollViewCore(),
    $history: props.history,
    $tab_cardio: new TabHeaderCore({
      key: "id",
      selected: "器械",
      options: CardioGroupWithType.map((v) => {
        return {
          id: v.title,
          text: v.title,
        };
      }),
    }),
    $form: new ObjectFieldCore({
      rules: [
        {
          custom(v) {
            const started_at = v.start_at;
            const finished_at = v.finished_at;
            if (finished_at.isBefore(started_at)) {
              return Result.Err("结束时间不能早于开始时间");
            }
            return Result.Ok(null);
          },
        },
      ],
      fields: {
        title: new SingleFieldCore({
          label: "标题",
          input: new InputCore({ defaultValue: `${$clock.state.month_text}月${$clock.state.date_text}日 有氧` }),
        }),
        type: new SingleFieldCore({
          input: new SelectCore({
            defaultValue: WorkoutPlanType.Cardio,
            options: [
              {
                label: "有氧",
                value: WorkoutPlanType.Cardio,
              },
            ],
          }),
        }),
        duration: new SingleFieldCore({
          label: "记录",
          input: RepsInputModel({
            defaultValue: "60",
            suffix: getSetValueUnit("分"),
            app: props.app,
            onChange(v) {
              if (!ui.$form.fields.duration.input.ui.$dialog.state.open) {
                return;
              }
              console.log("[]vvv change", v, v.unit === getSetValueUnit("分"));
              if (v.unit === getSetValueUnit("分")) {
                const num = toNumber(v.num, 0);
                const finished_at = ui.$form.fields.finished_at.input.value;
                const started_at = finished_at.subtract(num, "minute");
                ui.$form.fields.start_at.input.setValue(started_at.valueOf());
              }
            },
          }),
        }),
        finished_at: new SingleFieldCore({
          label: "结束时间",
          input: TimePickerModel({
            $clock: ClockModel({ time: new Date().valueOf() }),
            app: props.app,
            onOk() {
              const finished_at = ui.$form.fields.finished_at.input.value;
              const started_at = ui.$form.fields.start_at.input.value;
              if (finished_at.isBefore(started_at)) {
                props.app.tip({
                  text: ["结束时间不能早于开始时间"],
                });
                return;
              }
              const diff = finished_at.startOf("minute").diff(started_at.startOf("minute"), "minute");
              ui.$form.fields.duration.input.setNum(String(diff));
              ui.$form.fields.finished_at.input.ui.$dialog.hide();
            },
          }),
        }),
        start_at: new SingleFieldCore({
          label: "开始时间",
          input: TimePickerModel({
            $clock: ClockModel({ time: dayjs().subtract(60, "minute").valueOf() }),
            app: props.app,
            onOk() {
              const finished_at = ui.$form.fields.finished_at.input.value;
              const started_at = ui.$form.fields.start_at.input.value;
              if (finished_at.isBefore(started_at)) {
                props.app.tip({
                  text: ["开始时间不能晚于结束时间"],
                });
                return;
              }
              const diff = finished_at.startOf("minute").diff(started_at.startOf("minute"), "minute");
              ui.$form.fields.duration.input.setNum(String(diff));
              ui.$form.fields.finished_at.input.ui.$dialog.hide();
            },
          }),
        }),
        action: new SingleFieldCore({
          label: "有氧类型",
          input: new SelectCore({
            defaultValue: 1,
            options: [],
          }),
        }),
        remark: new SingleFieldCore({
          label: "备注",
          input: new InputCore({ defaultValue: "", placeholder: "请输入" }),
        }),
      },
    }),
    $btn_submit: new ButtonCore({
      async onClick() {
        const act = ui.$ref_cardio_action.value;
        if (!act) {
          props.app.tip({
            text: ["请选择一个有氧动作"],
          });
          return;
        }
        const r = await ui.$form.validate();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        const v = r.data;
        const pending_steps: WorkoutDayStepProgressJSON250629 = {
          v: "250629",
          step_idx: 0,
          set_idx: 0,
          act_idx: 0,
          touched_set_uid: [],
          sets: [
            {
              step_uid: 0,
              uid: 0,
              actions: [
                {
                  uid: 0,
                  action_id: act.id,
                  action_name: act.zh_name,
                  reps: toNumber(v.duration.num, 0),
                  reps_unit: v.duration.unit,
                  weight: 0,
                  weight_unit: "自重",
                  start_at1: 0,
                  start_at2: 0,
                  start_at3: 0,
                  finished_at1: 0,
                  finished_at2: 0,
                  finished_at3: 0,
                  time1: 0,
                  time2: 0,
                  time3: 0,
                  completed: true,
                  completed_at: v.finished_at.unix(),
                },
              ],
              remaining_time: 0,
              exceed_time: 0,
              completed: true,
              start_at: 0,
              finished_at: 0,
              remark: "",
            },
          ],
        };
        const updated_details: WorkoutDayStepDetailsJSON250629 = {
          v: "250629",
          steps: [
            {
              uid: 0,
              note: "",
              sets: [
                {
                  uid: 0,
                  type: WorkoutPlanSetType.Normal,
                  rest_duration: {
                    num: 0,
                    unit: getSetValueUnit("秒"),
                  },
                  weight: {
                    num: "6",
                    unit: getSetValueUnit("RPE"),
                  },
                  actions: [
                    {
                      uid: 0,
                      id: act.id,
                      zh_name: act.zh_name,
                      reps: {
                        num: toNumber(v.duration.num, 0),
                        unit: v.duration.unit,
                      },
                      weight: {
                        num: "0",
                        unit: getSetValueUnit("自重"),
                      },
                      rest_duration: {
                        num: 0,
                        unit: getSetValueUnit("分"),
                      },
                    },
                  ],
                },
              ],
            },
          ],
        };
        const body = {
          title: v.title,
          type: WorkoutPlanType.Cardio,
          pending_steps: JSON.stringify(pending_steps),
          updated_details: JSON.stringify(updated_details),
          finish_when_created: true,
          finished_at: v.finished_at.toDate(),
          start_at: v.start_at.toDate(),
          remark: v.remark,
          duration: (() => {
            if (v.duration.unit === getSetValueUnit("秒")) {
              return toFixed(toNumber(v.duration.num, 0) / 60, 0);
            }
            if (v.duration.unit === getSetValueUnit("分")) {
              return toNumber(v.duration.num, 0);
            }
            if (v.duration.unit === getSetValueUnit("小时")) {
              return toNumber(v.duration.num, 0) * 60;
            }
            return v.finished_at.diff(v.start_at, "minute");
          })(),
        };
        console.log(body);
        ui.$btn_submit.setLoading(true);
        const r2 = await request.workout_day.create_free.run(body);
        ui.$btn_submit.setLoading(false);
        if (r2.error) {
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        props.history.push("root.workout_day_profile", {
          id: String(r2.data.id),
        });
      },
    }),
    $ref_cardio_action: new RefCore<{ id: number; zh_name: string }>(),
  };

  // let _selected_cardio = 0;
  let _state = {
    get cardio_group() {
      const matched = CardioGroupWithType.find((v) => v.title === ui.$tab_cardio.selectedTabId);
      if (!matched) {
        return null;
      }
      console.log(matched);
      return {
        ...matched,
        data: matched.data.map((vv) => {
          return {
            ...vv,
            selected: vv.value === ui.$ref_cardio_action.value?.id,
          };
        }),
      };
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  request.workout_action.list.onStateChange(() => methods.refresh());
  ui.$tab_cardio.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      console.log("[PAGE]workout_day/cardio - ready", ui.$tab_cardio.selectedTabId);
      const r = await request.workout_action.list.search({});
      if (r.error) {
        return;
      }
      const groups: Record<string, { id: number; zh_name: string }[]> = {};
      for (let i = 0; i < r.data.dataSource.length; i += 1) {
        const act = r.data.dataSource[i];
        (() => {
          if (act.tags.includes("器械")) {
            groups["器械"] = groups["器械"] || [];
            groups["器械"].push(act);
            return;
          }
          if (act.tags.includes("室内")) {
            groups["室内"] = groups["室内"] || [];
            groups["室内"].push(act);
            return;
          }
          if (act.tags.includes("户外")) {
            groups["户外"] = groups["户外"] || [];
            groups["户外"].push(act);
            return;
          }
        })();
      }
      CardioGroupWithType = Object.keys(groups).map((title) => {
        return {
          title,
          data: groups[title].map((v) => {
            return {
              value: v.id,
              label: v.zh_name,
            };
          }),
        };
      });
      const selected_cardio = _state.cardio_group?.data[0];
      if (selected_cardio) {
        ui.$ref_cardio_action.select({
          id: selected_cardio.value,
          zh_name: selected_cardio.label,
        });
      }
      // console.log("[PAGE]workout_day/cardio - ready before methods.refresh", selected_cardio);
      methods.refresh();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export function CardioCreateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(CardioViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <Flex>
            <Button class="w-full" store={vm.ui.$btn_submit}>
              保存
            </Button>
          </Flex>
        }
      >
        <div class="space-y-4">
          <div>
            <FieldV2 store={vm.ui.$form.fields.title}>
              <Input store={vm.ui.$form.fields.title.input}></Input>
            </FieldV2>
            <TabHeader store={vm.ui.$tab_cardio}></TabHeader>
            <Show when={state().cardio_group}>
              <div class="grid grid-cols-4 gap-2 mt-2">
                <For each={state().cardio_group!.data}>
                  {(vv) => {
                    return (
                      <div
                        classList={{
                          "p-2 border-2 border-w-fg-3 text-w-fg-1 rounded-lg text-center": true,
                          "border-w-fg-2 bg-w-bg-5 text-w-fg-0": vv.selected,
                        }}
                        onClick={() => {
                          vm.methods.handleClickCardio(vv);
                        }}
                      >
                        <div>{vv.label}</div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
          <FieldV2 store={vm.ui.$form.fields.duration}>
            <RepsInputView store={vm.ui.$form.fields.duration}></RepsInputView>
          </FieldV2>
          <Flex class="gap-2">
            <FieldV2 store={vm.ui.$form.fields.start_at}>
              <TimePickerView store={vm.ui.$form.fields.start_at.input}></TimePickerView>
            </FieldV2>
            <FieldV2 store={vm.ui.$form.fields.finished_at}>
              <TimePickerView store={vm.ui.$form.fields.finished_at.input}></TimePickerView>
            </FieldV2>
          </Flex>
          <FieldV2 store={vm.ui.$form.fields.remark}>
            <Textarea store={vm.ui.$form.fields.remark.input}></Textarea>
          </FieldV2>
        </div>
      </PageView>
    </>
  );
}
