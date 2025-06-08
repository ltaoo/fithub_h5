// @ts-ignore
export const __VERSION__ = process.global.__VERSION__;

export enum CollectionTypes {
  /** 手动创建 */
  Manually = 1,
  /** 每日更新 */
  DailyUpdate = 2,
  /** 每日更新草稿 */
  DailyUpdateDraft = 3,
  /** 每日更新存档 */
  DailyUpdateArchive = 4,
  /** 手动创建的排行榜 */
  ManuallyRank = 5,
}
