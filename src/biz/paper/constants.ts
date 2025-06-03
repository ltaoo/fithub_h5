export enum QuizTypes {
  /** 单选 */
  Single = 1,
  /** 多选 */
  Multiple = 2,
  /** 判断体 */
  Judgment = 3,
  /** 填空 */
  Fill = 4,
  /** 简答 */
  Short = 5,
}

export const QuizTypeTextMap: Record<QuizTypes, string> = {
  [QuizTypes.Single]: "单选",
  [QuizTypes.Multiple]: "多选",
  [QuizTypes.Judgment]: "判断",
  [QuizTypes.Fill]: "填空",
  [QuizTypes.Short]: "简答",
};

export enum ExamStatus {
  Pending = 1,
  Running = 2,
  Completed = 3,
  GiveUp = 4,
  Exceed = 5,
}
export const ExamStatusTextMap: Record<ExamStatus, string> = {
  [ExamStatus.Pending]: "待开始",
  [ExamStatus.Running]: "进行中",
  [ExamStatus.Completed]: "完成",
  [ExamStatus.GiveUp]: "手动放弃",
  [ExamStatus.Exceed]: "超时失败",
};

export enum QuizAnswerStatus {
  Unknown = 0,
  Correct = 1,
  Incorrect = 2,
  Skipped = 3,
}
export const QuizAnswerStatusTextMap: Record<QuizAnswerStatus, string> = {
  [QuizAnswerStatus.Unknown]: "未知",
  [QuizAnswerStatus.Correct]: "正确",
  [QuizAnswerStatus.Incorrect]: "错误",
  [QuizAnswerStatus.Skipped]: "跳过",
};
