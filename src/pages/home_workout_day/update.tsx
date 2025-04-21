/**
 * @file 训练日记录
 */
import { For, Show } from "solid-js";
import { ChevronLeft, CircleCheck, Info, Loader, MoreHorizontal, StopCircle } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Dialog, DropdownMenu, Input, ListView, ScrollView } from "@/components/ui";
import { WorkoutActionCard } from "@/components/workout-action-card";
import {
  fetchWorkoutDayProfile,
  fetchWorkoutDayProfileProcess,
  finishWorkoutDay,
  giveUpHWorkoutDay,
  updateWorkoutDay,
} from "@/biz/workout_day/services";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { CountdownViewModel } from "@/biz/countdown";
import { WorkoutActionMultipleSelectViewModel } from "@/biz/workout_action_multiple_select";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import {
  ButtonCore,
  ButtonInListCore,
  CheckboxCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  InputInListCore,
  MenuItemCore,
  PresenceCore,
  ScrollViewCore,
} from "@/domains/ui";
import { RefCore } from "@/domains/ui/cur";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";
import { SetValueInputKeyboard } from "@/components/set-value-input-keyboard";
import { SetValueInputViewModel } from "@/biz/set_value_input";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { TimerView } from "@/components/timer";
import { Sheet } from "@/components/ui/sheet";
import { Presence } from "@/components/ui/presence";
import { FormInputInterface } from "@/domains/ui/formv2/types";
import { SetCompleteBtn } from "@/components/set-complete-btn";
import { ToolsBar } from "@/components/tools-bar";
import { WorkoutActionSelect2View } from "@/components/workout-action-select2";
import { Result } from "@/domains/result";

import { SetCountdownView, SetCountdownViewModel } from "./components/set-countdown";
import { SetValueInput } from "./components/set-value-input";
import { SetDropdownMenu } from "./components/set-dropdown-menu";
import { SetActionView, SetActionViewModel } from "./components/set-action";
import { DayCountdown } from "./components/day-countdown";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";

export function HomeWorkoutDayUpdateViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
    },
    workout_action: {
      list_by_id: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
      profile: new RequestCore(fetchWorkoutActionProfile, {
        process: fetchWorkoutActionProfileProcess,
        client: props.client,
      }),
    },
    workout_day: {
      profile: new RequestCore(fetchWorkoutDayProfile, {
        process: fetchWorkoutDayProfileProcess,
        client: props.client,
      }),
      update: new RequestCore(updateWorkoutDay, { client: props.client }),
      give_up: new RequestCore(giveUpHWorkoutDay, { client: props.client }),
      finish: new RequestCore(finishWorkoutDay, { client: props.client }),
    },
  };
  const methods = {
    startWorkoutDay() {
      // props.storage.set("pending_workout_day", {
      //   started_at: Date.now().valueOf() / 1000,
      //   data: props.storage.get("pending_workout_day").data,
      //   step_idx: _cur_step_idx,
      //   set_idx: _next_set_idx,
      // });
      bus.emit(Events.StateChange, { ..._state });
    },
    beforeShowNumInput(opt: { step_idx: number; set_idx: number; act_idx: number; x: number; y: number }) {
      const k = ui.$ref_input_key.value;
      if (k) {
        const $field = methods.getField(k);
        if ($field) {
          $field.setStatus("normal");
        }
      }
      const keyboard_height = 420;
      if (props.app.screen.height - opt.y < keyboard_height) {
        const v = keyboard_height - (props.app.screen.height - opt.y);
        if (v > 0) {
          methods.setHeight(v);
        }
      }
    },
    getField(opt: { key: string; for: "reps" | "weight" }) {
      if (opt.for === "reps") {
        return ui.$fields_reps.get(opt.key) ?? null;
      }
      if (opt.for === "weight") {
        return ui.$fields_weight.get(opt.key) ?? null;
      }
      return null;
    },
    showNumInput(opt: { key: string; for: "reps" | "weight" }) {
      ui.$ref_input_key.select(opt);
      const $field = methods.getField(opt);
      if (!$field) {
        return;
      }
      // console.log("[]before showNumInput", input.value);
      ui.$set_value_input.setValue($field.input.value);
      ui.$set_value_input.setUnit($field.input.unit);
      if (opt.for === "reps") {
        ui.$set_value_input.setRepsOptions();
      }
      if (opt.for === "weight") {
        ui.$set_value_input.setWeightOptions();
      }
      if (!ui.$set_value_input_dialog.state.open) {
        ui.$set_value_input_dialog.show();
      }
    },
    setCurSet(opt: { step_idx: number; set_idx: number }) {
      _cur_step_idx = opt.step_idx;
      _next_set_idx = opt.set_idx;
    },
    nextSet() {
      const cur_step = _steps[_cur_step_idx];
      // const next_set = cur_step.list[_next_set_idx];
      _next_set_idx += 1;
      if (_next_set_idx >= cur_step.list.length - 1) {
        _cur_step_idx += 1;
        _next_set_idx = 0;
        if (_cur_step_idx >= _steps.length - 1) {
          return;
        }
      }
      const { data } = methods.toBody();
      request.workout_day.update.run({
        id: props.view.query.id,
        step_idx: _cur_step_idx,
        set_idx: _next_set_idx,
        data,
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    handleCompleteSet(opt: { step_idx: number; set_idx: number; act_idx: number }) {
      console.log("[PAGE]workout_day/create - handleCompleteSet", opt);
      if (ui.$set_value_input_dialog.state.open) {
        ui.$set_value_input_dialog.hide();
      }
      const k = `${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`;
      const $field_reps = ui.$fields_reps.get(k);
      const $field_weight = ui.$fields_weight.get(k);
      const $input_check = ui.$inputs_check.get(k);
      if (!$field_reps || !$field_weight || !$input_check) {
        console.log("[PAGE]workout_day/create - no inputs", $field_reps, $field_weight, $input_check);
        return;
      }
      if ($input_check.value === true) {
        $input_check.setValue(false);
        return;
      }

      const vv_reps = Number($field_reps.input.value || $field_reps.input.placeholder);
      const vv_weight = Number($field_weight.input.value || $field_weight.input.placeholder);

      const errors: { msg: string }[] = [];

      if (isNaN(vv_weight)) {
        errors.push({
          msg: `不合法的重量`,
        });
        $field_weight.setStatus("error");
        return;
      }
      if (isNaN(vv_reps)) {
        errors.push({
          msg: `不合法的数量`,
        });
        $field_reps.setStatus("error");
        return;
      }
      if (errors.length > 0) {
        console.log("[PAGE]workout_day/create - errors", errors);
        return;
      }
      $input_check.setValue(true);
      _cur_step_idx = opt.step_idx;
      _next_set_idx = opt.set_idx + 1;

      if (_cur_step_idx === _steps.length - 1) {
        const step = _steps[_cur_step_idx];
        if (opt.set_idx === step.list.length - 1) {
          methods.completeWorkoutDay();
          return;
        }
      }

      const _next_set = _steps[opt.step_idx].list[_next_set_idx];
      // if (_next_set && _next_set.type === "rest") {
      //   _next_set_idx += 1;
      // }
      if (_next_set_idx >= _steps[opt.step_idx].list.length) {
        _next_set_idx = 0;
        _cur_step_idx = opt.step_idx + 1;
      }
      methods.refreshWorkoutDayStats({
        step_idx: _cur_step_idx,
        set_idx: _next_set_idx,
      });
      if (_cur_step_idx >= _steps.length) {
        // methods.refreshWorkoutDayStats();
        ui.$dialog_confirm_complete.show();
        return;
      }
      let idx = opt.set_idx + 1;
      let next_set = _steps[opt.step_idx].list[idx];
      if (next_set && next_set.type === "rest") {
        idx = opt.set_idx + 2;
        next_set = _steps[opt.step_idx].list[idx];
      }
      if (next_set && next_set.type === "set") {
        for (let i = 0; i < next_set.actions.length; i++) {
          const kk = `${opt.step_idx}-${opt.set_idx}-${i}`;
          const k = `${opt.step_idx}-${idx}-${i}`;
          const $field_prev_reps = ui.$fields_reps.get(kk);
          const $field_prev_weight = ui.$fields_weight.get(kk);
          const $field_reps = ui.$fields_reps.get(k);
          const $field_weight = ui.$fields_weight.get(k);
          if ($field_prev_reps && $field_reps) {
            const v = Number($field_prev_reps.input.value || $field_prev_reps.input.placeholder);
            if (v) {
              $field_reps.input.setPlaceholder(v);
            }
            $field_reps.input.setUnit($field_prev_reps.input.unit);
          }
          if ($field_prev_weight && $field_weight) {
            const v = Number($field_prev_weight.input.value || $field_prev_weight.input.placeholder);
            if (!isNaN(v)) {
              $field_weight.input.setPlaceholder(v.toString());
            }
            $field_weight.input.setUnit($field_prev_weight.input.unit);
          }
        }
      }
      const payload = {
        actions: [] as { id: number; reps: string; weight: string }[],
      };
      console.log("[PAGE]workout_day/create", payload);
      // const set = _steps[opt.step_idx].list[opt.set_idx];
      const next_rest = _steps[opt.step_idx].list[_next_set_idx];
      const $countdown = ui.$countdowns.get(`${_cur_step_idx}-${_next_set_idx}`);
      console.log("[]handleCompleteSet - ", _cur_step_idx, _next_set_idx, $countdown);
      if (next_rest.type === "rest" && $countdown) {
        $countdown.start();
      }
      // const actions = set.actions[opt.act_idx];
      bus.emit(Events.StateChange, { ..._state });
    },
    handleDeleteAction(opt: { step_idx: number; set_idx: number; act_idx: number }) {
      console.log("[PAGE]workout_day/create - handleDeleteSet", opt);
    },
    resetStats() {
      _stats.uncompleted_actions = [];
      _stats.sets = [];
    },
    completeWorkoutDay() {
      const profile = request.workout_day.profile.response;
      if (!profile) {
        return;
      }
      _stats.finished_at = dayjs().format("YYYY-MM-DD");
      _stats.duration = dayjs().diff(profile.started_at, "minutes") + "分钟";
      let total_volume = 0;
      const uncompleted_actions: { step_idx: number; set_idx: number; act_idx: number }[] = [];
      for (let a = 0; a < _steps.length; a += 1) {
        for (let b = 0; b < _steps[a].list.length; b += 1) {
          const set = _steps[a].list[b];
          const actions = [];
          for (let c = 0; c < set.actions.length; c += 1) {
            const k = `${a}-${b}-${c}`;
            const $field_reps = ui.$fields_reps.get(k);
            const $field_weight = ui.$fields_weight.get(k);
            const $input_check = ui.$inputs_check.get(k);
            if ($input_check && $field_reps && $field_weight) {
              if ($input_check.value && $field_reps.input.value && $field_weight.input.value) {
                const v_reps = Number($field_reps.input.value);
                const v_weight = Number($field_weight.input.value);
                let volume = v_weight;
                if ($field_weight.input.unit === "磅") {
                  volume = Number((volume * 0.45).toFixed(1));
                }
                total_volume += volume;
                actions.push({
                  id: set.actions[c].id,
                  zh_name: set.actions[c].zh_name,
                  reps: v_reps,
                  reps_unit: $field_reps.input.unit,
                  weight: v_weight,
                  weight_unit: $field_weight.input.unit,
                });
              }
              if ($input_check.value === false) {
                uncompleted_actions.push({
                  step_idx: a,
                  set_idx: b,
                  act_idx: c,
                });
              }
            }
          }
          if (actions.length) {
            _stats.sets.push({
              actions,
            });
          }
        }
      }
      _stats.total_volume = total_volume;
      _stats.uncompleted_actions = uncompleted_actions;
      ui.$dialog_confirm_complete.show();
      bus.emit(Events.StateChange, { ..._state });
    },
    toBody() {
      const total = {
        sets: 0,
        weight: 0,
        tips: [] as string[],
      };
      const data: {
        step_idx: number;
        set_idx: number;
        act_idx: number;
        reps: number;
        reps_unit: string;
        weight: number;
        weight_unit: string;
        completed: boolean;
      }[] = [];
      for (let i = 0; i < _steps.length; i++) {
        const step = _steps[i];
        for (let j = 0; j < step.list.length; j++) {
          const set = step.list[j];
          let set_completed = false;
          for (let k = 0; k < set.actions.length; k++) {
            const kkk = `${i}-${j}-${k}`;
            const $field_reps = ui.$fields_reps.get(kkk);
            const $field_weight = ui.$fields_weight.get(kkk);
            const $input_check = ui.$inputs_check.get(kkk);

            const completed = $input_check?.value === true;
            if (completed === false) {
              set_completed = false;
            }
            if (completed === true && $field_reps && $field_weight) {
              const vv_reps = Number($field_reps.input.value || $field_reps.input.placeholder);
              const vv_weight = Number($field_weight.input.value || $field_weight.input.placeholder);
              data.push({
                step_idx: i,
                set_idx: j,
                act_idx: k,
                reps: vv_reps,
                reps_unit: $field_reps.input.unit,
                weight: vv_weight,
                weight_unit: $field_weight.input.unit,
                completed: completed,
              });
              total.weight += vv_weight * vv_reps;
            }
          }
          if (set_completed === false) {
            total.tips.push(`${i + 1}/${j + 1}组未完成`);
          }
          if (set_completed) {
            total.sets += 1;
          }
        }
      }
      return {
        total,
        data,
      };
    },
    refreshWorkoutDayStats(opt: { step_idx: number; set_idx: number }) {
      const { data } = methods.toBody();
      // console.log("[PAGE]workout_day/create - total", total);
      request.workout_day.update.run({
        id: props.view.query.id,
        step_idx: opt.step_idx,
        set_idx: opt.set_idx,
        data,
      });
    },
    async showWorkoutActionProfile(id: number | string) {
      ui.$workout_action_profile_dialog.show();
      const r = await request.workout_action.profile.run({ id });
      if (r.error) {
        props.app.tip({
          text: ["获取动作详情失败", r.error.message],
        });
        return;
      }
      _cur_workout_action = r.data;
      bus.emit(Events.StateChange, { ..._state });
    },
    async giveUp() {
      const r = await request.workout_day.give_up.run({ id: Number(props.view.query.id) });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      ui.$dialog_confirm_complete.hide();
      props.history.push("root.home_layout.workout_plan_layout.recommend");
    },
    setHeight(height: number) {
      _height = height;
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const $set_actions = new Map<string, SetActionViewModel>();
  const $fields_weight = new Map<string, SingleFieldCore<any>>();
  const $fields_reps = new Map<string, SingleFieldCore<any>>();
  const $inputs_check = new Map<string, InputCore<any>>();
  const $countdowns = new Map<string, SetCountdownViewModel>();
  const btns_more = new Map<string, ButtonCore>();
  const ui = {
    $set_actions,
    $fields_weight,
    $fields_reps,
    $inputs_check,
    $countdowns,
    btns_more,
    $set_menu: new DropdownMenuCore({
      // side: "left",
      align: "start",
      items: [
        new MenuItemCore({
          label: "修改动作",
          onClick() {
            ui.$set_menu.hide();
            ui.$ref_action_dialog_for.select("change_action");
            // ui.$ref_cur_set_key
            ui.$workout_action_dialog.request.action.list.init();
            ui.$workout_action_dialog.ui.$dialog.show();
          },
        }),
        new MenuItemCore({
          label: "删除",
        }),
      ],
    }),
    $ref_cur_set_key: new RefCore<string>(),
    $ref_cur_step: new RefCore<{ id?: number | string; idx: number }>(),
    $ref_input_key: new RefCore<{ key: string; for: "reps" | "weight" }>(),
    $ref_action_dialog_for: new RefCore<"add_action" | "change_action">(),
    $view: new ScrollViewCore(),
    $workout_plan_dialog_btn: new ButtonCore(),
    $action_select_dialog: new DialogCore({}),
    $action_select_view: new ScrollViewCore(),
    $action_select: WorkoutActionMultipleSelectViewModel({
      list: $workout_action_list,
      defaultValue: [],
      client: props.client,
    }),
    $start_btn: new ButtonCore(),
    $input_reps: new InputInListCore({
      defaultValue: "",
    }),
    $input_weight: new InputInListCore({
      defaultValue: "",
    }),
    $workout_action_dialog: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      client: props.client,
      list: $workout_action_list,
      onOk(acts) {
        if (acts.length === 0) {
          props.app.tip({
            text: ["请选择动作"],
          });
          return;
        }
        const target = ui.$ref_action_dialog_for.value;
        console.log("[]$workout_action_dialog - after target", target);
        if (!target) {
          return;
        }
        if (target === "change_action") {
          const set_idx = ui.$ref_cur_set_key.value;
          console.log("[]$ref_cur_set_key - after set_idx", set_idx);
          if (!set_idx) {
            props.app.tip({
              text: ["操作异常"],
            });
            return;
          }
          const [a, b] = set_idx.split("-").map((v) => Number(v));
          const step = _steps[a];
          const set = step.list[b];
          console.log("[]$find matched set - after set_idx", set);
          for (let i = 0; i < set.actions.length; i += 1) {
            // const act = set.actions[i];
            const $act = ui.$set_actions.get(`${a}-${b}-${i}`);
            $act?.change({ id: acts[0].id, zh_name: acts[0].zh_name });
          }
          ui.$workout_action_dialog.ui.$dialog.hide();
          return;
        }
        const v = ui.$ref_cur_step.value;
        console.log("[PAGE]workout_day/create", acts, v);
        if (v) {
          const step = _steps[v.idx];
          if (acts.length === 1) {
            _steps = [
              ..._steps.slice(0, v.idx),
              {
                id: step.id,
                idx: step.idx,
                list: step.list.map((set) => {
                  return {
                    type: "set",
                    actions: acts.map((act) => {
                      return {
                        id: Number(act.id),
                        zh_name: act.zh_name,
                        reps: 0,
                        weight: "",
                      };
                    }),
                    rest_duration: 0,
                  };
                }),
              },
              ..._steps.slice(v.idx + 1),
            ];
          }
          ui.$ref_cur_step.clear();
          ui.$workout_action_dialog.methods.clear();
          ui.$workout_action_dialog.ui.$dialog.hide();
          bus.emit(Events.StateChange, { ..._state });
          return;
        }
        _steps = [
          ..._steps,
          {
            idx: _steps.length,
            list: [
              {
                type: "set",
                actions: acts.map((act) => {
                  return {
                    id: Number(act.id),
                    zh_name: act.zh_name,
                    reps: 0,
                    weight: "",
                  };
                }),
                rest_duration: 0,
              },
            ],
          },
        ];
        ui.$workout_action_dialog.methods.clear();
        ui.$workout_action_dialog.ui.$dialog.hide();
        bus.emit(Events.StateChange, { ..._state });
      },
      onError(error) {
        props.app.tip({
          text: [error.message],
        });
        return;
      },
    }),
    $set_value_input_dialog: new DialogCore({
      onOk() {
        const v = ui.$set_value_input.value;
        console.log("[PAGE]workout_day/create", v);
        ui.$set_value_input_dialog.hide();
      },
    }),
    $set_value_input: SetValueInputViewModel({}),
    $countdown: CountdownViewModel({}),
    $countdown_presence: new PresenceCore(),
    $workout_action_profile_dialog: new DialogCore({ footer: false }),
    $tools: new PresenceCore({}),
    $dialog_confirm_complete: new DialogCore({}),
    $dialog_workout_action_select: new DialogCore({}),
  };
  let _height = 0;
  let _steps: {
    id?: number | string;
    idx: number;
    list: {
      type: "set" | "rest";
      actions: {
        id: number;
        zh_name: string;
        reps: number;
        weight: string;
      }[];
      rest_duration: number;
    }[];
  }[] = [];
  let _cur_workout_action: WorkoutActionProfile | null = null;
  let _cur_step_idx = 0;
  let _next_set_idx = 0;
  let _duration = "分钟";
  let _estimated_duration = "分钟";
  let _stats: {
    started_at: string;
    finished_at: string;
    duration: string;
    total_volume: number;
    uncompleted_actions: { step_idx: number; set_idx: number; act_idx: number }[];
    sets: {
      actions: { id: number; zh_name: string; reps: number; reps_unit: string; weight: number; weight_unit: string }[];
    }[];
  } = {
    started_at: "",
    finished_at: "",
    total_volume: 0,
    duration: "",
    uncompleted_actions: [],
    sets: [],
  };
  let _state = {
    get steps() {
      return _steps;
    },
    get height() {
      return _height;
    },
    get actions() {
      return ui.$action_select.state.actions;
    },
    get selectedActions() {
      return ui.$action_select.state.value;
    },
    get loading() {
      return request.workout_action.profile.loading;
    },
    get cur_workout_action() {
      return _cur_workout_action;
    },
    get next_set_idx() {
      return _next_set_idx;
    },
    get cur_step_idx() {
      return _cur_step_idx;
    },
    get duration() {
      return _duration;
    },
    get estimated_duration() {
      return _estimated_duration;
    },
    get stats() {
      return _stats;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$action_select.onStateChange((v) => {
    bus.emit(Events.StateChange, { ..._state });
  });
  ui.$set_value_input.onSubmit((v) => {
    console.log("[PAGE]workout_day/create", v);
    ui.$set_value_input_dialog.hide();
  });
  ui.$set_value_input_dialog.onCancel(() => {
    methods.setHeight(0);
    const v = ui.$ref_input_key.value;
    if (v) {
      const $field = methods.getField(v);
      if ($field) {
        $field.setStatus("normal");
      }
    }
  });
  ui.$set_value_input.onChange((v) => {
    const key = ui.$ref_input_key.value;
    if (!key) {
      props.app.tip({
        text: ["请先选择输入框"],
      });
      return;
    }
    const $field = methods.getField(key);
    if (!$field) {
      props.app.tip({
        text: ["输入框不存在"],
      });
      return;
    }
    // console.log("[PAGE]workout_day/create", v);
    $field.input.setValue(v === 0 ? "" : v.toString());
  });
  ui.$set_value_input.onUnitChange((v) => {
    const key = ui.$ref_input_key.value;
    if (!key) {
      props.app.tip({
        text: ["请先选择输入框"],
      });
      return;
    }
    const $field = methods.getField(key);
    if (!$field) {
      props.app.tip({
        text: ["输入框不存在"],
      });
      return;
    }
    $field.input.setUnit(ui.$set_value_input.state.unit);
  });
  ui.$tools.onShow(() => {
    ui.$countdown.play();
  });
  ui.$tools.onHidden(() => {
    ui.$countdown.pause();
  });

  request.workout_action.profile.onStateChange((v) => {
    bus.emit(Events.StateChange, { ..._state });
  });
  return {
    state: _state,
    ui,
    request,
    methods,
    async ready() {
      console.log("[PAGE]home_workout_day");
      const id = props.view.query.id;
      if (!id) {
        return;
      }
      const r = await request.workout_day.profile.run({ id: Number(id) });
      if (r.error) {
        props.app.tip({
          text: ["获取计划内容失败"],
        });
        return;
      }
      const { status, steps, pending_steps, started_at } = r.data;
      if (status === WorkoutDayStatus.Started) {
        // console.log("started_at.valueOf()", started_at.format("YYYY-MM-DD HH:mm"));
        ui.$countdown.setStartedAt(started_at.valueOf());
      }
      _stats.started_at = started_at.format("YYYY-MM-DD HH:mm");
      _cur_step_idx = pending_steps.step_idx;
      _next_set_idx = pending_steps.set_idx;
      _steps = [];
      for (let idx = 0; idx < steps.length; idx += 1) {
        const step = steps[idx];
        // console.log(step);
        const rr = {
          id: step.id,
          idx,
          type: "action",
          list: (() => {
            const list: (typeof _steps)[number]["list"] = [];
            if (step.set_type === WorkoutPlanSetType.Normal) {
              for (let j = 0; j < step.set_count; j += 1) {
                list.push({
                  type: "set",
                  actions: [
                    {
                      id: Number(step.action.id),
                      zh_name: step.action.zh_name,
                      reps: step.reps,
                      weight: step.weight,
                    },
                  ],
                  rest_duration: 0,
                });
                if (idx === steps.length - 1 && j === step.set_count - 1) {
                  return list;
                }
                list.push({
                  type: "rest",
                  actions: [],
                  rest_duration: step.set_rest_duration,
                });
              }
              return list;
            }
            if (step.set_type === WorkoutPlanSetType.Combo) {
              const list: (typeof _steps)[number]["list"] = [];
              for (let j = 0; j < step.set_count; j += 1) {
                list.push({
                  type: "set",
                  actions: step.actions.map((act) => {
                    //     actions[act.action.id] = true;
                    return {
                      id: Number(act.action.id),
                      zh_name: act.action.zh_name,
                      reps: act.reps,
                      weight: act.weight,
                    };
                  }),
                  rest_duration: 0,
                });
                if (idx === steps.length - 1 && j === step.set_count - 1) {
                  return list;
                }
                list.push({
                  type: "rest",
                  actions: [],
                  rest_duration: step.set_rest_duration,
                });
              }
              return list;
            }
            if (step.set_type === WorkoutPlanSetType.Free) {
              const list: (typeof _steps)[number]["list"] = [];
              for (let j = 0; j < step.sets3.length; j += 1) {
                list.push({
                  type: "set",
                  actions: step.sets3[j].actions.map((act) => {
                    return {
                      id: Number(act.action.id),
                      zh_name: act.action.zh_name,
                      reps: act.reps,
                      weight: act.weight,
                    };
                  }),
                  rest_duration: 0,
                });
              }
              return list;
            }
            return list;
          })(),
        };
        _steps.push(rr);
      }
      /** 预计花费时间 */
      let estimated_duration = 0;
      _steps.forEach((step, a) => {
        step.list.forEach((set, b) => {
          const kk = `${a}-${b}`;
          ui.btns_more.set(
            kk,
            new ButtonCore({
              onClick() {
                ui.$ref_cur_set_key.select(kk);
              },
            })
          );
          let is_completed = a < pending_steps.step_idx;
          if (a === pending_steps.step_idx) {
            is_completed = b < pending_steps.set_idx;
          }
          if (set.type === "rest") {
            const $countdown = SetCountdownViewModel({
              countdown: set.rest_duration,
              finished: is_completed,
            });
            $countdown.onStop(() => {
              methods.nextSet();
            });
            ui.$countdowns.set(`${a}-${b}`, $countdown);
            if (!is_completed && set.type === "rest") {
              estimated_duration += set.rest_duration;
            }
          }
          let estimated_set_duration = 0;
          set.actions.forEach((action, c) => {
            const k = `${a}-${b}-${c}`;
            const pending_action = pending_steps.data.find(
              (act) => act.step_idx === a && act.set_idx === b && act.act_idx === c
            );
            estimated_set_duration += action.reps * 5;
            ui.$set_actions.set(k, SetActionViewModel({ id: action.id, zh_name: action.zh_name }));
            ui.$fields_reps.set(
              k,
              new SingleFieldCore({
                label: "",
                name: "",
                input: SetValueInputViewModel({
                  defaultValue: pending_action?.reps ? String(pending_action?.reps) : "",
                  placeholder: String(action.reps),
                  unit: pending_action?.reps_unit ?? "次",
                }),
              })
            );
            ui.$fields_weight.set(
              k,
              new SingleFieldCore({
                label: "",
                name: "",
                input: SetValueInputViewModel({
                  defaultValue: pending_action?.weight ? String(pending_action?.weight) : "",
                  placeholder: action.weight,
                  unit: pending_action?.weight_unit ?? "公斤",
                }),
              })
            );
            ui.$inputs_check.set(k, new InputCore({ defaultValue: pending_action?.completed || false }));
          });
          if (!is_completed && set.type === "set") {
            estimated_duration += estimated_set_duration;
          }
        });
        _estimated_duration = `${Math.floor(estimated_duration / 60)}分钟`;
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeWorkoutDayUpdatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutDayUpdateViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="">
        <div
          class="bg-white p-4 rounded-lg transition-all duration-300"
          style={{ transform: `translateY(${-state().height}px)` }}
        >
          <div class="mt-4 space-y-8">
            <For each={state().steps}>
              {(step, a) => {
                return (
                  <div>
                    <div class="space-y-2">
                      <For each={step.list}>
                        {(set, b) => {
                          return (
                            <div class="relative w-full overflow-hidden">
                              <div
                                classList={{
                                  "border-green-600 bg-green-100":
                                    state().cur_step_idx === a() && state().next_set_idx === b(),
                                }}
                                class="flex items-center gap-2 p-4 border rounded-md"
                              >
                                <Show when={set.type === "set"}>
                                  <div
                                    class="absolute right-4 top-4"
                                    onClick={(event) => {
                                      const client = event.currentTarget.getBoundingClientRect();
                                      vm.ui.$ref_cur_set_key.select(`${a()}-${b()}`);
                                      vm.ui.$set_menu.toggle({ x: client.x + 18, y: client.y + 18 });
                                    }}
                                  >
                                    <MoreHorizontal class="w-6 h-6" />
                                  </div>
                                </Show>
                                <Show when={set.type === "rest" && vm.ui.$countdowns.get(`${a()}-${b()}`)}>
                                  <SetCountdownView
                                    store={vm.ui.$countdowns.get(`${a()}-${b()}`)!}
                                    onStart={() => {
                                      vm.methods.setCurSet({ step_idx: a(), set_idx: b() });
                                    }}
                                  ></SetCountdownView>
                                </Show>
                                <div class="space-y-2">
                                  <For each={set.actions}>
                                    {(action, c) => {
                                      return (
                                        <div class="gap-2">
                                          <Show when={vm.ui.$set_actions.get(`${a()}-${b()}-${c()}`)}>
                                            <SetActionView
                                              store={vm.ui.$set_actions.get(`${a()}-${b()}-${c()}`)!}
                                              onClick={() => {
                                                vm.methods.showWorkoutActionProfile(action.id);
                                              }}
                                            />
                                          </Show>
                                          <div class="flex items-center gap-2 mt-2">
                                            <Show when={vm.ui.$fields_weight.get(`${a()}-${b()}-${c()}`)}>
                                              <SetValueInput
                                                store={vm.ui.$fields_weight.get(`${a()}-${b()}-${c()}`)!}
                                                class="w-[68px] border border-gray-300 rounded-md p-2"
                                                onClick={(event) => {
                                                  const client = event.currentTarget.getBoundingClientRect();
                                                  vm.methods.beforeShowNumInput({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                    x: client.x,
                                                    y: client.y + 98,
                                                  });
                                                  vm.methods.showNumInput({
                                                    key: `${a()}-${b()}-${c()}`,
                                                    for: "weight",
                                                  });
                                                }}
                                              />
                                            </Show>
                                            <Show when={vm.ui.$fields_reps.get(`${a()}-${b()}-${c()}`)}>
                                              <SetValueInput
                                                store={vm.ui.$fields_reps.get(`${a()}-${b()}-${c()}`)!}
                                                class="w-[68px] border border-gray-300 rounded-md p-2"
                                                onClick={(event) => {
                                                  const client = event.currentTarget.getBoundingClientRect();
                                                  vm.methods.beforeShowNumInput({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                    x: client.x,
                                                    y: client.y + 98,
                                                  });
                                                  vm.methods.showNumInput({
                                                    key: `${a()}-${b()}-${c()}`,
                                                    for: "reps",
                                                  });
                                                }}
                                              />
                                            </Show>
                                            <Show when={vm.ui.$inputs_check.get(`${a()}-${b()}-${c()}`)}>
                                              <SetCompleteBtn
                                                store={vm.ui.$inputs_check.get(`${a()}-${b()}-${c()}`)!}
                                                onClick={(event) => {
                                                  vm.methods.handleCompleteSet({
                                                    step_idx: a(),
                                                    set_idx: b(),
                                                    act_idx: c(),
                                                  });
                                                }}
                                              />
                                            </Show>
                                          </div>
                                        </div>
                                      );
                                    }}
                                  </For>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div class="h-[98px]"></div>
      </ScrollView>
      <Sheet store={vm.ui.$workout_action_dialog.ui.$dialog} position="bottom" size="sm">
        <div class="w-screen">
          <WorkoutActionSelect3View store={vm.ui.$workout_action_dialog} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$set_value_input_dialog} position="bottom" size="sm">
        <div class="w-screen border border-t-gray-200">
          <SetValueInputKeyboard store={vm.ui.$set_value_input} />
        </div>
      </Sheet>
      <div class="absolute right-4 bottom-10">
        <ToolsBar store={vm.ui.$tools}>
          <div class="flex items-center gap-2">
            <DayCountdown store={vm.ui.$countdown} />
            <div
              class="px-4"
              onClick={() => {
                vm.methods.completeWorkoutDay();
              }}
            >
              结束
            </div>
          </div>
        </ToolsBar>
      </div>
      <Sheet store={vm.ui.$workout_action_profile_dialog} position="bottom" size="sm">
        <div class="relative w-screen min-h-[320px] border border-t-gray-200 bg-white">
          <Show when={state().loading}>
            <div class="absolute inset-0 flex items-center justify-center">
              <Loader class="w-8 h-8 animate-spin" />
            </div>
          </Show>
          <Show when={state().cur_workout_action}>
            <WorkoutActionCard {...state().cur_workout_action!} />
          </Show>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_confirm_complete} position="bottom" size="sm">
        <div class="w-screen border border-t-gray-200 bg-white">
          <div class="flex flex-col h-[100vh] ">
            <div class="flex-1 overflow-y-auto">
              <div class="p-4">
                <div class="text-3xl">{state().stats.finished_at}</div>
                <div class="">
                  <div class="flex">
                    <div>开始时间</div>
                    <div>{state().stats.started_at}</div>
                  </div>
                  <div class="flex">
                    <div>总耗时</div>
                    <div>{state().stats.duration}</div>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="mt-2 rounded-md">
                    <div class="space-y-1">
                      <For each={state().stats.sets}>
                        {(set, b) => {
                          return (
                            <div class="flex">
                              <div class="w-[36px]">{b() + 1}</div>
                              <div class="space-y-1">
                                <For each={set.actions}>
                                  {(act, c) => {
                                    return (
                                      <div class="flex items-center">
                                        <div class="w-[120px]">{act.zh_name}</div>
                                        <div class="w-[68px]">
                                          {act.weight}
                                          <span class="ml-1 text-gray-800 text-sm">{act.weight_unit}</span>
                                        </div>
                                        <span class="text-gray-600">x</span>
                                        <div>
                                          {act.reps}
                                          <span class="ml-1 text-gray-800 text-sm">{act.reps_unit}</span>
                                        </div>
                                      </div>
                                    );
                                  }}
                                </For>
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <div>总容量</div>
                  <div class="relative inline-block">
                    <div class="text-3xl">{state().stats.total_volume}</div>
                    <div class="absolute -right-6 bottom-1 text-sm">KG</div>
                  </div>
                </div>
                <Show
                  when={!!state().stats.uncompleted_actions.length}
                  fallback={
                    <div class="flex items-center mt-4 border border-green-600 bg-green-100 p-4 rounded-md">
                      <div>
                        <CircleCheck class="w-6 h-6 text-green-600" />
                      </div>
                      <div class="ml-2 text-green-600">所有动作已完成</div>
                    </div>
                  }
                >
                  <div class="flex items-center mt-4 border border-red-600 bg-red-100 p-4 rounded-md">
                    <div>
                      <Info class="w-6 h-6 text-red-600" />
                    </div>
                    <div class="ml-2 text-red-600">有 {state().stats.uncompleted_actions.length} 个未完成动作</div>
                  </div>
                </Show>
                <div class="mt-4">
                  <div></div>
                </div>
              </div>
            </div>
            <div class="h-[88px] p-4">
              <div class="flex gap-2">
                <div class="flex flex-1 items-center justify-center py-2 bg-green-500 rounded-md">
                  <div class="text-white">提交</div>
                </div>
                <div
                  class="flex flex-1 items-center justify-center py-2 bg-gray-500 rounded-md"
                  onClick={() => {
                    vm.methods.giveUp();
                  }}
                >
                  <div class="text-white">放弃</div>
                </div>
                <div
                  class="flex flex-1 items-center justify-center py-2 bg-gray-300 rounded-md"
                  onClick={() => {
                    vm.ui.$dialog_confirm_complete.hide();
                  }}
                >
                  <div class="text-white">取消</div>
                </div>
              </div>
              <div class="h-[34px]"></div>
            </div>
          </div>
        </div>
      </Sheet>
      <SetDropdownMenu store={vm.ui.$set_menu}></SetDropdownMenu>
    </>
  );
}
