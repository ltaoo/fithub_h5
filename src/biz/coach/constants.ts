export enum CoachArticleType {
  /** 视频 */
  Video = 1,
  /** 短视频 */
  ShortVideo = 2,
  /** 文章 */
  Article = 3,
  /** 图片 */
  Picture = 4,
  /** 短文本 */
  Text = 5,
}
export const CoachArticleTypeTextMap: Record<CoachArticleType, string> = {
  [CoachArticleType.Video]: "视频",
  [CoachArticleType.ShortVideo]: "短视频",
  [CoachArticleType.Article]: "文章",
  [CoachArticleType.Picture]: "图片",
  [CoachArticleType.Text]: "短文本",
};

export const CoachArticleTypeOptions = [
  CoachArticleType.Video,
//   CoachArticleType.ShortVideo,
  // ...
].map((v) => {
  return {
    label: CoachArticleTypeTextMap[v],
    value: v,
  };
});
