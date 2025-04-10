export enum WorkoutActionType {
  /** 热身 */
  WARMUP = "warmup",
  /** 静态拉伸 */
  STATIC_STRETCH = "static_stretch",
  /** 动态拉伸 */
  DYNAMIC_STRETCH = "dynamic_stretch",
  /** 被动拉伸 */
  PASSIVE_STRETCH = "passive_stretch",
  /** 泡沫轴放松 */
  FOAM_ROLL = "foam_roll",
  /** 力量 */
  RESISTANCE = "resistance",
  /** 有氧 */
  CARDIO = "cardio",
  /** HIIT */
  HIIT = "hiit",
  /** 运动表现 */
  PERFORMANCE = "performance",
  /** 综合 */
  COMPREHENSIVE = "comprehensive",
  /** 瑜伽 */
  YOGA = "yoga",
}

export const WorkoutActionTypeOptions = [
  { label: "热身", value: WorkoutActionType.WARMUP },
  { label: "静态拉伸", value: WorkoutActionType.STATIC_STRETCH },
  { label: "动态拉伸", value: WorkoutActionType.DYNAMIC_STRETCH },
  { label: "被动拉伸", value: WorkoutActionType.PASSIVE_STRETCH },
  { label: "泡沫轴放松", value: WorkoutActionType.FOAM_ROLL },
  { label: "力量", value: WorkoutActionType.RESISTANCE },
  { label: "有氧", value: WorkoutActionType.CARDIO },
  { label: "心肺", value: WorkoutActionType.HIIT },
  { label: "运动表现", value: WorkoutActionType.PERFORMANCE },
  { label: "综合", value: WorkoutActionType.COMPREHENSIVE },
  { label: "瑜伽", value: WorkoutActionType.YOGA },
];

export const WorkoutActionBodyTags = ["手臂", "胸部", "背部", "下肢", "臀腿", "核心"];
// 健康体适能 和 竞技体适能
export const WorkoutActionEffectTags = ["爆发力", "力量", "柔韧性", "协调性", "平衡", "敏捷", "速度"];
