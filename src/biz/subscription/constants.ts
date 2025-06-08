export enum SubscriptionStatus {
  Pending = 1,
  Active = 2,
  Expired = 3,
}

export const SubscriptionStatusTextMap: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.Pending]: "待生效",
  [SubscriptionStatus.Active]: "生效中",
  [SubscriptionStatus.Expired]: "已失效",
};

export enum GiftCardStatus {
  Unused = 0,
  Used = 1,
}
