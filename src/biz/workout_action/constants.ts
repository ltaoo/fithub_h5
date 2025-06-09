export enum WorkoutActionType {
  /** 热身 */
  Warmup = "warmup",
  /** 静态拉伸 */
  StaticStretch = "static_stretch",
  /** 动态拉伸 */
  DynamicStretch = "dynamic_stretch",
  /** 被动拉伸 */
  PassiveStretch = "passive_stretch",
  /** 泡沫轴放松 */
  FoamRoll = "foam_roll",
  /** 力量 */
  Resistance = "resistance",
  /** 有氧 */
  Cardio = "cardio",
  /** HIIT */
  Heart = "hiit",
  /** 运动表现 */
  Performance = "performance",
  /** 综合 */
  Comprehensive = "comprehensive",
  /** 瑜伽 */
  Yoga = "yoga",
}

export const WorkoutActionTypeOptions = [
  { label: "热身", value: WorkoutActionType.Warmup },
  { label: "静态拉伸", value: WorkoutActionType.StaticStretch },
  { label: "动态拉伸", value: WorkoutActionType.DynamicStretch },
  { label: "被动拉伸", value: WorkoutActionType.PassiveStretch },
  { label: "SMR", value: WorkoutActionType.FoamRoll },
  { label: "力量", value: WorkoutActionType.Resistance },
  // { label: "有氧", value: WorkoutActionType.Cardio },
  { label: "心肺", value: WorkoutActionType.Heart },
  // { label: "运动表现", value: WorkoutActionType.Performance },
  // { label: "综合", value: WorkoutActionType.Comprehensive },
  // { label: "瑜伽", value: WorkoutActionType.Yoga },
];

export const WorkoutActionBodyTags = ["手臂", "胸部", "背部", "腿", "臀腿", "核心"];
// 健康体适能 和 竞技体适能
export const WorkoutActionEffectTags = ["爆发力", "力量", "柔韧性", "协调性", "平衡", "敏捷", "速度"];

export const WorkoutActionTypeSubTagMap: Record<WorkoutActionType, string[]> = {
  [WorkoutActionType.Warmup]: ["全部", "胸", "背", "腿", "臀", "肩", "手臂", "核心", "全身"],
  [WorkoutActionType.StaticStretch]: ["全部", "胸", "背", "腿", "臀", "肩", "手臂", "核心", "全身"],
  [WorkoutActionType.DynamicStretch]: ["全部", "胸", "背", "腿", "臀", "肩", "手臂", "核心", "全身"],
  [WorkoutActionType.PassiveStretch]: ["全部", "胸", "背", "腿", "臀", "肩", "手臂", "核心", "全身"],
  [WorkoutActionType.FoamRoll]: ["全部", "胸", "背", "腿", "臀", "肩", "手臂", "核心", "全身"],
  [WorkoutActionType.Resistance]: [
    "全部",
    "胸",
    "背",
    "腿",
    "臀",
    "肩",
    "手臂",
    "核心",
    // "卧推",
    // "肩推",
    // "划船",
    // "引体",
    // "蹲",
    // "弓步",
    // "前平举",
    // "侧平举",
    // "臂屈伸",
    // "弯举",
    // "腿屈伸",
    // "腿弯举",
  ],
  [WorkoutActionType.Cardio]: [],
  [WorkoutActionType.Heart]: ["全部", "伐木", "登阶", "跑", "跳", "爬"],
  [WorkoutActionType.Performance]: [],
  [WorkoutActionType.Comprehensive]: [],
  [WorkoutActionType.Yoga]: [],
};
