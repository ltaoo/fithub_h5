import { WorkoutDayStepProgressJSON250531, WorkoutDayStepDetailsJSON250424 } from "./services";
/**
 * 计算总容量
 */
export function calc_total_weight() {}

export function group_sets_in_action(
  sets: WorkoutDayStepProgressJSON250531["sets"],
  profile: WorkoutDayStepDetailsJSON250424
) {
  const result: {
    idx: number;
    type_text: string;
    values: {
      weight: number;
      weight_unit: string;
      reps: number;
      reps_unit: string;
    }[];
  }[] = [];
  for (let i = 0; i < sets.length; i += 1) {
    (() => {
      const { step_idx, idx, actions, completed } = sets[i];
      const step_profile = profile.steps[step_idx];
      if (!step_profile) {
        return;
      }
      const set_profile = step_profile.sets[idx];
      if (!set_profile) {
        return;
      }
    })();
  }

  return result;
}
