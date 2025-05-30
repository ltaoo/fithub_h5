/**
 * @file 训练日记录
 */
import { For, Show } from "solid-js";
import { CircleCheck, Info, Loader, MoreHorizontal, StopCircle, X } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, ScrollView, Skeleton, Textarea } from "@/components/ui";
import { WorkoutActionCard } from "@/components/workout-action-card";
import { WorkoutActionSelect3View } from "@/components/workout-action-select3";
import { SetValueInputKeyboard } from "@/components/set-value-input-keyboard";
import { Sheet } from "@/components/ui/sheet";
import { SetCompleteBtn } from "@/components/set-complete-btn";
import { ToolsBar } from "@/components/tools-bar";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import {
  ButtonCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  MenuItemCore,
  PresenceCore,
  ScrollViewCore,
} from "@/domains/ui";
import { RefCore } from "@/domains/ui/cur";
import { buildSetAct } from "@/biz/workout_plan/workout_plan";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { Result } from "@/domains/result";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { StopwatchViewModel } from "@/biz/stopwatch";
import {
  fetchWorkoutDayProfile,
  fetchWorkoutDayProfileProcess,
  completeWorkoutDay,
  giveUpHWorkoutDay,
  updateWorkoutDayStepContent,
  WorkoutDayStepProgressJSON250424,
  updateWorkoutDayPlanDetails,
  WorkoutDayStepDetailsJSON250424,
} from "@/biz/workout_day/services";
import { fetchWorkoutPlanProfile, fetchWorkoutPlanProfileProcess } from "@/biz/workout_plan/services";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import { WorkoutActionProfile } from "@/biz/workout_action/services";
import { CountdownViewModel } from "@/biz/countdown";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { getSetValueUnit, SetValueInputViewModel, SetValueUnit } from "@/biz/set_value_input";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { calc_bottom_padding_need_add, has_num_value, has_value, remove_arr_item, update_arr_item } from "@/utils";

import { SetCountdownView, SetCountdownViewModel } from "./components/set-countdown";
import { SetValueInput } from "./components/set-value-input";
import { SetDropdownMenu } from "./components/set-dropdown-menu";
import { SetActionView, SetActionViewModel } from "./components/set-action";
import { DayDurationTextView } from "./components/day-duration";
import { SetActionCountdownBtn } from "./components/set-countdown-btn";
import { SetActionCountdownView, SetActionCountdownViewModel } from "./components/set-action-countdown";
import { WorkoutDayOverviewView } from "./components/day-overview";

