export enum WorkoutPlanStepType {
  Warmup = "warmup",
  Strength = "strength",
  Stretching = "stretching",
  Cardio = "cardio",
  Heart = "heart",
  Performance = "performance",
  Yoga = "yoga",
}
export const WorkoutPlanStepTypeMap: Record<WorkoutPlanStepType, string> = {
  [WorkoutPlanStepType.Warmup]: "warmup",
  [WorkoutPlanStepType.Strength]: "strength",
  [WorkoutPlanStepType.Stretching]: "stretch",
  [WorkoutPlanStepType.Cardio]: "cardio",
  [WorkoutPlanStepType.Heart]: "heart",
  [WorkoutPlanStepType.Performance]: "performance",
  [WorkoutPlanStepType.Yoga]: "yoga",
};
export const WorkoutPlanStepTypeTextMap: Record<WorkoutPlanStepType, string> = {
  [WorkoutPlanStepType.Warmup]: "热身",
  [WorkoutPlanStepType.Strength]: "力量",
  [WorkoutPlanStepType.Stretching]: "拉伸",
  [WorkoutPlanStepType.Cardio]: "有氧",
  [WorkoutPlanStepType.Heart]: "心肺",
  [WorkoutPlanStepType.Performance]: "运动表现",
  [WorkoutPlanStepType.Yoga]: "瑜伽",
};

export const WorkoutPlanStepTypeOptions = [
  { label: "热身", value: WorkoutPlanStepType.Warmup },
  { label: "力量", value: WorkoutPlanStepType.Strength },
  { label: "拉伸", value: WorkoutPlanStepType.Stretching },
  { label: "有氧", value: WorkoutPlanStepType.Cardio },
  { label: "心肺", value: WorkoutPlanStepType.Heart },
];

export enum WorkoutPlanSetType {
  Normal = "normal",
  Combo = "combo",
  Free = "free",
}
export const WorkoutSetTypeTextMap: Record<WorkoutPlanSetType, string> = {
  [WorkoutPlanSetType.Normal]: "单个动作",
  [WorkoutPlanSetType.Combo]: "多个动作",
  [WorkoutPlanSetType.Free]: "自由设置",
};
export const WorkoutSetTypeOptions = [
  { label: "单个动作", value: WorkoutPlanSetType.Normal },
  { label: "多个动作", value: WorkoutPlanSetType.Combo },
  { label: "自由设置", value: WorkoutPlanSetType.Free },
];
