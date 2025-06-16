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
  { label: "热身激活", value: WorkoutPlanStepType.Warmup },
  { label: "力量", value: WorkoutPlanStepType.Strength },
  { label: "拉伸", value: WorkoutPlanStepType.Stretching },
  // { label: "有氧", value: WorkoutPlanStepType.Cardio },
  { label: "心肺", value: WorkoutPlanStepType.Heart },
];
export enum WorkoutPlanSetType {
  /** 常规 */
  Normal = "normal",
  /** 超级组 */
  Super = "super",
  /** 递增组 */
  Increasing = "increasing",
  /** 递减组 */
  Decreasing = "decreasing",
  /** 高强度间歇 */
  HIIT = "hiit",
}
export const WorkoutSetTypeTextMap: Record<WorkoutPlanSetType, string> = {
  [WorkoutPlanSetType.Normal]: "常规组",
  [WorkoutPlanSetType.Super]: "超级组",
  [WorkoutPlanSetType.Increasing]: "递增组",
  [WorkoutPlanSetType.Decreasing]: "递减组",
  [WorkoutPlanSetType.HIIT]: "HIIT",
};
export const WorkoutSetTypeOptions = Object.keys(WorkoutSetTypeTextMap).map((k) => {
  const label = WorkoutSetTypeTextMap[k as any as WorkoutPlanSetType];
  return {
    label,
    value: k,
  };
});

export enum WorkoutScheduleType {
  Weekly = 1,
  Monthly = 2,
  None = 3,
  /** 按天数循环 */
  Days = 4,
}
export const WorkoutScheduleTypeTextMap: Record<WorkoutScheduleType, string> = {
  [WorkoutScheduleType.Weekly]: "周循环",
  [WorkoutScheduleType.Monthly]: "月循环",
  [WorkoutScheduleType.Days]: "天循环",
  [WorkoutScheduleType.None]: "不循环",
};
export enum WorkoutScheduleDayType {
  NoSchedule = 0,
  Workout = 1,
  Resting = 2,
  Empty = 4,
}

export const WorkoutPlanTags = [
  {
    value: "胸",
    text: "胸",
  },
  {
    value: "背",
    text: "背",
  },
  {
    value: "肩",
    text: "肩",
  },
  {
    value: "手臂",
    text: "手臂",
  },
  {
    value: "下肢",
    text: "下肢",
  },
  {
    value: "三分化",
    text: "三分化",
  },
  {
    value: "五分化",
    text: "五分化",
  },
];