export type HomeWorkoutDayUpdateViewModel = ReturnType<typeof HomeWorkoutDayUpdateViewModel>;
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
      update_steps: new RequestCore(updateWorkoutDayStepContent, { client: props.client }),
      update_details: new RequestCore(updateWorkoutDayPlanDetails, { client: props.client }),
      give_up: new RequestCore(giveUpHWorkoutDay, { client: props.client }),
      complete: new RequestCore(completeWorkoutDay, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
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
    handleShowNumKeyboard(opt: {
      for: "reps" | "weight";
      step_idx: number;
      set_idx: number;
      act_idx: number;
      rect: { x: number; y: number; width: number; height: number };
    }) {
      const k = ui.$ref_input_key.value;
      if (k) {
        const $field = methods.getField(k);
        if ($field) {
          $field.setStatus("normal");
        }
      }
      methods.beforeShowNumInput({
        step_idx: opt.step_idx,
        set_idx: opt.set_idx,
        act_idx: opt.act_idx,
        rect: opt.rect,
      });
      methods.showNumInput({
        key: `${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`,
        for: opt.for,
      });
    },
    beforeShowNumInput(opt: {
      step_idx: number;
      set_idx: number;
      act_idx: number;
      rect: { x: number; y: number; width: number; height: number };
    }) {
      const v = calc_bottom_padding_need_add({
        keyboard: {
          height: 480,
          visible: ui.$dialog_num_keyboard.state.open,
          prev_padding: _height,
        },
        object: opt.rect,
        screen: props.app.screen,
      });
      // console.log("[PAGE]workout_day/update - beforeShowNumInput", v);
      if (v > 0) {
        methods.setHeight(v);
      }
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
      if (!ui.$dialog_num_keyboard.state.open) {
        ui.$dialog_num_keyboard.show();
      }
    },
    removeSet(opt: { step_idx: number; set_idx: number }) {
      const step = _steps[opt.step_idx];
      const set = step.sets[opt.set_idx];
      const set_k = `${opt.step_idx}-${opt.set_idx}`;
      ui.$set_countdowns.delete(set_k);
      for (let i = 0; i < set.actions.length; i += 1) {
        const k = `${set_k}-${i}`;
        ui.$set_actions.delete(k);
        ui.$fields_reps.delete(k);
        ui.$fields_weight.delete(k);
        ui.$action_countdowns.delete(k);
        ui.$inputs_completed.delete(k);
      }
      // 删不了，不能用 idx 下标，改成 id
      _steps = update_arr_item(_steps, opt.step_idx, {
        idx: step.idx,
        sets: remove_arr_item(step.sets, opt.set_idx),
        note: step.note,
      });
      console.log(opt);
      methods.refresh();
    },
    appendSetAct(opt: {
      step_idx: number;
      set_idx: number;
      idx: number;
      action: {
        id: number;
        zh_name: string;
        reps: number;
        reps_unit: SetValueUnit;
        weight: string;
        rest_duration: number;
      };
      pending_set?: WorkoutDayStepProgressJSON250424["sets"][number];
    }) {
      const { step_idx: a, set_idx: b, idx: c, action, pending_set } = opt;
      const set_k = `${a}-${b}`;
      const k = `${a}-${b}-${c}`;
      const prev_set_k = `${a}-${b - 1}`;
      const prev_k = `${a}-${b}-${c - 1}`;
      const next_k = `${a}-${b}-${c + 1}`;
      // const pending_action = pending_set?.actions.find((act) => act.idx === c);
      const pending_action = pending_set?.actions[c];
      // const act = _steps[a].sets[b].actions[c];
      ui.$set_actions.set(k, SetActionViewModel({ id: action.id, zh_name: action.zh_name }));
      ui.$fields_weight.set(
        k,
        new SingleFieldCore({
          label: "",
          name: "",
          input: SetValueInputViewModel({
            defaultValue: has_value(pending_action?.weight) ? String(pending_action?.weight) : "",
            placeholder: action.weight,
            unit: pending_action?.weight_unit ?? getSetValueUnit("公斤"),
          }),
        })
      );
      ui.$fields_reps.set(
        k,
        new SingleFieldCore({
          label: "",
          name: "",
          input: SetValueInputViewModel({
            defaultValue: has_value(pending_action?.reps) ? String(pending_action?.reps) : "",
            placeholder: String(action.reps),
            unit: pending_action?.reps_unit ?? action.reps_unit,
          }),
        })
      );
      const is_last_act = c === _steps[a].sets[b].actions.length - 1;
      if ([getSetValueUnit("秒"), getSetValueUnit("分")].includes(action.reps_unit)) {
        const $action_countdown = SetActionCountdownViewModel({
          workout_duration: 10,
          rest_duration: 5,
          // workout_duration: action.reps,
          // rest_duration: action.rest_duration,
          time1: pending_action?.time1,
          time2: pending_action?.time2,
          time3: pending_action?.time3,
          finished: false,
          no_rest_countdown: is_last_act,
        });
        $action_countdown.onStart(() => {
          methods.setCurSet({
            step_idx: opt.step_idx,
            set_idx: opt.set_idx,
          });
          const $prev_act_countdown = ui.$action_countdowns.get(prev_k);
          if ($prev_act_countdown) {
            $prev_act_countdown.pause();
          }
          const $prev_set_countdown = ui.$set_countdowns.get(prev_set_k);
          if ($prev_set_countdown && $prev_set_countdown.state.running) {
            $prev_set_countdown.pause();
          }
          methods.setCurSet({ step_idx: a, set_idx: b });
        });
        $action_countdown.onFinished(() => {
          /** 在动作倒计时结束后，尝试去将动作「完成」 */
          const $cur_act_check = ui.$inputs_completed.get(k);
          if ($cur_act_check) {
            methods.handleCompleteSetAction({
              step_idx: a,
              set_idx: b,
              act_idx: c,
              ignore_when_completed: true,
            });
          }
          const $next_act_countdown = ui.$action_countdowns.get(next_k);
          if ($next_act_countdown) {
            $next_act_countdown.start();
          }
          const is_last_act = !$next_act_countdown;
          if (is_last_act) {
            const $countdown = ui.$set_countdowns.get(set_k);
            if ($countdown) {
              $countdown.start();
            }
          }
        });
        ui.$action_countdowns.set(k, $action_countdown);
      }
      ui.$inputs_completed.set(
        k,
        new InputCore({ defaultValue: pending_action?.completed ? pending_action?.completed_at : 0 })
      );
    },
    /** 手动完成一个组动作 */
    completeSetAct(opt: {
      step_idx: number;
      set_idx: number;
      act_idx: number;
      /** 如果当前组动作是已完成状态，再次完成，是否需要忽略掉该操作，也就是说不要（取消完成） */
      ignore_when_completed?: boolean;
    }) {
      console.log("[PAGE]workout_day/create - handleCompleteSet", opt);
      const kk = `${opt.step_idx}-${opt.set_idx}`;
      if (!_touched_set_idx.includes(kk)) {
        _touched_set_idx.push(kk);
      }
      if (ui.$dialog_num_keyboard.state.open) {
        ui.$dialog_num_keyboard.hide();
      }
      const common_error_tip = "异常数据";
      const step = _steps[opt.step_idx];
      if (!step) {
        return Result.Err(common_error_tip);
      }
      const set = step.sets[opt.set_idx];
      if (!set) {
        return Result.Err(common_error_tip);
      }
      const is_last_step = opt.step_idx === _steps.length - 1;
      const is_last_set = opt.set_idx === step.sets.length - 1;
      const is_last_act = opt.act_idx === set.actions.length - 1;
      const k = `${opt.step_idx}-${opt.set_idx}-${opt.act_idx}`;
      const $field_reps = ui.$fields_reps.get(k);
      const $field_weight = ui.$fields_weight.get(k);
      const $input_completed = ui.$inputs_completed.get(k);
      if (!$field_reps || !$field_weight || !$input_completed) {
        console.log("[PAGE]workout_day/create - no inputs", $field_reps, $field_weight, $input_completed);
        return Result.Err(common_error_tip);
      }
      const cur_act_completed = $input_completed.value;
      const result = {
        completed: cur_act_completed,
        is_last_step,
        is_last_set,
        is_last_act,
      };
      if (cur_act_completed) {
        if (opt.ignore_when_completed) {
          return Result.Ok(result);
        }
        // 取消完成状态
        $input_completed.setValue(0);
        methods.updateSteps({
          step_idx: _cur_step_idx,
          set_idx: _next_set_idx,
        });
        result.completed = false;
        return Result.Ok(result);
      }
      const vv_weight = Number($field_weight.input.value || $field_weight.input.placeholder);
      const vv_reps = Number($field_reps.input.value || $field_reps.input.placeholder);
      console.log(
        "[PAGE]workout_day/update - completeSetAct after vv_reps =",
        $field_weight.input.value,
        $field_weight.input.placeholder,
        vv_weight
      );
      // return Result.Err("he");
      const errors: { msg: string }[] = [];
      if (isNaN(vv_weight)) {
        const tip = "不合法的重量值";
        errors.push({
          msg: tip,
        });
        $field_weight.setStatus("error");
        console.warn(tip, vv_weight, $field_weight.input.value, $field_weight.input.placeholder);
        return Result.Err(tip);
      }
      if (isNaN(vv_reps)) {
        const tip = "不合法的计数值";
        errors.push({
          msg: tip,
        });
        $field_reps.setStatus("error");
        console.warn(tip, vv_reps);
        return Result.Err(tip);
      }
      // if (Number.isNaN(vv_weight) && [WorkoutPlanSetType.HIIT].includes(set.type)) {
      //   vv_weight = 0;
      // }
      $field_weight.setStatus("normal");
      $field_reps.setStatus("normal");
      $field_weight.setValue(vv_weight);
      $field_reps.setValue(vv_reps);
      $input_completed.setValue(dayjs().unix());
      _cur_step_idx = opt.step_idx;
      _next_set_idx = opt.set_idx;
      methods.updateSteps({
        step_idx: _cur_step_idx,
        set_idx: _next_set_idx,
      });
      if (is_last_act) {
        const has_multiple_act = [
          WorkoutPlanSetType.Decreasing,
          WorkoutPlanSetType.Increasing,
          WorkoutPlanSetType.Super,
        ].includes(set.type);
        if (has_multiple_act) {
          for (let i = 0; i < set.actions.length - 1; i += 1) {
            methods.completeSetAct({
              step_idx: opt.step_idx,
              set_idx: opt.set_idx,
              act_idx: i,
              ignore_when_completed: true,
            });
          }
        }
      }
      let the_set_is_completed = true;
      for (let i = 0; i < set.actions.length; i += 1) {
        const _k = `${opt.step_idx}-${opt.set_idx}-${i}`;
        const $input_act_completed = ui.$inputs_completed.get(_k);
        if ($input_act_completed && !$input_act_completed.value) {
          the_set_is_completed = false;
        }
      }
      if (!the_set_is_completed) {
        return Result.Ok(result);
      }
      if (is_last_step && is_last_set && the_set_is_completed) {
        methods.showWorkoutDayCompleteConfirmDialog();
        return Result.Ok(result);
      }
      const $countdown = ui.$set_countdowns.get(`${opt.step_idx}-${opt.set_idx}`);
      // console.log("[]handleCompleteSet - ", _cur_step_idx, _next_set_idx, $countdown);
      if ($countdown && !$countdown.state.paused) {
        $countdown.start();
      }
      let next_set_idx = opt.set_idx + 1;
      let next_set = _steps[opt.step_idx].sets[next_set_idx];
      if (next_set) {
        for (let i = 0; i < next_set.actions.length; i++) {
          const cur_act_idx = `${opt.step_idx}-${opt.set_idx}-${i}`;
          const the_act_idx_in_next_set = `${opt.step_idx}-${next_set_idx}-${i}`;
          const $field_cur_weight = ui.$fields_weight.get(cur_act_idx);
          const $field_cur_reps = ui.$fields_reps.get(cur_act_idx);
          const $field_next_weight = ui.$fields_weight.get(the_act_idx_in_next_set);
          const $field_next_reps = ui.$fields_reps.get(the_act_idx_in_next_set);
          if ($field_cur_weight && $field_next_weight) {
            const v = Number($field_cur_weight.input.value || $field_cur_weight.input.placeholder);
            if (!isNaN(v)) {
              $field_next_weight.input.setPlaceholder(v);
            }
            $field_next_weight.input.setUnit($field_cur_weight.input.unit);
          }
          if ($field_cur_reps && $field_next_reps) {
            const v = Number($field_cur_reps.input.value || $field_cur_reps.input.placeholder);
            if (!Number.isNaN(v)) {
              $field_next_reps.input.setPlaceholder(v);
            }
            $field_next_reps.input.setUnit($field_cur_reps.input.unit);
          }
        }
      }
      return Result.Ok(result);
    },
    setCurSet(opt: { step_idx: number; set_idx: number }) {
      _cur_step_idx = opt.step_idx;
      _next_set_idx = opt.set_idx;
      methods.updateSteps({
        step_idx: _cur_step_idx,
        set_idx: _next_set_idx,
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    nextSet() {
      const cur_step = _steps[_cur_step_idx];
      console.log("[PAGE]workout_day/update - nextSet", _cur_step_idx, _next_set_idx, cur_step.sets.length);
      _next_set_idx += 1;
      if (_next_set_idx > cur_step.sets.length - 1) {
        _cur_step_idx += 1;
        _next_set_idx = 0;
        if (_cur_step_idx > _steps.length - 1) {
          return;
        }
      }
      const { data } = methods.toBody();
      request.workout_day.update_steps.run({
        id: props.view.query.id,
        content: {
          v: "250424",
          step_idx: _cur_step_idx,
          set_idx: _next_set_idx,
          act_idx: _cur_act_idx,
          touched_set_idx: _touched_set_idx,
          sets: data,
        },
      });
      console.log("[PAGE]workout_day/update - nextSet before refresh", _cur_step_idx, _cur_step_idx);
      bus.emit(Events.StateChange, { ..._state });
    },

    /**
     * 完成一个组动作
     */
    handleCompleteSetAction(opt: {
      step_idx: number;
      set_idx: number;
      act_idx: number;
      ignore_when_completed?: boolean;
    }) {
      const r = methods.completeSetAct(opt);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const set = _steps[opt.step_idx].sets[opt.set_idx];
      if (set && r.data.is_last_act && r.data.completed) {
        const has_multiple_set_act = [WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(set.type);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    handleDeleteAction(opt: { step_idx: number; set_idx: number; act_idx: number }) {
      console.log("[PAGE]workout_day/create - handleDeleteSet", opt);
    },
    resetStats() {
      _stats.uncompleted_actions = [];
      _stats.sets = [];
    },
    async resetPendingSteps() {
      await request.workout_day.update_steps.run({
        id: props.view.query.id,
        content: {
          v: "250424",
          step_idx: 0,
          set_idx: 0,
          act_idx: 0,
          touched_set_idx: [],
          sets: [],
        },
      });
      request.workout_day.update_details.run({
        id: props.view.query.id,
        content: {
          v: "250424",
          steps: [],
        },
      });
    },
    showWorkoutDayCompleteConfirmDialog() {
      const profile = request.workout_day.profile.response;
      if (!profile) {
        return;
      }
      _stats.sets = [];
      _stats.finished_at = dayjs().format("YYYY-MM-DD");
      _stats.duration = dayjs().diff(profile.started_at, "minutes") + "分钟";
      let total_volume = 0;
      const uncompleted_actions: { step_idx: number; set_idx: number; act_idx: number }[] = [];
      for (let a = 0; a < _steps.length; a += 1) {
        for (let b = 0; b < _steps[a].sets.length; b += 1) {
          const set = _steps[a].sets[b];
          const actions = [];
          for (let c = 0; c < set.actions.length; c += 1) {
            const k = `${a}-${b}-${c}`;
            const $field_reps = ui.$fields_reps.get(k);
            const $field_weight = ui.$fields_weight.get(k);
            const $input_check = ui.$inputs_completed.get(k);
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
              if (!$input_check.value) {
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
      const data: WorkoutDayStepProgressJSON250424["sets"] = [];
      for (let a = 0; a < _steps.length; a++) {
        const step = _steps[a];
        for (let b = 0; b < step.sets.length; b++) {
          if (!_touched_set_idx.includes(`${a}-${b}`)) {
            continue;
          }
          const set = step.sets[b];
          let set_completed = false;
          const actions: WorkoutDayStepProgressJSON250424["sets"][number]["actions"] = [];
          for (let c = 0; c < set.actions.length; c++) {
            const kkk = `${a}-${b}-${c}`;
            const $field_weight = ui.$fields_weight.get(kkk);
            const $field_reps = ui.$fields_reps.get(kkk);
            const $input_check = ui.$inputs_completed.get(kkk);
            const $act_countdown = ui.$action_countdowns.get(kkk);

            const completed = $input_check?.value;
            if (!completed) {
              set_completed = false;
            }
            if ($field_weight && $field_reps) {
              // console.log("weight", kkk, $field_weight.input.value, $field_weight.input.placeholder);
              // console.log("reps", kkk, $field_reps.input.value, $field_reps.input.placeholder);
              const vv_weight = (() => {
                if (has_num_value($field_weight.input.value)) {
                  return Number($field_weight.input.value);
                }
                const v1 = Number($field_weight.input.placeholder);
                if (Number.isNaN(v1)) {
                  return 0;
                }
                return v1;
              })();
              const vv_reps = (() => {
                if (has_num_value($field_reps.input.value)) {
                  return Number($field_reps.input.value);
                }
                const v1 = Number($field_reps.input.placeholder);
                if (Number.isNaN(v1)) {
                  return 0;
                }
                return v1;
              })();
              actions.push({
                idx: c,
                action_id: set.actions[c].id,
                reps: vv_reps,
                reps_unit: $field_reps.input.unit,
                weight: vv_weight,
                weight_unit: $field_weight.input.unit,
                completed: !!completed,
                completed_at: completed,
                time1: $act_countdown?.time1 ?? 0,
                time2: $act_countdown?.time2 ?? 0,
                time3: $act_countdown?.time3 ?? 0,
              });
              total.weight += vv_weight * vv_reps;
            }
          }
          const $countdown = ui.$set_countdowns.get(`${a}-${b}`);
          // console.log("[PAGE]workout_day/update - $countdown", $countdown?.state.remaining);
          data.push({
            step_idx: a,
            idx: b,
            actions,
            remaining_time: $countdown?.state.remaining ?? 0,
            exceed_time: $countdown?.state.exceed ?? 0,
            remark: "",
          });
          if (set_completed === false) {
            total.tips.push(`${a + 1}/${b + 1}组未完成`);
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
    hasSameActions(actions1: { id: number }[], actions2: { id: number }[]) {
      if (actions1.length !== actions2.length) {
        return false;
      }
      for (let i = 0; i < actions1.length; i += 1) {
        const act1 = actions1[i];
        const act2 = actions2[i];
        if (act1.id !== act2.id) {
          return false;
        }
      }
      return true;
    },
    /** 更新训练计划内容 */
    updateDetails() {
      request.workout_day.update_details.run({
        id: props.view.query.id,
        content: {
          v: "250424",
          steps: _steps,
        },
      });
    },
    /** 更新动作执行进度 */
    updateSteps(opt: { step_idx: number; set_idx: number }) {
      const { data } = methods.toBody();
      // console.log("[PAGE]workout_day/create - total", total);
      return request.workout_day.update_steps.run({
        id: props.view.query.id,
        content: {
          v: "250424",
          step_idx: opt.step_idx,
          set_idx: opt.set_idx,
          act_idx: _cur_act_idx,
          touched_set_idx: _touched_set_idx,
          sets: data,
        },
      });
    },
    async showWorkoutActionProfile(action: { id: number | string }) {
      ui.$workout_action_profile_dialog.show();
      if (request.workout_action.profile.response && request.workout_action.profile.response.id === action.id) {
        return;
      }
      const r = await request.workout_action.profile.run({ id: action.id });
      if (r.error) {
        props.app.tip({
          text: ["获取动作详情失败", r.error.message],
        });
        return;
      }
      _cur_workout_action = r.data;
      bus.emit(Events.StateChange, { ..._state });
    },
    async submit() {
      // const { data } = methods.toBody();
      const r = await request.workout_day.complete.run({
        id: props.view.query.id,
      });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      ui.$dialog_confirm_complete.hide();
      props.history.push("root.home_layout.index");
    },
    async giveUp() {
      props.app.tip({
        icon: "loading",
        text: [],
      });
      const r = await request.workout_day.give_up.run({ id: Number(props.view.query.id) });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      ui.$dialog_confirm_complete.hide();
      props.history.push("root.home_layout.index");
    },
    setHeight(height: number) {
      _height = height;
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const $set_actions = new Map<string, SetActionViewModel>();
  const $fields_weight = new Map<string, SingleFieldCore<any>>();
  const $fields_reps = new Map<string, SingleFieldCore<any>>();
  const $inputs_completed = new Map<string, InputCore<any>>();
  const $set_act_countdowns = new Map<string, SetActionCountdownViewModel>();
  const $set_countdowns = new Map<string, SetCountdownViewModel>();
  const btns_more = new Map<string, ButtonCore>();
  const ui = {
    $set_actions,
    $fields_weight,
    $fields_reps,
    $inputs_completed,
    $action_countdowns: $set_act_countdowns,
    $set_countdowns,
    btns_more,
    $menu_set: new DropdownMenuCore({
      // side: "left",
      align: "start",
      items: [
        new MenuItemCore({
          label: "备注",
          onClick() {
            ui.$dialog_remark.show();
            ui.$menu_set.hide();
          },
        }),
        new MenuItemCore({
          label: "修改动作",
          onClick() {
            ui.$menu_set.hide();
            ui.$ref_action_dialog_for.select("change_action");
            const cur_set_key = ui.$ref_cur_set_key.value;
            if (!cur_set_key) {
              return;
            }
            const set = _steps[cur_set_key.step_idx]?.sets[cur_set_key.idx];
            if (set) {
              const ids = set.actions.map((act) => {
                return {
                  id: act.id,
                  zh_name: act.zh_name,
                };
              });
              if (
                [WorkoutPlanSetType.Normal, WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(
                  set.type
                )
              ) {
                ui.$workout_action_dialog.methods.setMode("single");
                ui.$workout_action_dialog.methods.setDisabled(ids.map((v) => v.id));
              }
              if ([WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(set.type)) {
                ui.$workout_action_dialog.methods.setMode("multiple");
                ui.$workout_action_dialog.methods.setDisabled([]);
                ui.$workout_action_dialog.setValue(ids);
              }
            }
            ui.$workout_action_dialog.ui.$dialog.show();
          },
        }),
        new MenuItemCore({
          label: "删除",
          onClick() {
            const cur_set_key = ui.$ref_cur_set_key.value;
            if (!cur_set_key) {
              return;
            }
            const { step_idx, idx } = cur_set_key;
            methods.removeSet({ step_idx, set_idx: idx });
            ui.$menu_set.hide();
          },
        }),
      ],
    }),
    $ref_cur_set_key: new RefCore<{ step_idx: number; idx: number }>(),
    $ref_cur_step: new RefCore<{ idx: number }>(),
    $ref_input_key: new RefCore<{ key: string; for: "reps" | "weight" }>(),
    $ref_action_dialog_for: new RefCore<"add_action" | "change_action">(),
    $view: new ScrollViewCore(),
    $workout_plan_dialog_btn: new ButtonCore(),
    $action_select_dialog: new DialogCore({}),
    $action_select_view: new ScrollViewCore(),

    $start_btn: new ButtonCore(),
    /** 动作选择弹窗 */
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
          const [a] = [set_idx.step_idx];
          const step = _steps[a];
          const next_sets: (typeof step)["sets"] = [];
          for (let b = 0; b < step.sets.length; b += 1) {
            const next_set = {
              idx: step.sets[b].idx,
              type: step.sets[b].type,
              actions: [...step.sets[b].actions],
              weight: step.sets[b].weight,
              rest_duration: step.sets[b].rest_duration,
            };
            // console.log("[]$find matched set - after set_idx", a, b, acts.length, set.actions.length);
            // const { nodes_added, nodes_removed } = diff(set.actions, acts);
            let i = 0;
            const next_actions = [...next_set.actions];
            const next_actions_count = next_actions.length;
            for (; i < acts.length; i += 1) {
              // const act = set.actions[i];
              const k = `${a}-${b}-${i}`;
              const $act = ui.$set_actions.get(k);
              const act = { id: acts[i].id, zh_name: acts[i].zh_name };
              (() => {
                if ($act) {
                  console.log("[]update act", i, act.zh_name);
                  next_actions[i].id = Number(act.id);
                  next_actions[i].zh_name = act.zh_name;
                  $act.change(act);
                  return;
                }
                const prev_act = next_actions[i - 1];
                console.log("[]append act", i, act.zh_name);
                const act_payload = buildSetAct(act, {
                  hiit: prev_act?.reps_unit === getSetValueUnit("秒"),
                });
                methods.appendSetAct({
                  step_idx: a,
                  set_idx: b,
                  idx: i,
                  action: act_payload,
                  pending_set: undefined,
                });
                next_actions.push(act_payload);
              })();
            }
            for (; i < next_actions_count; i += 1) {
              ui.$set_actions.delete(`${a}-${b}-${i}`);
              console.log("[]delete act", i, next_actions[i].zh_name);
              next_actions.splice(i, 1);
            }
            next_sets.push({
              idx: next_set.idx,
              type: next_set.type,
              actions: next_actions,
              weight: next_set.weight,
              rest_duration: next_set.rest_duration,
            });
          }
          _steps = update_arr_item(_steps, a, {
            idx: step.idx,
            sets: next_sets,
            note: step.note,
          });
          ui.$workout_action_dialog.ui.$dialog.hide();
          methods.refresh();
          methods.updateDetails();
          return;
        }
        const v = ui.$ref_cur_step.value;
        console.log("[PAGE]workout_day/create", acts, v);
        if (v) {
          const step = _steps[v.idx];
          if (acts.length === 1) {
            _steps = update_arr_item(_steps, v.idx, {
              idx: step.idx,
              sets: step.sets.map((set, idx) => {
                return {
                  idx,
                  type: set.type,
                  actions: acts.map((act) => {
                    return buildSetAct(act);
                  }),
                  rest_duration: 90,
                  weight: "RPE 6",
                };
              }),
              note: "",
            });
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
            sets: [
              {
                idx: 0,
                type: WorkoutPlanSetType.Normal,
                actions: acts.map((act) => {
                  return buildSetAct(act);
                }),
                rest_duration: 90,
                weight: "RPE 6",
              },
            ],
            note: "",
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
    $dialog_num_keyboard: new DialogCore({
      mask: false,
      onOk() {
        const v = ui.$set_value_input.value;
        console.log("[PAGE]workout_day/create", v);
        ui.$dialog_num_keyboard.hide();
      },
    }),
    $set_value_input: SetValueInputViewModel({}),
    /** 当次训练已经过了多久 */
    $day_duration: StopwatchViewModel({}),
    $countdown_presence: new PresenceCore(),
    $workout_action_profile_dialog: new DialogCore({ footer: false }),
    $tools: new PresenceCore({}),
    $dialog_confirm_complete: new DialogCore({}),
    $dialog_workout_action_select: new DialogCore({}),
    $dialog_remark: new DialogCore({}),
    $input_remark: new InputCore({ defaultValue: "", placeholder: "请输入备注" }),
    $btn_remark_submit: new ButtonCore({
      onClick() {
        const v = ui.$input_remark.value;
        if (!v) {
          props.app.tip({
            text: ["请输入备注内容"],
          });
          return;
        }
        ui.$input_remark.clear();
        ui.$dialog_remark.hide();
      },
    }),
    $btn_give_up_confirm_cancel: new ButtonCore({
      onClick() {
        ui.$dialog_give_up_confirm.hide();
      },
    }),
    $btn_give_up_confirm_ok: new ButtonCore({
      async onClick() {
        ui.$btn_give_up_confirm_ok.setLoading(true);
        const r = await request.workout_day.give_up.run({ id: Number(props.view.query.id) });
        ui.$btn_give_up_confirm_ok.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        ui.$dialog_give_up_confirm.hide();
        props.history.push("root.home_layout.index");
      },
    }),
    $dialog_using_guide: new DialogCore({}),
    $menu_workout_day: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "增加动作",
        }),
        new MenuItemCore({
          label: "使用说明",
          onClick() {
            ui.$dialog_using_guide.show();
            ui.$menu_workout_day.hide();
          },
        }),
        new MenuItemCore({
          label: "放弃",
          onClick() {
            ui.$menu_workout_day.hide();
            ui.$dialog_give_up_confirm.show();
          },
        }),
      ],
    }),
    $dialog_give_up_confirm: new DialogCore({}),
  };
  let _height = 0;
  let _steps: WorkoutDayStepDetailsJSON250424["steps"] = [];
  let _cur_workout_action: WorkoutActionProfile | null = null;
  let _cur_step_idx = 0;
  let _next_set_idx = 0;
  let _cur_act_idx = 0;
  let _touched_set_idx: string[] = [];
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
    get profile() {
      return request.workout_day.profile.response;
    },
    get steps() {
      return _steps;
    },
    get height() {
      return _height;
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

  ui.$set_value_input.onSubmit((v) => {
    console.log("[PAGE]workout_day/create", v);
    ui.$dialog_num_keyboard.hide();
  });
  ui.$dialog_num_keyboard.onCancel(() => {
    methods.setHeight(0);
    const v = ui.$ref_input_key.value;
    if (v) {
      const $field = methods.getField(v);
      console.log("[PAGE]workout_day - input_keyboard_dialog.onCancel", v, $field);
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
      ui.$workout_action_dialog.request.action.list.init();
      const r = await request.workout_day.profile.run({ id: Number(id) });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const { status, steps, pending_steps, started_at } = r.data;
      console.log("[PAGE]workout_day/update - ready", steps);
      if (status === WorkoutDayStatus.Started) {
        console.log("started_at.valueOf()", started_at.format("YYYY-MM-DD HH:mm"));
        ui.$day_duration.setStartedAt(started_at.valueOf());
        ui.$day_duration.play();
      }
      _stats.started_at = started_at.format("YYYY-MM-DD HH:mm");
      _cur_step_idx = pending_steps.step_idx;
      _next_set_idx = pending_steps.set_idx;
      _cur_act_idx = pending_steps.act_idx;
      _touched_set_idx = pending_steps.touched_set_idx;
      _steps = steps;
      /** 预计花费时间 */
      let estimated_duration = 0;
      for (let a = 0; a < steps.length; a += 1) {
        const step = steps[a];
        for (let b = 0; b < step.sets.length; b += 1) {
          const set = step.sets[b];
          const pending_set = pending_steps.sets.find((set) => {
            return set.step_idx === a && set.idx === b;
          });
          const kk = `${a}-${b}`;
          ui.btns_more.set(
            kk,
            new ButtonCore({
              onClick() {
                ui.$ref_cur_set_key.select({
                  step_idx: a,
                  idx: b,
                });
              },
            })
          );
          let is_completed = a < pending_steps.step_idx;
          if (a === pending_steps.step_idx) {
            is_completed = b < pending_steps.set_idx;
          }
          if (set.rest_duration) {
            const $countdown = SetCountdownViewModel({
              // countdown: 10,
              countdown: set.rest_duration,
              remaining: pending_set?.remaining_time ?? 0,
              exceed: pending_set?.exceed_time ?? 0,
              finished: is_completed,
            });
            $countdown.onStart(() => {
              if ([WorkoutPlanSetType.HIIT].includes(set.type)) {
                const k = `${a}-${b}-${set.actions.length - 1}`;
                console.log("[]the k is", k);
                const $last_action_countdown = ui.$action_countdowns.get(k);
                if ($last_action_countdown && $last_action_countdown.state.running) {
                  $last_action_countdown.pause();
                }
              }
              methods.setCurSet({ step_idx: a, set_idx: b });
            });
            $countdown.onStop(() => {
              methods.nextSet();
            });
            ui.$set_countdowns.set(`${a}-${b}`, $countdown);
            if (!is_completed) {
              estimated_duration += set.rest_duration;
            }
          }
          let estimated_set_duration = 0;
          for (let c = 0; c < set.actions.length; c += 1) {
            const action = set.actions[c];
            methods.appendSetAct({
              step_idx: a,
              set_idx: b,
              idx: c,
              action,
              pending_set,
            });
            estimated_set_duration += action.reps * 5;
          }
          if (!is_completed) {
            estimated_duration += estimated_set_duration;
          }
        }
        _estimated_duration = `${Math.floor(estimated_duration / 60)}分钟`;
      }
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
      <div class="z-0 fixed top-0 left-0 w-full border-b-2 border-w-bg-5">
        <div class="p-2">
          <Show
            when={state().profile?.status === WorkoutDayStatus.Started}
            fallback={
              <div class="flex items-center justify-between">
                <Skeleton class="w-[88px] h-[40px]" />
                <div class="flex items-center gap-2">
                  <Skeleton class="w-[60px] h-[36px]" />
                  <Skeleton class="w-[40px] h-[40px] rounded-full" />
                </div>
              </div>
            }
          >
            <div class="flex items-center justify-between">
              <DayDurationTextView store={vm.ui.$day_duration} />
              <div class="flex items-center gap-2">
                <div
                  class="py-2 px-4 rounded-md bg-w-bg-5 text-center text-w-fg-1 text-sm"
                  onClick={() => {
                    // vm.methods.showWorkoutDayCompleteConfirmDialog();
                    vm.methods.resetPendingSteps();
                  }}
                >
                  完成
                </div>
                <div
                  class="p-2 rounded-full bg-w-bg-5"
                  onClick={(event) => {
                    const client = event.currentTarget.getBoundingClientRect();
                    vm.ui.$menu_workout_day.toggle({ x: client.x + 18, y: client.y + 18 });
                  }}
                >
                  <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
      <div class="absolute top-[56px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view} class="">
          <div
            class="p-2 rounded-lg transition-all duration-300"
            style={{ transform: `translateY(${-state().height}px)` }}
          >
            <div class="space-y-8">
              <For each={state().steps}>
                {(step, a) => {
                  return (
                    <div class="">
                      <Show when={step.note}>
                        <div class="flex gap-2">
                          <div class="w-[40px] h-[40px] rounded-full bg-w-bg-5"></div>
                          <div class="relative">
                            <div class="relative inline-block p-2 rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] bg-w-bg-5">
                              {step.note}
                            </div>
                          </div>
                        </div>
                      </Show>
                      <div class="space-y-2 w-full">
                        <For each={step.sets}>
                          {(set, b) => {
                            const is_cur_set = state().cur_step_idx === a() && state().next_set_idx === b();
                            const is_last_set = a() === state().steps.length - 1 && b() === step.sets.length - 1;
                            return (
                              <>
                                <div class="overflow-hidden relative w-full">
                                  <Show when={!is_cur_set}>
                                    <div class="pointer-events-none z-10 absolute inset-0 opacity-40 bg-w-bg-3"></div>
                                  </Show>
                                  <div
                                    classList={{
                                      "flex items-center gap-2 p-4 border-2 border-w-bg-5 rounded-lg": true,
                                      "border-w-fg-2": is_cur_set,
                                    }}
                                  >
                                    <div
                                      class="z-10 absolute right-4 top-4"
                                      onClick={(event) => {
                                        const client = event.currentTarget.getBoundingClientRect();
                                        vm.ui.$ref_cur_set_key.select({ step_idx: a(), idx: b() });
                                        vm.ui.$menu_set.toggle({ x: client.x + 18, y: client.y + 18 });
                                      }}
                                    >
                                      <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
                                    </div>
                                    <div class="space-y-2 w-full">
                                      <Show
                                        when={
                                          [WorkoutPlanSetType.Decreasing].includes(set.type) &&
                                          vm.ui.$set_actions.get(`${a()}-${b()}-0`)
                                        }
                                      >
                                        <SetActionView
                                          store={vm.ui.$set_actions.get(`${a()}-${b()}-0`)!}
                                          onClick={() => {
                                            vm.methods.showWorkoutActionProfile(set.actions[0]);
                                          }}
                                        />
                                      </Show>
                                      <div class="space-y-2 w-full">
                                        <For each={set.actions}>
                                          {(action, c) => {
                                            const act_k = `${a()}-${b()}-${c()}`;
                                            const is_countdown_reps = [
                                              getSetValueUnit("秒"),
                                              getSetValueUnit("分"),
                                            ].includes(action.reps_unit);
                                            return (
                                              <div class="gap-2">
                                                <Show
                                                  when={
                                                    ![WorkoutPlanSetType.Decreasing].includes(set.type) &&
                                                    vm.ui.$set_actions.get(act_k)
                                                  }
                                                >
                                                  <SetActionView
                                                    store={vm.ui.$set_actions.get(act_k)!}
                                                    onClick={() => {
                                                      vm.methods.showWorkoutActionProfile(action);
                                                    }}
                                                  />
                                                </Show>
                                                <div class="flex items-center gap-2 mt-2">
                                                  <Show when={vm.ui.$fields_weight.get(act_k)}>
                                                    <SetValueInput
                                                      store={vm.ui.$fields_weight.get(act_k)!}
                                                      class="w-[68px] border-2 border-w-bg-5 rounded-lg p-2"
                                                      onClick={(event) => {
                                                        const client = event.currentTarget.getBoundingClientRect();
                                                        console.log("[]beforeShowNumInput1", a(), b(), c(), client.y);
                                                        vm.methods.handleShowNumKeyboard({
                                                          for: "weight",
                                                          step_idx: a(),
                                                          set_idx: b(),
                                                          act_idx: c(),
                                                          rect: {
                                                            x: client.x,
                                                            y: client.y,
                                                            width: client.width,
                                                            height: client.height,
                                                          },
                                                        });
                                                      }}
                                                    />
                                                  </Show>
                                                  <Show when={vm.ui.$fields_reps.get(act_k)}>
                                                    <SetValueInput
                                                      store={vm.ui.$fields_reps.get(act_k)!}
                                                      class="w-[68px] border border-w-bg-5 rounded-md p-2"
                                                      onClick={(event) => {
                                                        const client = event.currentTarget.getBoundingClientRect();
                                                        console.log("[]beforeShowNumInput2", a(), b(), c());
                                                        vm.methods.handleShowNumKeyboard({
                                                          for: "reps",
                                                          step_idx: a(),
                                                          set_idx: b(),
                                                          act_idx: c(),
                                                          rect: {
                                                            x: client.x,
                                                            y: client.y,
                                                            width: client.width,
                                                            height: client.height,
                                                          },
                                                        });
                                                      }}
                                                    />
                                                  </Show>
                                                  <Show when={vm.ui.$inputs_completed.get(act_k)}>
                                                    <SetCompleteBtn
                                                      store={vm.ui.$inputs_completed.get(act_k)!}
                                                      onClick={(event) => {
                                                        vm.methods.handleCompleteSetAction({
                                                          step_idx: a(),
                                                          set_idx: b(),
                                                          act_idx: c(),
                                                        });
                                                      }}
                                                    />
                                                  </Show>
                                                </div>
                                                <Show when={is_countdown_reps && vm.ui.$action_countdowns.get(act_k)}>
                                                  <div class="rounded-md p-2 mt-1 bg-w-bg-5">
                                                    <SetActionCountdownView
                                                      store={vm.ui.$action_countdowns.get(act_k)!}
                                                    />
                                                  </div>
                                                </Show>
                                              </div>
                                            );
                                          }}
                                        </For>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Show when={!is_last_set}>
                                  <div class="relative w-full overflow-hidden">
                                    <Show when={!is_cur_set}>
                                      <div class="pointer-events-none z-10 absolute inset-0 opacity-40 bg-w-bg-3"></div>
                                    </Show>
                                    <div
                                      classList={{
                                        "flex items-center gap-2 p-4 border-2 border-w-bg-5 rounded-lg": true,
                                        "border-w-fg-2": is_cur_set,
                                      }}
                                    >
                                      <Show when={vm.ui.$set_countdowns.get(`${a()}-${b()}`)}>
                                        <SetCountdownView store={vm.ui.$set_countdowns.get(`${a()}-${b()}`)!} />
                                      </Show>
                                    </div>
                                  </div>
                                </Show>
                              </>
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
          <div class="py-4">
            <div class="text-sm text-w-fg-5 text-center">胜利就在眼前 加油!</div>
          </div>
          <div class="h-[32px]"></div>
        </ScrollView>
      </div>
      <Sheet store={vm.ui.$workout_action_dialog.ui.$dialog} position="bottom" size="sm">
        <div class="w-screen">
          <WorkoutActionSelect3View store={vm.ui.$workout_action_dialog} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_num_keyboard} position="bottom" size="sm">
        <div class="w-screen p-2 bg-w-bg-2">
          <SetValueInputKeyboard store={vm.ui.$set_value_input} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$workout_action_profile_dialog} position="bottom" size="sm">
        <div class="relative w-screen min-h-[320px] border border-t-gray-200 bg-white">
          <Show when={state().loading}>
            <div class="absolute inset-0">
              <div class="absolute inset-0 bg-white opacity-40"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center justify-center p-4 rounded-md bg-gray-200">
                  <Loader class="w-8 h-8 animate-spin" />
                </div>
              </div>
            </div>
          </Show>
          <Show when={state().cur_workout_action}>
            <WorkoutActionCard {...state().cur_workout_action!} />
          </Show>
          <div
            class="absolute right-4 top-4 p-2 rounded-full bg-gray-200"
            onClick={() => {
              vm.ui.$workout_action_profile_dialog.hide();
            }}
          >
            <X class="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_confirm_complete} position="bottom" size="sm">
        <div class="w-screen bg-w-bg-0">
          <WorkoutDayOverviewView store={vm} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_remark}>
        <div class="relative w-screen p-4 border-t bg-white">
          <div class="flex items-center justify-between h-12">
            <div class="text-lg">备注</div>
            <div
              class="p-2 rounded-full bg-gray-200"
              onClick={() => {
                vm.ui.$dialog_remark.hide();
              }}
            >
              <X class="w-6 h-6 text-gray-800" />
            </div>
          </div>
          <div class="mt-4">
            <Textarea store={vm.ui.$input_remark} />
            <Button class="w-full mt-2" store={vm.ui.$btn_remark_submit}>
              提交
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_give_up_confirm}>
        <div class="w-screen p-2 bg-w-bg-2">
          <div>
            <div class="text-xl text-center">确认放弃本次训练？</div>
            <div class="mt-4 flex items-center gap-2">
              <Button class="w-full" store={vm.ui.$btn_give_up_confirm_cancel}>
                取消
              </Button>
              <Button class="w-full" store={vm.ui.$btn_give_up_confirm_ok}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_using_guide}>
        <div class="w-screen p-2 bg-w-bg-2">
          <div class="text-w-fg-0">
            <div class="text-xl text-center">使用说明</div>
            <div class="mt-4 space-y-2">
              <div class="p-4 border-2 border-w-bg-5 rounded-lg">
                <div class="">重量</div>
                <div class="text-sm mt-2 space-y-1">
                  <div>
                    <span>12RM 表示使用「一次最多做 12次」的重量</span>
                  </div>
                </div>
              </div>
              <div class="p-4 border-2 border-w-bg-5 rounded-lg">
                <div class="">完成一组动作</div>
                <div class="text-sm mt-2 space-y-1">
                  <div>
                    <span class="inline-block w-[18px]">1、</span>
                    <span>在使用合适的重量完成一组动作后，可以先开始「休息倒计时」</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">2、</span>
                    <span>在休息时，将实际使用的重量填入重量输入框中</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">3、</span>
                    <span>计数输入框如果数值正确，可以直接点击后面的「对勾按钮」</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">4、</span>
                    <span>并且同时会将该组的重量和计数数值同步到下一组动作</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">5、</span>
                    <span>如果下一组重量和计数不变，无需再次填写，直接点击「对勾」按钮，将直接开始「休息倒计时」</span>
                  </div>
                </div>
              </div>
              <div class="p-4 border-2 border-w-bg-5 rounded-lg">
                <div class="">包含多个动作的组</div>
                <div class="text-sm mt-2 space-y-1">
                  <div>
                    <span class="inline-block w-[18px]">1、</span>
                    <span>类似超级组、递减组在一组动作中包含多个动作</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">2、</span>
                    <span>可以在填写好重量与计数后，点击最后一个动作的「对勾按钮」即可，无需重复点击</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu_set}></DropdownMenu>
      <DropdownMenu store={vm.ui.$menu_workout_day}></DropdownMenu>
    </>
  );
}
