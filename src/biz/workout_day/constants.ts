export enum WorkoutDayStatus {
  Pending = 0,
  Started = 1,
  Finished = 2,
  Expired = 3,
  Cancelled = 4,
  GiveUp = 5,
}

export const WorkoutDayStatusTextMap = {
  [WorkoutDayStatus.Pending]: "待进行",
  [WorkoutDayStatus.Started]: "进行中",
  [WorkoutDayStatus.Finished]: "已完成",
  [WorkoutDayStatus.Expired]: "已过期",
  [WorkoutDayStatus.Cancelled]: "手动作废",
  [WorkoutDayStatus.GiveUp]: "已放弃",
};
