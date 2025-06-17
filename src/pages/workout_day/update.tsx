/**
 * @file 训练日记录
 */
import { For, Show } from "solid-js";
import { Bird, CircleCheck, Info, Loader, MoreHorizontal, Play, StopCircle, X } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Popover, ScrollView, Skeleton, Textarea } from "@/components/ui";
import { WorkoutActionCard } from "@/components/workout-action-card";
import { WorkoutActionSelectView } from "@/components/workout-action-select3";
import { SetValueInputKeyboard } from "@/components/set-value-input-keyboard";
import { Sheet } from "@/components/ui/sheet";
import { SetCompleteBtn } from "@/components/set-complete-btn";
import { SetValueView } from "@/components/set-value-view";
import { WorkoutActionProfileView } from "@/components/workout-action-profile";
import { StopwatchView } from "@/components/stopwatch";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { WorkoutPlanVideoPlayView } from "@/pages/workout_plan/components/video-play";

import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import {
  ButtonCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  MenuItemCore,
  PopoverCore,
  PresenceCore,
  ScrollViewCore,
} from "@/domains/ui";
import { RefCore } from "@/domains/ui/cur";
import { buildSetAct } from "@/biz/workout_plan/workout_plan";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { Result } from "@/domains/result";
import { ListCore } from "@/domains/list";
import { WorkoutDayStatus } from "@/biz/workout_day/constants";
import { StopwatchViewModel } from "@/biz/stopwatch";
import {
  fetchWorkoutDayProfile,
  fetchWorkoutDayProfileProcess,
  completeWorkoutDay,
  giveUpHWorkoutDay,
  updateWorkoutDayStepContent,
  updateWorkoutDayPlanDetails,
  WorkoutDayStepDetailsJSON250616,
  WorkoutDayStepProgressJSON250616,
} from "@/biz/workout_day/services";
import { WorkoutPlanSetType } from "@/biz/workout_plan/constants";
import {
  fetchWorkoutActionHistoryListOfWorkoutAction,
  fetchWorkoutActionHistoryListOfWorkoutActionProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import { CountdownViewModel } from "@/biz/countdown";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import { getSetValueUnit, SetValueInputViewModel, SetValueUnit } from "@/biz/set_value_input";
import {
  fetchWorkoutActionListByIds,
  fetchWorkoutActionListByIdsProcess,
  fetchWorkoutActionProfile,
  fetchWorkoutActionProfileProcess,
} from "@/biz/workout_action/services";
import { SetCountdownViewModel } from "@/biz/set_countdown";
import { RouteViewCore } from "@/domains/route_view";
import { Muscles } from "@/biz/muscle/data";
import { WorkoutActionProfileViewModel } from "@/biz/workout_action/workout_action";
import { VideoWithPointsModel } from "@/biz/content/video_play";
import {
  fetchContentListOfWorkoutPlan,
  fetchContentListOfWorkoutPlanProcess,
  fetchContentProfileOfWorkoutPlan,
  fetchContentProfileOfWorkoutPlanProcess,
} from "@/biz/workout_plan/services";
import {
  calc_bottom_padding_need_add,
  has_num_value,
  has_value,
  remove_arr_item,
  toFixed,
  update_arr_item,
} from "@/utils";
import { toNumber } from "@/utils/primitive";

import { SetCountdownView } from "./components/set-countdown";
import { SetValueInput } from "./components/set-value-input";
import { SetDropdownMenu } from "./components/set-dropdown-menu";
import { SetActionView, SetActionViewModel } from "./components/set-action";
import { DayDurationTextView } from "./components/day-duration";
import { SetActionCountdownBtn } from "./components/set-countdown-btn";
import { SetActionCountdownView, SetActionCountdownViewModel } from "./components/set-action-countdown";
import { WorkoutDayOverviewView } from "./components/day-overview";
import { WorkoutDayProfileView } from "./profile";

export type WorkoutDayUpdateViewModel = ReturnType<typeof WorkoutDayUpdateViewModel>;
export function WorkoutDayUpdateViewModel(props: ViewComponentProps) {
  /** 页面处于多学员环境中 */
  const is_multiple_view = props.view.query.multiple === "1";
  const request = {
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
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryListOfWorkoutAction, {
          process: fetchWorkoutActionHistoryListOfWorkoutActionProcess,
          client: props.client,
        })
      ),
    },
    content_of_workout_plan: {
      list: new ListCore(
        new RequestCore(fetchContentListOfWorkoutPlan, {
          process: fetchContentListOfWorkoutPlanProcess,
          client: props.client,
        })
      ),
      profile: new RequestCore(fetchContentProfileOfWorkoutPlan, {
        process: fetchContentProfileOfWorkoutPlanProcess,
        client: props.client,
      }),
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
      const step = _steps[opt.step_idx];
      const set = step.sets[opt.set_idx];
      const act = set.actions[opt.act_idx];
      methods.showNumInput({
        key: `${step.uid}-${set.uid}-${act.uid}`,
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
        ui.$set_value_input.hideSubKey();
      }
      if (opt.for === "weight") {
        ui.$set_value_input.setWeightOptions();
        ui.$set_value_input.showSubKey();
      }
      if (!ui.$dialog_num_keyboard.state.open) {
        ui.$dialog_num_keyboard.show();
      }
    },
    removeSet(opt: { step_idx: number; set_idx: number }) {
      const step = _steps[opt.step_idx];
      const set = step.sets[opt.set_idx];
      const r = (() => {
        console.log("[PAGE]workout_day/update - removeSet", opt.step_idx, opt.set_idx);
        console.log("[]", _cur_step_idx, _cur_set_idx);
        const is_remove_cur_set = opt.step_idx === _cur_step_idx && opt.set_idx === _cur_set_idx;
        const is_remove_last_set = step.sets.length === 1;
        const step_is_last_step = _steps.length === 1;
        console.log("[]step_is_last_step", step_is_last_step);
        console.log("[]is_remove_last_set", is_remove_last_set);
        console.log("[]is_remove_cur_set", is_remove_cur_set);
        if (step_is_last_step && is_remove_last_set) {
          return Result.Err("无法删除最后一组动作");
        }
        _steps = update_arr_item(_steps, opt.step_idx, {
          uid: step.uid,
          sets: remove_arr_item(step.sets, opt.set_idx),
          note: step.note,
        });
        if (is_remove_last_set) {
          _steps = remove_arr_item(_steps, opt.step_idx);
        }
        if (!is_remove_cur_set) {
          // 不是移除当前高亮的，但是高亮通过 idx 标记，idx = 2，删除了 0，视觉上高亮变成了下一个
          if (opt.set_idx < _cur_set_idx) {
            _cur_set_idx -= 1;
          }
          return Result.Ok(null);
        }
        let next_set_idx = _cur_set_idx - 1;
        if (next_set_idx < 0) {
          next_set_idx = 0;
        }
        _cur_set_idx = next_set_idx;
        if (is_remove_last_set) {
          _cur_set_idx = 0;
          let next_step_idx = _cur_step_idx - 1;
          if (next_step_idx < 0) {
            next_step_idx = 0;
          }
          _cur_step_idx = next_step_idx;
        }
        return Result.Ok(null);
      })();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      console.log("[]complete remove", _cur_step_idx, _cur_set_idx);
      const step_set_uid = `${step.uid}-${set.uid}`;
      if (_touched_set_uid.includes(step_set_uid)) {
        _touched_set_uid = _touched_set_uid.filter((v) => v !== step_set_uid);
      }
      ui.$set_countdowns.delete(step_set_uid);
      for (let i = 0; i < set.actions.length; i += 1) {
        const act = set.actions[i];
        const step_set_act_uid = `${step_set_uid}-${act.uid}`;
        ui.$set_actions.delete(step_set_act_uid);
        ui.$fields_reps.delete(step_set_act_uid);
        ui.$fields_weight.delete(step_set_act_uid);
        ui.$set_act_countdowns.delete(step_set_act_uid);
        ui.$inputs_completed.delete(step_set_act_uid);
      }
      methods.refresh();
    },
    addSet(opt: { step_idx: number }) {
      const step = _steps[opt.step_idx];
      methods.refresh();
    },
    pauseAllRunningSetCountdowns() {
      ui.$running_set_countdowns.forEach(($countdown) => {
        $countdown.pause();
      });
    },
    /** 给 set 增加 ViewModel */
    appendSet(
      set: {
        step_uid: number;
        uid: number;
        type: WorkoutPlanSetType;
        rest_duration: number;
        actions: {
          uid: number;
          id: number;
          zh_name: string;
          reps: number;
          reps_unit: SetValueUnit;
          weight: string;
          rest_duration: number;
        }[];
        completed: boolean;
      },
      // 该组当前数据记录
      pending_set: WorkoutDayStepProgressJSON250616["sets"][number] | null,
      opt: Partial<{ silence: boolean }> = {}
    ) {
      // const a = set.step_uid;
      // const b = set.uid;
      const step_set_uid = `${set.step_uid}-${set.uid}`;
      const step_idx = _steps.findIndex((v) => v.uid === set.step_uid);
      if (step_idx === -1) {
        return;
      }
      const set_idx = _steps[step_idx].sets.findIndex((v) => v.uid === set.uid);
      if (set_idx === -1) {
        return;
      }
      if (set.rest_duration) {
        // 组间歇倒计时
        const $countdown = SetCountdownViewModel({
          // countdown: 10,
          countdown: set.rest_duration,
          remaining: pending_set?.remaining_time ?? 0,
          exceed: pending_set?.exceed_time ?? 0,
          finished: set.completed,
        });
        $countdown.onStart(() => {
          methods.pauseAllRunningSetCountdowns();
          console.log("[PAGE]workout_day/update - after $countdown.onStart", set);
          ui.$running_set_countdowns.set(step_set_uid, $countdown);
          // if ([WorkoutPlanSetType.HIIT].includes(set.type)) {
          //   const k = `${a}-${b}-${set.actions.length - 1}`;
          //   const $last_action_countdown = ui.$set_act_countdowns.get(k);
          //   if ($last_action_countdown && $last_action_countdown.state.running) {
          //     $last_action_countdown.pause();
          //   }
          // }
          methods.setCurSet({ step_idx, set_idx });
        });
        $countdown.onStop(() => {
          ui.$running_set_countdowns.delete(step_set_uid);
          methods.nextSet();
        });
        ui.$set_countdowns.set(step_set_uid, $countdown);
        // if (!the_set_completed) {
        //   estimated_duration += set.rest_duration;
        // }
      }
      // let estimated_set_duration = 0;
      for (let c = 0; c < set.actions.length; c += 1) {
        const action = set.actions[c];
        methods.appendSetAct({
          step_idx,
          set_idx,
          idx: c,
          action,
          pending_set: pending_set,
        });
        // estimated_set_duration += action.reps * 5;
      }
      ui.$inputs_set_remark.set(step_set_uid, new InputCore({ defaultValue: pending_set?.remark ?? "" }));
      ui.$btns_more.set(
        step_set_uid,
        new ButtonCore({
          onClick() {
            ui.$ref_cur_set_idx.select({
              step_idx,
              idx: set_idx,
            });
          },
        })
      );
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
      pending_set: WorkoutDayStepProgressJSON250616["sets"][number] | null;
    }) {
      const { step_idx: a, set_idx: b, idx: c, action, pending_set } = opt;
      // console.log("[PAGE]workout_day/update - appendSetAct", a, b, c, action);
      const step = _steps[a];
      const set = step.sets[b];
      const act = set.actions[c];
      const prev_set = step.sets[b - 1];
      const prev_act = set.actions[c - 1];
      const next_act = set.actions[c + 1];
      const cur_step_set_uid = `${step.uid}-${set.uid}`;
      const cur_step_set_act_uid = `${step.uid}-${set.uid}-${act.uid}`;
      const prev_step_set_uid = prev_set ? `${step.uid}-${prev_set.uid}` : null;
      const prev_step_set_act_uid = prev_act ? `${step.uid}-${set.uid}-${prev_act.uid}` : null;
      const next_step_set_act_uid = next_act ? `${step.uid}-${set.uid}-${next_act.uid}` : null;
      const is_last_act = c === set.actions.length - 1;
      // const pending_action = pending_set?.actions.find((act) => act.idx === c);
      const pending_action = pending_set?.actions.find((a) => a.uid === act.uid);
      // const act = _steps[a].sets[b].actions[c];
      ui.$set_actions.set(cur_step_set_act_uid, SetActionViewModel({ id: action.id, zh_name: action.zh_name }));
      ui.$fields_weight.set(
        cur_step_set_act_uid,
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
        cur_step_set_act_uid,
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
      if ([getSetValueUnit("秒"), getSetValueUnit("分")].includes(action.reps_unit)) {
        const $action_countdown = SetActionCountdownViewModel({
          // workout_duration: 10,
          // rest_duration: 5,
          countdown: toNumber(action.reps, 90),
          rest_duration: action.rest_duration,
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
          if (prev_step_set_act_uid) {
            const $prev_act_countdown = ui.$set_act_countdowns.get(prev_step_set_act_uid);
            if ($prev_act_countdown) {
              $prev_act_countdown.pause();
            }
          }
          if (prev_step_set_uid) {
            const $prev_set_countdown = ui.$set_countdowns.get(prev_step_set_uid);
            if ($prev_set_countdown && $prev_set_countdown.state.running) {
              $prev_set_countdown.pause();
            }
          }
          methods.setCurSet({ step_idx: a, set_idx: b });
        });
        $action_countdown.onFinished(() => {
          /** 在动作倒计时结束后，尝试去将动作「完成」 */
          const $cur_act_check = ui.$inputs_completed.get(cur_step_set_act_uid);
          if ($cur_act_check) {
            methods.completeSetAct({
              step_idx: a,
              set_idx: b,
              act_idx: c,
              ignore_when_completed: true,
            });
          }
          if (next_step_set_act_uid) {
            const $next_act_countdown = ui.$set_act_countdowns.get(next_step_set_act_uid);
            if ($next_act_countdown) {
              $next_act_countdown.start();
            }
            const is_last_act = !$next_act_countdown;
            if (is_last_act) {
              const $countdown = ui.$set_countdowns.get(cur_step_set_uid);
              if ($countdown) {
                $countdown.start();
              }
            }
          }
        });
        ui.$set_act_countdowns.set(cur_step_set_act_uid, $action_countdown);
      }
      ui.$inputs_completed.set(
        cur_step_set_act_uid,
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
      /** 是否忽略更新当前步骤到后端，当完成最后一个动作时会尝试完成前面的动作，此时会重复调用多次后端接口，传入 true 就不会重复多次调用后端接口了 */
      ignore_update_steps?: boolean;
    }) {
      console.log("[PAGE]workout_day/create - handleCompleteSet", opt);
      const common_error_tip = "异常操作";
      const step = _steps[opt.step_idx];
      if (!step) {
        return Result.Err(common_error_tip);
      }
      const set = step.sets[opt.set_idx];
      if (!set) {
        return Result.Err(common_error_tip);
      }
      const act = set.actions[opt.act_idx];
      if (!set) {
        return Result.Err(common_error_tip);
      }
      const step_set_uid = `${step.uid}-${set.uid}`;
      if (!_touched_set_uid.includes(step_set_uid)) {
        _touched_set_uid.push(step_set_uid);
      }
      if (ui.$dialog_num_keyboard.state.open) {
        ui.$dialog_num_keyboard.hide();
      }
      const is_last_step = opt.step_idx === _steps.length - 1;
      const is_last_set = opt.set_idx === step.sets.length - 1;
      const is_last_act = opt.act_idx === set.actions.length - 1;
      const step_set_act_uid = `${step_set_uid}-${act.uid}`;
      const $field_reps = ui.$fields_reps.get(step_set_act_uid);
      const $field_weight = ui.$fields_weight.get(step_set_act_uid);
      const $input_completed = ui.$inputs_completed.get(step_set_act_uid);
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
        // @todo 这里还没更新 _cur_set_idx 吧？
        methods.updateSteps({
          step_idx: _cur_step_idx,
          set_idx: _cur_set_idx,
        });
        result.completed = false;
        return Result.Ok(result);
      }
      const vv_weight = toNumber($field_weight.input.value || $field_weight.input.placeholder);
      const vv_reps = toNumber($field_reps.input.value || $field_reps.input.placeholder);
      console.log(
        "[PAGE]workout_day/update - completeSetAct after vv_reps =",
        $field_weight.input.value,
        $field_weight.input.placeholder,
        vv_weight
      );
      // return Result.Err("he");
      const errors: { msg: string }[] = [];
      if (vv_weight === null) {
        const tip = "不合法的重量值";
        errors.push({
          msg: tip,
        });
        $field_weight.setStatus("error");
        console.warn(tip, vv_weight, $field_weight.input.value, $field_weight.input.placeholder);
        return Result.Err(tip);
      }
      if (vv_reps === null) {
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
      _cur_set_idx = opt.set_idx;
      if (!opt.ignore_update_steps) {
        methods.updateSteps({
          step_idx: _cur_step_idx,
          set_idx: _cur_set_idx,
        });
      }
      if (is_last_act) {
        const has_multiple_act = [
          WorkoutPlanSetType.Decreasing,
          WorkoutPlanSetType.Increasing,
          WorkoutPlanSetType.Super,
          WorkoutPlanSetType.HIIT,
        ].includes(set.type);
        if (has_multiple_act) {
          for (let i = 0; i < set.actions.length - 1; i += 1) {
            methods.completeSetAct({
              step_idx: opt.step_idx,
              set_idx: opt.set_idx,
              act_idx: i,
              ignore_when_completed: true,
              ignore_update_steps: true,
            });
          }
        }
      }
      let the_set_is_completed = true;
      for (let i = 0; i < set.actions.length; i += 1) {
        const act = set.actions[i];
        const _step_set_act_uid = `${step_set_uid}-${act.uid}`;
        const $input_act_completed = ui.$inputs_completed.get(_step_set_act_uid);
        if ($input_act_completed && !$input_act_completed.value) {
          the_set_is_completed = false;
        }
      }
      if (!the_set_is_completed) {
        return Result.Ok(result);
      }
      const $countdown = ui.$set_countdowns.get(step_set_uid);
      if (is_last_step && is_last_set && the_set_is_completed) {
        methods.showWorkoutDayCompleteConfirmDialog();
        if ($countdown) {
          $countdown.complete();
        }
        return Result.Ok(result);
      }
      // console.log("[]handleCompleteSet - ", _cur_step_idx, _next_set_idx, $countdown);
      if ($countdown && !$countdown.state.paused) {
        $countdown.start();
      }
      /** 使用当前的表单值，作为下一组的备用表单值 */
      let next_set_idx = opt.set_idx + 1;
      let next_set = step.sets[next_set_idx];
      if (next_set) {
        const next_step_set_uid = `${step.uid}-${next_set.uid}`;
        for (let i = 0; i < next_set.actions.length; i++) {
          const act = next_set.actions[i];
          // const next_act = next_set.actions
          const _cur_step_set_act_uid = `${step_set_uid}-${act.uid}`;
          const the_act_idx_in_next_set = `${next_step_set_uid}-${act.uid}`;
          const $field_cur_weight = ui.$fields_weight.get(_cur_step_set_act_uid);
          const $field_cur_reps = ui.$fields_reps.get(_cur_step_set_act_uid);
          const $field_next_weight = ui.$fields_weight.get(the_act_idx_in_next_set);
          const $field_next_reps = ui.$fields_reps.get(the_act_idx_in_next_set);
          if ($field_cur_weight && $field_next_weight) {
            const v = toNumber($field_cur_weight.input.value || $field_cur_weight.input.placeholder);
            if (v) {
              $field_next_weight.input.setPlaceholder(v);
            }
            $field_next_weight.input.setUnit($field_cur_weight.input.unit);
          }
          if ($field_cur_reps && $field_next_reps) {
            const v = toNumber($field_cur_reps.input.value || $field_cur_reps.input.placeholder);
            if (v) {
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
      _cur_set_idx = opt.set_idx;
      console.log("[PAGE]workout_day/update setCurSet before methods.updateSteps", opt);
      methods.updateSteps({
        step_idx: _cur_step_idx,
        set_idx: _cur_set_idx,
      });
      methods.refresh();
    },
    nextSet() {
      const cur_step = _steps[_cur_step_idx];
      console.log("[PAGE]workout_day/update - nextSet", _cur_step_idx, _cur_set_idx, cur_step.sets.length);
      _cur_set_idx += 1;
      if (_cur_set_idx > cur_step.sets.length - 1) {
        _cur_step_idx += 1;
        _cur_set_idx = 0;
        if (_cur_step_idx > _steps.length - 1) {
          return;
        }
      }
      const { data } = methods.toBody();
      request.workout_day.update_steps.run({
        id: props.view.query.id,
        content: {
          v: "250616",
          step_idx: _cur_step_idx,
          set_idx: _cur_set_idx,
          act_idx: _cur_act_idx,
          touched_set_uid: _touched_set_uid,
          sets: data,
        },
      });
      console.log("[PAGE]workout_day/update - nextSet before refresh", _cur_step_idx, _cur_step_idx);
      methods.refresh();
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
      console.log("[PAGE]workout_day/update handleCompleteSetAction", opt);
      const r = methods.completeSetAct(opt);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      // const set = _steps[opt.step_idx].sets[opt.set_idx];
      // if (set && r.data.is_last_act && r.data.completed) {
      //   const has_multiple_set_act = [WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(set.type);
      // }
      methods.refresh();
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
          v: "250616",
          step_idx: 0,
          set_idx: 0,
          act_idx: 0,
          touched_set_uid: [],
          sets: [],
        },
      });
      request.workout_day.update_details.run({
        id: props.view.query.id,
        content: {
          v: "250616",
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
      _stats.duration = dayjs().diff(profile.started_at, "minutes") + "min";
      let total_volume = 0;
      const uncompleted_actions: { step_idx: number; set_idx: number; act_idx: number }[] = [];
      for (let a = 0; a < _steps.length; a += 1) {
        const step = _steps[a];
        for (let b = 0; b < _steps[a].sets.length; b += 1) {
          const set = _steps[a].sets[b];
          const actions = [];
          for (let c = 0; c < set.actions.length; c += 1) {
            const act = set.actions[c];
            const step_set_act_uid = `${step.uid}-${set.uid}-${act.uid}`;
            const $field_reps = ui.$fields_reps.get(step_set_act_uid);
            const $field_weight = ui.$fields_weight.get(step_set_act_uid);
            const $input_completed = ui.$inputs_completed.get(step_set_act_uid);
            if ($input_completed && $field_reps && $field_weight) {
              if ($input_completed.value) {
                const v_reps = toNumber($field_reps.input.value, 0);
                const v_weight = toNumber($field_weight.input.value, 0);
                let real_weight = v_weight;
                if ($field_weight.input.unit === getSetValueUnit("磅")) {
                  real_weight = toFixed(real_weight * 0.45, 1);
                }
                if ($field_reps.input.unit === getSetValueUnit("次")) {
                  real_weight = real_weight * v_reps;
                }
                if (real_weight > 0) {
                  total_volume += real_weight;
                }
                actions.push({
                  id: act.id,
                  zh_name: act.zh_name,
                  reps: v_reps,
                  reps_unit: $field_reps.input.unit,
                  weight: v_weight,
                  weight_unit: $field_weight.input.unit,
                });
              }
              if (!$input_completed.value) {
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
      _stats.total_set_count = _stats.sets.length;
      _stats.uncompleted_actions = uncompleted_actions;
      ui.$dialog_overview.show();
      methods.refresh();
    },
    handleClickVideoPoint(v: { video_key: string; time: number }) {
      ui.$popover_action.hide();
      ui.$dialog_content.ui.$dialog_outer.show();
      ui.$dialog_content.ui.$video.onCanPlay(() => {
        ui.$dialog_content.ui.$video.setCurrentTime(v.time);
        ui.$dialog_content.ui.$video.play();
      });
      ui.$dialog_content.ui.$video.onConnected(() => {
        ui.$dialog_content.ui.$video.load(v.video_key);
      });
      if (ui.$dialog_content.ui.$video._mounted) {
        if (ui.$dialog_content.ui.$video.url !== v.video_key) {
          ui.$dialog_content.ui.$video.load(v.video_key);
          return;
        }
        ui.$dialog_content.ui.$video.setCurrentTime(v.time);
        ui.$dialog_content.ui.$video.play();
      }
    },
    toBody() {
      const total = {
        sets: 0,
        weight: 0,
        tips: [] as string[],
      };
      console.log("[PAGE]workout_day/update - toBody 1", _touched_set_uid);
      const data: WorkoutDayStepProgressJSON250616["sets"] = [];
      for (let a = 0; a < _steps.length; a++) {
        const step = _steps[a];
        for (let b = 0; b < step.sets.length; b++) {
          const set = step.sets[b];
          const step_set_uid = `${step.uid}-${set.uid}`;
          if (!_touched_set_uid.includes(step_set_uid)) {
            continue;
          }
          let set_completed = false;
          const actions: WorkoutDayStepProgressJSON250616["sets"][number]["actions"] = [];
          for (let c = 0; c < set.actions.length; c++) {
            const act = set.actions[c];
            const step_set_act_uid = `${step.uid}-${set.uid}-${act.uid}`;
            const $field_weight = ui.$fields_weight.get(step_set_act_uid);
            const $field_reps = ui.$fields_reps.get(step_set_act_uid);
            const $input_check = ui.$inputs_completed.get(step_set_act_uid);
            const $act_countdown = ui.$set_act_countdowns.get(step_set_act_uid);
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
                return toNumber($field_weight.input.placeholder, 0);
              })();
              const vv_reps = (() => {
                if (has_num_value($field_reps.input.value)) {
                  return Number($field_reps.input.value);
                }
                return toNumber($field_reps.input.placeholder, 0);
              })();
              actions.push({
                uid: act.uid,
                action_id: act.id,
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
          const $countdown = ui.$set_countdowns.get(step_set_uid);
          const $remark = ui.$inputs_set_remark.get(step_set_uid);
          // console.log("[PAGE]workout_day/update - $countdown", $countdown?.state.remaining);
          data.push({
            step_uid: step.uid,
            uid: set.uid,
            actions,
            remaining_time: $countdown?.state.remaining ?? 0,
            exceed_time: $countdown?.state.exceed ?? 0,
            completed: set_completed,
            remark: $remark?.value ?? "",
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
          v: "250616",
          steps: _steps,
        },
      });
    },
    /** 更新动作执行进度 */
    updateSteps(opt: { step_idx: number; set_idx: number }) {
      const { data } = methods.toBody();
      console.log("[PAGE]workout_day/update - updateSteps before update_steps.run", opt, data, _touched_set_uid);
      return request.workout_day.update_steps.run({
        id: props.view.query.id,
        content: {
          v: "250616",
          step_idx: opt.step_idx,
          set_idx: opt.set_idx,
          act_idx: _cur_act_idx,
          touched_set_uid: _touched_set_uid,
          sets: data,
        },
      });
    },
    async handleClickWorkoutAction(action: { id: number }) {
      const student_id = request.workout_day.profile.response?.student_id;
      if (!student_id) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      ui.$ref_workout_action.select(action);
      request.workout_action_history.list.search({ workout_action_id: action.id, student_id });
      // ui.$workout_action_profile.ui.$dialog.show();
      // ui.$workout_action_profile.methods.fetch(action);
    },
    showWorkoutActionDialog() {
      const cur_set_key = ui.$ref_cur_set_idx.value;
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
        // 更新动作选择弹窗的状态，如 是否支持多选、禁用的动作、选中的动作 等
        if (
          [WorkoutPlanSetType.Normal, WorkoutPlanSetType.Decreasing, WorkoutPlanSetType.Increasing].includes(set.type)
        ) {
          ui.$workout_action_select.methods.setMode("single");
          ui.$workout_action_select.methods.setDisabled(ids.map((v) => v.id));
        }
        if ([WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(set.type)) {
          ui.$workout_action_select.methods.setMode("multiple");
          ui.$workout_action_select.methods.setDisabled([]);
          ui.$workout_action_select.setValue(ids);
        }
      }
      if (ui.$workout_action_select.request.action.list.response.initial) {
        ui.$workout_action_select.init();
      }
      ui.$workout_action_select.ui.$dialog.show();
    },
    /** 完成该次训练 */
    async completeTheWorkoutDay() {
      // const { data } = methods.toBody();
      props.app.loading({
        text: [],
      });
      ui.$btn_workout_day_submit.setLoading(true);
      const r = await request.workout_day.complete.run({
        id: props.view.query.id,
      });
      ui.$btn_workout_day_submit.setLoading(false);
      props.app.hideLoading();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["完成"],
      });
      ui.$dialog_overview.hide();
      if (!is_multiple_view) {
        props.history.destroyAllAndPush("root.home_layout.index");
        return;
      }
      _profile_view = new RouteViewCore({
        title: "",
        name: "",
        pathname: "",
        query: props.view.query,
      });
      request.workout_day.profile.modifyResponse((v) => {
        return {
          ...v,
          status: WorkoutDayStatus.Finished,
        };
      });
      methods.refresh();
    },
    async giveUp() {
      props.app.loading({
        text: [],
      });
      ui.$btn_workout_day_give_up.setLoading(true);
      ui.$btn_give_up_confirm_ok.setLoading(true);
      const r = await request.workout_day.give_up.run({ id: Number(props.view.query.id) });
      // props.app.hideLoading();
      ui.$btn_workout_day_give_up.setLoading(false);
      ui.$btn_give_up_confirm_ok.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      ui.$dialog_overview.hide();
      ui.$dialog_give_up_confirm.hide();
      props.app.tip({
        text: ["操作成功"],
      });
      if (!is_multiple_view) {
        props.history.destroyAllAndPush("root.home_layout.index");
        return;
      }
      _profile_view = new RouteViewCore({
        title: "",
        name: "",
        pathname: "",
        query: {
          id: props.view.query.id,
          hide_bottom_bar: "1",
        },
      });
      request.workout_day.profile.modifyResponse((v) => {
        return {
          ...v,
          status: WorkoutDayStatus.GiveUp,
        };
      });
      methods.refresh();
    },
    setHeight(height: number) {
      _height = height;
      methods.refresh();
    },
  };
  const $set_actions = new Map<string, SetActionViewModel>();
  const $fields_weight = new Map<string, SingleFieldCore<any>>();
  const $fields_reps = new Map<string, SingleFieldCore<any>>();
  const $inputs_completed = new Map<string, InputCore<any>>();
  const $set_act_countdowns = new Map<string, SetActionCountdownViewModel>();
  const $set_countdowns = new Map<string, SetCountdownViewModel>();
  const $running_set_countdowns = new Map<string, SetCountdownViewModel>();
  const $inputs_set_remark = new Map<string, InputCore<string>>();
  const $btns_more = new Map<string, ButtonCore>();
  const ui = {
    $set_actions,
    $fields_weight,
    $fields_reps,
    $inputs_completed,
    $set_act_countdowns,
    $set_countdowns,
    $running_set_countdowns,
    $inputs_set_remark,
    $btns_more,
    $menu_set: new DropdownMenuCore({
      // side: "left",
      align: "start",
      items: [
        new MenuItemCore({
          label: "备注",
          onClick() {
            const cur_set_key = ui.$ref_cur_set_idx.value;
            if (!cur_set_key) {
              return;
            }
            const { step_idx, idx } = cur_set_key;
            const step = _steps[step_idx];
            const set = step.sets[idx];
            const $remark = ui.$inputs_set_remark.get(`${step.uid}-${set.uid}`);
            if (!$remark) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            ui.$input_remark.setValue($remark.value);
            ui.$dialog_remark.show();
            ui.$menu_set.hide();
          },
        }),
        new MenuItemCore({
          label: "修改当前动作",
          onClick() {
            ui.$menu_set.hide();
            ui.$ref_action_dialog_for.select("change_cur_action");
            methods.showWorkoutActionDialog();
          },
        }),
        new MenuItemCore({
          label: "删除",
          async onClick() {
            const cur_set_key = ui.$ref_cur_set_idx.value;
            if (!cur_set_key) {
              return;
            }
            const { step_idx, idx } = cur_set_key;
            methods.removeSet({ step_idx, set_idx: idx });
            console.log("[]after methods.removeSet", _cur_step_idx, _cur_set_idx);
            // 连续调用接口必须等同一个完成再调另一个
            await methods.updateSteps({
              step_idx: _cur_step_idx,
              set_idx: _cur_set_idx,
            });
            methods.updateDetails();
            ui.$menu_set.hide();
          },
        }),
      ],
    }),
    $ref_cur_set_idx: new RefCore<{ step_idx: number; idx: number }>(),
    $ref_cur_step: new RefCore<{ idx: number }>(),
    $ref_input_key: new RefCore<{ key: string; for: "reps" | "weight" }>(),
    /** 打开动作选择弹窗的目的 增加动作 修改动作 */
    $ref_action_dialog_for: new RefCore<"add_action" | "change_action" | "change_cur_action">(),
    $view: new ScrollViewCore(),
    $workout_plan_dialog_btn: new ButtonCore(),
    $action_select_dialog: new DialogCore({}),
    $action_select_view: new ScrollViewCore(),
    $start_btn: new ButtonCore(),
    /** 动作选择弹窗 */
    $workout_action_select: WorkoutActionSelectViewModel({
      defaultValue: [],
      list: $workout_action_list,
      app: props.app,
      client: props.client,
      onOk(selected_acts) {
        if (selected_acts.length === 0) {
          props.app.tip({
            text: ["请选择动作"],
          });
          return;
        }
        const target = ui.$ref_action_dialog_for.value;
        console.log("[]$workout_action_dialog - after target", target);
        if (!target) {
          props.app.tip({
            text: ["操作异常"],
          });
          return;
        }
        // 修改动作
        if (["change_action", "change_cur_action"].includes(target)) {
          const set_idx = ui.$ref_cur_set_idx.value;
          console.log("[]$ref_cur_set_key - after set_idx", set_idx);
          if (!set_idx) {
            props.app.tip({
              text: ["操作异常"],
            });
            return;
          }
          const a = set_idx.step_idx;
          const step = _steps[a];
          const next_sets: (typeof step)["sets"] = [];
          function updateSetWithSelectedActs(b: number) {
            const set = step.sets[b];
            const step_set_uid = `${step.uid}-${set.uid}`;
            const next_set = {
              idx: set.uid,
              type: set.type,
              actions: set.actions,
              weight: set.weight,
              rest_duration: set.rest_duration,
            };
            // console.log("[]$find matched set - after set_idx", a, b, acts.length, set.actions.length);
            // const { nodes_added, nodes_removed } = diff(set.actions, acts);
            let i = 0;
            const next_actions = [...next_set.actions];
            const next_actions_count = next_actions.length;
            for (; i < selected_acts.length; i += 1) {
              const selected_act = selected_acts[i];
              const act = set.actions[i];
              const step_set_uid = `${step.uid}-${set.uid}-${act.uid}`;
              const $act = ui.$set_actions.get(step_set_uid);
              (() => {
                // 替换已存在的动作组中的 动作信息
                if ($act) {
                  console.log("[]update act", i, selected_act.zh_name);
                  next_actions[i].id = Number(selected_act.id);
                  next_actions[i].zh_name = selected_act.zh_name;
                  $act.change(selected_act);
                  return;
                }
                // 给已存在动作组中 增加动作（一般出现在 HIIT、递增递减组、超级组
                const prev_act = next_actions[i - 1];
                console.log("[]append act", i, selected_act.zh_name);
                const act_payload = buildSetAct(selected_act, {
                  uid: next_actions.length,
                  hiit: prev_act?.reps_unit === getSetValueUnit("秒"),
                });
                methods.appendSetAct({
                  step_idx: a,
                  set_idx: b,
                  idx: i,
                  action: act_payload,
                  pending_set: null,
                });
                next_actions.push(act_payload);
              })();
            }
            for (; i < next_actions_count; i += 1) {
              const act = next_actions[i];
              ui.$set_actions.delete(`${step_set_uid}-${act.uid}`);
              // console.log("[]delete act", i, next_actions[i].zh_name);
              next_actions.splice(i, 1);
            }
            next_sets.push({
              uid: next_set.idx,
              type: next_set.type,
              actions: next_actions,
              weight: next_set.weight,
              rest_duration: next_set.rest_duration,
            });
          }
          for (let b = 0; b < step.sets.length; b += 1) {
            if (target === "change_cur_action") {
              if (b === set_idx.idx) {
                updateSetWithSelectedActs(b);
              } else {
                next_sets.push(step.sets[b]);
              }
            }
            if (target === "change_action") {
              updateSetWithSelectedActs(b);
            }
          }
          _steps = update_arr_item(_steps, a, {
            uid: step.uid,
            sets: next_sets,
            note: step.note,
          });
          ui.$workout_action_select.ui.$dialog.hide();
          methods.refresh();
          methods.updateDetails();
          return;
        }
        // 增加动作
        const v = ui.$ref_cur_step.value;
        console.log("[PAGE]workout_day/create", selected_acts, v);
        if (v) {
          const step = _steps[v.idx];
          if (selected_acts.length === 1) {
            _steps = update_arr_item(_steps, v.idx, {
              uid: step.uid,
              sets: step.sets.map((set, idx) => {
                return {
                  uid: idx,
                  type: set.type,
                  actions: selected_acts.map((act, idx) => {
                    return buildSetAct(act, { uid: idx, hiit: false });
                  }),
                  rest_duration: 90,
                  weight: "RPE 6",
                };
              }),
              note: "",
            });
          }
          ui.$ref_cur_step.clear();
          ui.$workout_action_select.methods.clear();
          ui.$workout_action_select.ui.$dialog.hide();
          methods.refresh();
          return;
        }
        // @todo 这是什么场景
        _steps = [
          ..._steps,
          {
            uid: _steps.length,
            sets: [
              {
                uid: 0,
                type: WorkoutPlanSetType.Normal,
                actions: selected_acts.map((act, idx) => {
                  return buildSetAct(act, { uid: idx, hiit: false });
                }),
                rest_duration: 90,
                weight: "RPE 6",
              },
            ],
            note: "",
          },
        ];
        ui.$workout_action_select.methods.clear();
        ui.$workout_action_select.ui.$dialog.hide();
        methods.refresh();
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
    // $workout_action_profile_dialog: new DialogCore({ footer: false }),
    $workout_action_profile: WorkoutActionProfileViewModel({ app: props.app, client: props.client }),
    $tools: new PresenceCore({}),
    $dialog_overview: new DialogCore({}),
    $dialog_remark: new DialogCore({}),
    /** 备注输入框 */
    $input_remark: new InputCore({
      defaultValue: "",
      placeholder: "请输入备注",
      onMounted() {
        setTimeout(() => {
          ui.$input_remark.focus();
        });
      },
    }),
    /** 备注提交 */
    $btn_remark_submit: new ButtonCore({
      onClick() {
        const v = ui.$input_remark.value;
        if (!v) {
          props.app.tip({
            text: ["请输入备注内容"],
          });
          return;
        }
        const cur_set_key = ui.$ref_cur_set_idx.value;
        if (!cur_set_key) {
          return;
        }
        // ui.$input_remark.setValue(set.note);
        const $input = ui.$inputs_set_remark.get(`${cur_set_key.step_idx}-${cur_set_key.idx}`);
        if (!$input) {
          return;
        }
        $input.setValue(v);
        methods.updateSteps({
          step_idx: _cur_step_idx,
          set_idx: _cur_set_idx,
        });
        ui.$input_remark.clear();
        ui.$dialog_remark.hide();
      },
    }),
    /** 确认放弃弹窗中的 取消 按钮 */
    $btn_give_up_confirm_cancel: new ButtonCore({
      onClick() {
        ui.$dialog_give_up_confirm.hide();
      },
    }),
    /** 确认放弃弹窗中的 确定 按钮 */
    $btn_give_up_confirm_ok: new ButtonCore({
      async onClick() {
        methods.giveUp();
      },
    }),
    $dialog_finish_confirm: new DialogCore({}),
    $dialog_using_guide: new DialogCore({}),
    $menu_workout_day: new DropdownMenuCore({
      items: [
        // new MenuItemCore({
        //   label: "增加动作",
        //   onClick() {
        //     ui.$menu_workout_day.hide();
        //     ui.$workout_action_select.ui.$dialog.show();
        //   },
        // }),
        new MenuItemCore({
          label: "秒表",
          onClick() {
            ui.$menu_workout_day.hide();
            ui.$dialog_stopwatch.show();
          },
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
        // new MenuItemCore({
        //   label: "重置",
        //   async onClick() {
        //     ui.$menu_workout_day.hide();
        //     props.app.tip({
        //       icon: "loading",
        //       text: ["提交中..."],
        //     });
        //     await methods.resetPendingSteps();
        //   },
        // }),
      ],
    }),
    $dialog_give_up_confirm: new DialogCore({}),
    $stopwatch: StopwatchViewModel({}),
    $dialog_stopwatch: new DialogCore({
      onCancel() {
        ui.$stopwatch.pause();
      },
    }),
    $btn_workout_day_submit: new ButtonCore({
      onClick() {
        methods.completeTheWorkoutDay();
      },
    }),
    /** 放弃按钮 */
    $btn_workout_day_give_up: new ButtonCore({
      onClick() {
        ui.$dialog_overview.hide();
        ui.$dialog_give_up_confirm.show();
      },
    }),
    $ref_workout_action: new RefCore<{ id: number }>(),
    $popover_action: new PopoverCore(),
    $btn_workout_action_profile: new ButtonCore({
      onClick() {
        const v = ui.$ref_workout_action.value;
        if (!v) {
          props.app.tip({
            text: ["异常操作"],
          });
          return;
        }
        ui.$popover_action.hide();
        ui.$workout_action_profile.ui.$dialog.show();
        ui.$workout_action_profile.methods.fetch({ id: v.id });
      },
    }),
    $btn_workout_action_change: new ButtonCore({
      onClick() {
        ui.$ref_action_dialog_for.select("change_action");
        ui.$popover_action.hide();
        methods.showWorkoutActionDialog();
      },
    }),
    /** 给 step.sets 增加一组 */
    $btn_workout_action_add_set: new ButtonCore({
      onClick() {
        const set_key = ui.$ref_cur_set_idx.value;
        if (!set_key) {
          return;
        }
        const { step_idx, idx } = set_key;
        const step = _steps[step_idx];
        const set = step.sets[_steps[step_idx].sets.length - 1];
        if (!set) {
          return;
        }
        console.log("[PAGE]workout_day/update - btn_workout_action_add_set before appendSet", set);
        const max_uid = Math.max.apply(
          null,
          step.sets.map((v) => v.uid)
        );
        const appended_set = {
          uid: max_uid + 1,
          type: set.type,
          actions: set.actions,
          rest_duration: set.rest_duration,
          weight: set.weight,
        };
        const next_sets = [...step.sets, appended_set];
        _steps = update_arr_item(_steps, step_idx, {
          ...step,
          sets: next_sets,
        });
        console.log("[]before methods.appendSet - the uid", step.sets.length);
        methods.appendSet(
          {
            ...appended_set,
            step_uid: step.uid,
            completed: false,
          },
          null
        );
        ui.$popover_action.hide();
        // methods.updateSteps({ step_idx: _cur_step_idx, set_idx: _cur_set_idx });
        methods.updateDetails();
        methods.refresh();
      },
    }),
    $dialog_content: VideoWithPointsModel({ app: props.app, points: [] }),
  };
  /** 弹出键盘时页面需要弹起的高度 */
  let _height = 0;
  /** 训练计划的动作内容，将其按组拆分出来的详细步骤 */
  let _steps: WorkoutDayStepDetailsJSON250616["steps"] = [];
  let _workout_action_points: Record<number, { title: string; time_text: string; time: number; video_key: string }[]> =
    {};
  let _cur_step_idx = 0;
  /** 当前组 */
  let _cur_set_idx = 0;
  let _cur_act_idx = 0;
  /** 好像没啥用，就是用来避免提交后端时把未填写的组作为数据 0 提交上去 */
  let _touched_set_uid: string[] = [];
  let _duration = "分钟";
  let _estimated_duration = "分钟";
  /** 统计 */
  let _stats: {
    started_at: string;
    finished_at: string;
    duration: string;
    total_volume: number;
    total_set_count: number;
    uncompleted_actions: { step_idx: number; set_idx: number; act_idx: number }[];
    sets: {
      actions: { id: number; zh_name: string; reps: number; reps_unit: string; weight: number; weight_unit: string }[];
    }[];
  } = {
    started_at: "",
    finished_at: "",
    total_volume: 0,
    total_set_count: 0,
    duration: "",
    uncompleted_actions: [],
    sets: [],
  };
  /** 详情视图，用于多学员场景，单个学员完成时展示其完成状态 */
  let _profile_view: RouteViewCore | null = null;
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
    get cur_workout_action_history() {
      return request.workout_action_history.list.response.dataSource;
    },
    get cur_set_idx() {
      return _cur_set_idx;
    },
    get cur_step_idx() {
      return _cur_step_idx;
    },
    get selected_act() {
      const act = ui.$ref_workout_action.value;
      if (!act) {
        return null;
      }
      const matched_points = (_workout_action_points[act.id] ?? []).map((p, i) => {
        return {
          title: p.title,
          time: p.time,
          time_text: p.time_text,
          video_key: p.video_key,
        };
      });
      return {
        id: act.id,
        points: matched_points,
      };
    },
    get duration() {
      return _duration;
    },
    // get estimated_duration() {
    //   return _estimated_duration;
    // },
    get stats() {
      return _stats;
    },
    get profile_view() {
      return _profile_view;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.workout_action_history.list.onStateChange(() => methods.refresh());
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
    $field.input.setValue(v.toString());
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

  return {
    state: _state,
    ui,
    request,
    methods,
    async ready() {
      const id = toNumber(props.view.query.id);
      console.log("[PAGE]home_workout_day/update ready", id);
      if (id === null) {
        return;
      }
      const r = await request.workout_day.profile.run({ id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const { status, steps, pending_steps, started_at, workout_plan } = r.data;
      console.log(
        "[PAGE]workout_day/update - ready before if (status === WorkoutDayStatus.Started",
        steps,
        pending_steps
      );
      (async () => {
        const r = await request.content_of_workout_plan.list.search({ workout_plan_id: workout_plan.id });
        if (r.error) {
          return;
        }
        const contents = r.data.dataSource;
        const workout_action_points: Record<
          number,
          {
            title: string;
            time: number;
            time_text: string;
            video_key: string;
            workout_action_id: number;
          }[]
        > = {};
        for (let i = 0; i < contents.length; i += 1) {
          const content = contents[i];
          if (content.details.points) {
            for (let j = 0; j < content.details.points.length; j += 1) {
              const { workout_action_id, time, time_text } = content.details.points[j];
              workout_action_points[workout_action_id] = workout_action_points[workout_action_id] || [];
              if (content.video_key) {
                workout_action_points[workout_action_id].push({
                  title: content.title,
                  time_text,
                  time,
                  workout_action_id,
                  video_key: content.video_key,
                });
              }
            }
          }
        }
        _workout_action_points = workout_action_points;
        // methods.refresh();
      })();
      if (status === WorkoutDayStatus.Started) {
        // console.log("started_at.valueOf()", started_at.format("YYYY-MM-DD HH:mm"));
        ui.$day_duration.setStartedAt(started_at.valueOf());
        ui.$day_duration.play();
      }
      _stats.started_at = started_at.format("YYYY-MM-DD HH:mm");
      _cur_step_idx = pending_steps.step_idx;
      _cur_set_idx = pending_steps.set_idx;
      _cur_act_idx = pending_steps.act_idx;
      _touched_set_uid = pending_steps.touched_set_uid;
      _steps = steps;
      /** 预计花费时间 */
      // let estimated_duration = 0;
      for (let a = 0; a < _steps.length; a += 1) {
        const step = _steps[a];
        for (let b = 0; b < step.sets.length; b += 1) {
          const set = step.sets[b];
          const pending_set =
            pending_steps.sets.find((v) => {
              return v.step_uid === step.uid && v.uid === set.uid;
            }) ?? null;
          // let is_completed = a < pending_steps.step_idx;
          // if (a === pending_steps.step_idx) {
          //   is_completed = b < pending_steps.set_idx;
          // }
          let the_set_completed = pending_set?.completed ?? false;
          let all_act_completed = false;
          const pending_set_actions = pending_set?.actions ?? [];
          if (pending_set_actions.length) {
            // 如果默认 all_act_completed true，当 set 没有被编辑过，也默认所有动作完成，逻辑肯定不对，所以这里判断是编辑过的组
            all_act_completed = true;
            for (let i = 0; i < pending_set_actions.length; i += 1) {
              const act = pending_set_actions[i];
              if (!act.completed) {
                all_act_completed = false;
                break;
              }
            }
          }
          if (all_act_completed) {
            the_set_completed = true;
          }
          methods.appendSet(
            {
              ...set,
              step_uid: step.uid,
              completed: the_set_completed,
            },
            pending_set
          );
          // if (!the_set_completed) {
          //   estimated_duration += estimated_set_duration;
          // }
        }
        // _estimated_duration = `${Math.floor(estimated_duration / 60)}分钟`;
      }
      methods.refresh();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayUpdateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayUpdateViewModel, [props]);

  return (
    <>
      <div
        class="working"
        classList={{
          hidden: state().profile?.status !== WorkoutDayStatus.Started,
        }}
      >
        <div class="h-screen bg-w-bg-0">
          <ScrollView store={vm.ui.$view} class="h-full scroll--hidden">
            <div
              class="p-2 rounded-lg transition-all duration-300"
              style={{ transform: `translateY(${-state().height}px)` }}
            >
              <div class="space-y-8">
                <For each={state().steps}>
                  {(step, step_idx) => {
                    return (
                      <div class="">
                        <Show when={step.note}>
                          <div class="flex gap-2 pb-2">
                            <Show
                              when={state().profile?.workout_plan.creator}
                              fallback={<div class="w-[32px] h-[32px] rounded-full bg-w-bg-5"></div>}
                            >
                              <div
                                class="w-[32px] h-[32px] rounded-full bg-w-bg-5"
                                style={{
                                  "background-image": `url('${state().profile?.workout_plan.creator.avatar_url}')`,
                                  "background-size": "cover",
                                  "background-position": "center",
                                }}
                              ></div>
                            </Show>
                            <div class="relative flex-1">
                              <div class="relative inline-block p-2 rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] text-w-fg-1 text-sm bg-w-bg-5">
                                {step.note}
                              </div>
                            </div>
                          </div>
                        </Show>
                        <div class="space-y-2 w-full">
                          <For each={step.sets}>
                            {(set, set_idx) => {
                              const step_set_uid = () => `${step.uid}-${set.uid}`;
                              const is_cur_set = () =>
                                state().cur_step_idx === step_idx() && state().cur_set_idx === set_idx();
                              const is_last_set = () =>
                                step_idx() === state().steps.length - 1 && set_idx() === step.sets.length - 1;
                              const first_act = set.actions[0];
                              const first_act_uid = () => `${step_set_uid}-${first_act.uid}`;
                              return (
                                <>
                                  <div class="overflow-hidden relative w-full">
                                    {/* <Show when={!is_cur_set()}>
                                    <div class="pointer-events-none z-10 absolute inset-0 opacity-40 bg-w-bg-3"></div>
                                  </Show> */}
                                    <div
                                      classList={{
                                        "flex items-center gap-2 p-4 border-2 border-w-fg-3 rounded-lg": true,
                                        // "border-w-fg-2": is_cur_set(),
                                        "border-w-fg-2 bg-w-bg-5": is_cur_set(),
                                      }}
                                    >
                                      <div
                                        class="z-10 absolute right-4 top-4"
                                        onClick={(event) => {
                                          const client = event.currentTarget.getBoundingClientRect();
                                          vm.ui.$ref_cur_set_idx.select({ step_idx: step_idx(), idx: set_idx() });
                                          vm.ui.$menu_set.toggle({ x: client.x + 18, y: client.y + 18 });
                                        }}
                                      >
                                        <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
                                      </div>
                                      <div class="space-y-2 w-full">
                                        <Show
                                          when={
                                            [WorkoutPlanSetType.Increasing, WorkoutPlanSetType.Decreasing].includes(
                                              set.type
                                            ) && vm.ui.$set_actions.get(first_act_uid())
                                          }
                                        >
                                          <SetActionView
                                            store={vm.ui.$set_actions.get(first_act_uid())!}
                                            idx={set_idx() + 1}
                                            highlight={is_cur_set()}
                                            onClick={(event) => {
                                              const { x, y } = event.currentTarget.getBoundingClientRect();
                                              vm.ui.$popover_action.toggle({ x: x - 12, y: y + 18 });
                                              vm.ui.$ref_cur_set_idx.select({ step_idx: step_idx(), idx: set_idx() });
                                              vm.methods.handleClickWorkoutAction(set.actions[0]);
                                            }}
                                          />
                                        </Show>
                                        <Show
                                          when={[WorkoutPlanSetType.Super, WorkoutPlanSetType.HIIT].includes(set.type)}
                                        >
                                          <div
                                            class="inline-flex items-center justify-center px-2 rounded-full"
                                            classList={{
                                              "bg-blue-500": !is_cur_set(),
                                              "bg-w-green": is_cur_set(),
                                            }}
                                          >
                                            <div class="text-sm">{set_idx() + 1}</div>
                                          </div>
                                        </Show>
                                        <div class="space-y-2 w-full">
                                          <For each={set.actions}>
                                            {(action, act_idx) => {
                                              const act_uid = `${step_set_uid()}-${action.uid}`;
                                              const is_countdown_reps = () =>
                                                [getSetValueUnit("秒"), getSetValueUnit("分")].includes(
                                                  action.reps_unit
                                                );
                                              return (
                                                <div class="gap-2">
                                                  <Show
                                                    when={
                                                      ![WorkoutPlanSetType.Decreasing].includes(set.type) &&
                                                      vm.ui.$set_actions.get(act_uid)
                                                    }
                                                  >
                                                    <SetActionView
                                                      store={vm.ui.$set_actions.get(act_uid)!}
                                                      idx={
                                                        [WorkoutPlanSetType.Normal].includes(set.type)
                                                          ? set_idx() + 1
                                                          : 0
                                                      }
                                                      highlight={is_cur_set()}
                                                      onClick={(event) => {
                                                        const { x, y } = event.currentTarget.getBoundingClientRect();
                                                        vm.ui.$popover_action.toggle({ x: x - 12, y: y + 18 });
                                                        vm.ui.$ref_cur_set_idx.select({
                                                          step_idx: step_idx(),
                                                          idx: set_idx(),
                                                        });
                                                        vm.methods.handleClickWorkoutAction(action);
                                                      }}
                                                    />
                                                  </Show>
                                                  <div class="flex items-center gap-2 mt-2">
                                                    <Show when={vm.ui.$fields_weight.get(act_uid)}>
                                                      <SetValueInput
                                                        class="w-[128px]"
                                                        width={128}
                                                        store={vm.ui.$fields_weight.get(act_uid)!}
                                                        onClick={(event) => {
                                                          const client = event.currentTarget.getBoundingClientRect();
                                                          console.log(
                                                            "[]beforeShowNumInput1",
                                                            step_idx(),
                                                            set_idx(),
                                                            act_idx(),
                                                            client.y
                                                          );
                                                          vm.methods.handleShowNumKeyboard({
                                                            for: "weight",
                                                            step_idx: step_idx(),
                                                            set_idx: set_idx(),
                                                            act_idx: act_idx(),
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
                                                    <Show when={vm.ui.$fields_reps.get(act_uid)}>
                                                      <SetValueInput
                                                        store={vm.ui.$fields_reps.get(act_uid)!}
                                                        class=""
                                                        onClick={(event) => {
                                                          const client = event.currentTarget.getBoundingClientRect();
                                                          console.log(
                                                            "[]beforeShowNumInput2",
                                                            step_idx(),
                                                            set_idx(),
                                                            act_idx()
                                                          );
                                                          vm.methods.handleShowNumKeyboard({
                                                            for: "reps",
                                                            step_idx: step_idx(),
                                                            set_idx: set_idx(),
                                                            act_idx: act_idx(),
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
                                                    <Show when={vm.ui.$inputs_completed.get(act_uid)}>
                                                      <SetCompleteBtn
                                                        store={vm.ui.$inputs_completed.get(act_uid)!}
                                                        highlight={is_cur_set()}
                                                        onClick={(event) => {
                                                          vm.methods.handleCompleteSetAction({
                                                            step_idx: step_idx(),
                                                            set_idx: set_idx(),
                                                            act_idx: act_idx(),
                                                          });
                                                        }}
                                                      />
                                                    </Show>
                                                  </div>
                                                  <Show
                                                    when={is_countdown_reps() && vm.ui.$set_act_countdowns.get(act_uid)}
                                                  >
                                                    <div class="rounded-md p-2 mt-1 border-2 border-w-fg-3">
                                                      <SetActionCountdownView
                                                        highlight={is_cur_set()}
                                                        store={vm.ui.$set_act_countdowns.get(act_uid)!}
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
                                  <Show when={!is_last_set()}>
                                    <div class="relative w-full overflow-hidden">
                                      {/* <Show when={!is_cur_set()}>
                                      <div class="pointer-events-none z-10 absolute inset-0 opacity-40 bg-w-bg-3"></div>
                                    </Show> */}
                                      <div
                                        classList={{
                                          "flex items-center gap-2 p-4 border-2 border-w-fg-3 rounded-lg": true,
                                          // "border-w-fg-2": is_cur_set(),
                                          "border-w-fg-2 bg-w-bg-5": is_cur_set(),
                                        }}
                                      >
                                        <Show when={vm.ui.$set_countdowns.get(step_set_uid())}>
                                          <SetCountdownView
                                            store={vm.ui.$set_countdowns.get(step_set_uid())!}
                                            highlight={is_cur_set()}
                                          />
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
              <div class="text-sm text-w-fg-1 text-center">胜利就在眼前 加油!</div>
            </div>
            {/* 32是预留出的一些空间，不至于内容和底部操作栏靠得太近 */}
            <div class="h-[32px]"></div>
            {/* 56是底部操作栏 bottom-operation-bar 的高度 */}
            <div class="h-[56px]"></div>
            <div class="safe-height safe-height--no-color"></div>
          </ScrollView>
          <div class="bottom-operation-bar z-10 fixed bottom-0 left-0 w-full bg-w-bg-1">
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
              <div class="flex items-center justify-between p-2">
                <DayDurationTextView store={vm.ui.$day_duration} />
                <div class="flex items-center gap-2">
                  <div
                    class="py-2 px-4 rounded-md bg-w-bg-5 text-center text-w-fg-0 text-sm"
                    onClick={() => {
                      vm.methods.showWorkoutDayCompleteConfirmDialog();
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
                    <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
                  </div>
                </div>
              </div>
            </Show>
            <div class="safe-height"></div>
          </div>
        </div>
      </div>
      <Show when={state().profile_view}>
        <WorkoutDayProfileView
          app={props.app}
          storage={props.storage}
          pages={props.pages}
          history={props.history}
          client={props.client}
          view={state().profile_view!}
        />
      </Show>
      <Sheet ignore_safe_height store={vm.ui.$workout_action_select.ui.$dialog} app={props.app}>
        <WorkoutActionSelectView store={vm.ui.$workout_action_select} app={props.app} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_num_keyboard} app={props.app}>
        <div class="p-2">
          <SetValueInputKeyboard store={vm.ui.$set_value_input} />
        </div>
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$workout_action_profile.ui.$dialog} app={props.app}>
        <WorkoutActionProfileView store={vm.ui.$workout_action_profile} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_overview} app={props.app}>
        <div class="">
          <WorkoutDayOverviewView store={vm} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_remark} app={props.app}>
        <div class="relative p-2">
          <div class="text-xl text-center">备注</div>
          <Textarea class="mt-4" store={vm.ui.$input_remark} />
          <Button class="w-full mt-2" store={vm.ui.$btn_remark_submit}>
            提交
          </Button>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_give_up_confirm} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center text-w-fg-0">确认放弃本次训练？</div>
          <div class="mt-4 flex items-center gap-2">
            <Button class="w-full" store={vm.ui.$btn_give_up_confirm_cancel}>
              取消
            </Button>
            <Button class="w-full" store={vm.ui.$btn_give_up_confirm_ok}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_using_guide} app={props.app}>
        <div class="relative p-2">
          <div class="absolute top-2 right-2">
            <IconButton
              onClick={() => {
                vm.ui.$dialog_using_guide.hide();
              }}
            >
              <X class="w-4 h-4 text-w-fg-1" />
            </IconButton>
          </div>
          <div class="text-w-fg-0 h-[320px] overflow-y-auto">
            <div class="text-xl text-center text-w-fg-0">使用说明</div>
            <div class="mt-4 space-y-2">
              <div class="p-4 border-2 border-w-fg-3 rounded-lg">
                <div class="">重量</div>
                <div class="text-sm mt-2 space-y-1">
                  <div>
                    <span class="inline-block w-[18px]">1、</span>
                    <span>12RM 表示使用「一次最多做 12次」的重量</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">2、</span>
                    <span>自重动作，如「俯卧撑」重量需要填写0</span>
                  </div>
                  <div>
                    <span class="inline-block w-[18px]">3、</span>
                    <span>动作有辅助参与，如「引体向上机引体」重量可以填写负数</span>
                  </div>
                </div>
              </div>
              <div class="p-4 border-2 border-w-fg-3 rounded-lg">
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
              <div class="p-4 border-2 border-w-fg-3 rounded-lg">
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
      <Sheet store={vm.ui.$dialog_stopwatch} app={props.app}>
        <div class="min-h-[320px] flex justify-center pt-4">
          <StopwatchView store={vm.ui.$stopwatch} />
        </div>
      </Sheet>
      <Sheet ignore_safe_height store={vm.ui.$dialog_content.ui.$dialog_outer} app={props.app}>
        <WorkoutPlanVideoPlayView store={vm.ui.$dialog_content} />
      </Sheet>
      <Popover store={vm.ui.$popover_action}>
        <div class="space-y-2 w-[232px]">
          <div class="h-[138px] overflow-y-auto">
            <For
              each={state().cur_workout_action_history}
              fallback={
                <div>
                  <div class="p-2">
                    <div class="w-full h-full flex items-center justify-center">
                      <div class="flex flex-col items-center justify-center text-w-fg-1">
                        <Bird class="w-12 h-12 text-w-fg-1" />
                        <div class="mt-4 flex items-center space-x-2">
                          <div class="text-center">暂无历史数据</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              {(v) => {
                return (
                  <div>
                    {/* <div>{v.action.zh_name}</div> */}
                    <SetValueView reps={v.reps} reps_unit={v.reps_unit} weight={v.weight} weight_unit={v.weight_unit} />
                    <div class="text-w-fg-1 text-sm">{v.created_at_relative}</div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="operation flex items-center flex-wrap gap-2 mt-4">
            <Button store={vm.ui.$btn_workout_action_profile} size="sm">
              详情
            </Button>
            <Button store={vm.ui.$btn_workout_action_change} size="sm">
              修改整组动作
            </Button>
            <Button store={vm.ui.$btn_workout_action_add_set} size="sm">
              增加1组
            </Button>
          </div>
          <Show when={state().selected_act?.points}>
            <div class="space-y-2">
              <For each={state().selected_act?.points}>
                {(p) => {
                  return (
                    <div
                      onClick={() => {
                        vm.methods.handleClickVideoPoint(p);
                      }}
                    >
                      <div class="text-w-fg-0">{p.title}</div>
                      <div class="flex items-center gap-2">
                        <div class="text-w-fg-1">{p.time_text}</div>
                        <div class="p-2 rounded-full bg-w-bg-5">
                          <Play class="w-4 h-4 text-w-fg-1" />
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </Popover>
      <DropdownMenu store={vm.ui.$menu_set}></DropdownMenu>
      <DropdownMenu store={vm.ui.$menu_workout_day}></DropdownMenu>
    </>
  );
}
