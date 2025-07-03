import { Result } from "@/domains/result";
import { remove_arr_item, update_arr_item } from "@/utils";

export function calcTheHighlightIdxAfterRemoveSet<T extends { uid: number; sets: { uid: number }[] }>(
  opt: { step_idx: number; set_idx: number },
  opt2: {
    steps: T[];
    cur_step_idx: number;
    cur_set_idx: number;
  }
) {
  console.log("[PAGE]workout_day/update - removeSet", opt.step_idx, opt.set_idx);
  let _cur_step_idx = opt2.cur_step_idx;
  let _cur_set_idx = opt2.cur_set_idx;
  let _steps = opt2.steps;
  const step = _steps[_cur_step_idx];
  console.log("[]", _cur_step_idx, _cur_set_idx);
  const is_remove_cur_set = opt.step_idx === _cur_step_idx && opt.set_idx === _cur_set_idx;
  const step_is_last_step = _steps.length === 1;
  const is_remove_last_set = _steps[opt.step_idx].sets.length === 1;
  console.log("[]step_is_last_step", step_is_last_step);
  console.log("[]is_remove_last_set", is_remove_last_set);
  console.log("[]is_remove_cur_set", is_remove_cur_set);
  if (step_is_last_step && is_remove_last_set) {
    return Result.Err("无法删除最后一组动作");
  }
  _steps = update_arr_item(_steps, opt.step_idx, {
    ...step,
    sets: remove_arr_item(step.sets, opt.set_idx),
  });
  if (is_remove_last_set) {
    console.log(17);
    _steps = remove_arr_item(_steps, opt.step_idx);
  }
  if (!is_remove_cur_set) {
    // 不是移除当前高亮的，但是高亮通过 idx 标记，idx = 2，删除了 0，视觉上高亮变成了下一个
    if (opt.step_idx === _cur_step_idx && opt.set_idx < _cur_set_idx) {
      console.log(18);
      _cur_set_idx -= 1;
    }
    return Result.Ok({
      steps: _steps,
      cur_step_idx: _cur_step_idx,
      cur_set_idx: _cur_set_idx,
    });
  }
  let next_set_idx = _cur_set_idx - 1;
  if (next_set_idx < 0) {
    console.log(19);
    next_set_idx = 0;
    // 当前动作的组全删掉了，看看前面还有没有组
    const prev = _steps[_cur_step_idx - 1];
    if (prev) {
      console.log(20);
      next_set_idx = prev.sets.length - 1;
    }
  }
  _cur_set_idx = next_set_idx;
  if (is_remove_last_set) {
    console.log(21);
    //     _cur_set_idx = 0;
    let next_step_idx = _cur_step_idx - 1;
    if (next_step_idx < 0) {
      next_step_idx = 0;
    }
    _cur_step_idx = next_step_idx;
  }
  return Result.Ok({
    steps: _steps,
    cur_step_idx: _cur_step_idx,
    cur_set_idx: _cur_set_idx,
  });
}
