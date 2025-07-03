import dayjs from "dayjs";

import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { FetchParams } from "@/domains/list/typing";
import { request } from "@/biz/requests";
import { ListResponse } from "@/biz/requests/types";

import { GiftCardStatus, SubscriptionStatus, SubscriptionStatusTextMap } from "./constants";

export function fetchSubscriptionPlanList() {
  return request.post<{
    list: {
      id: number;
      name: string;
      details: string;
      unit_price: number;
    }[];
  }>("/api/subscription_plan/list", {
    page_size: 10,
    page: 1,
  });
}

export function fetchSubscriptionPlanListProcess(r: TmpRequestResp<typeof fetchSubscriptionPlanList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    list: data.list.map((plan) => {
      return {
        id: plan.id,
        name: plan.name,
        details: plan.details,
        choices: [
          {
            title: "月卡",
            value: "month",
            price_text: `${(plan.unit_price * 30) / 100}元`,
          },
          {
            title: "季卡",
            value: "season",
            price_text: `${(plan.unit_price * 90) / 100}元`,
          },
          {
            title: "年卡",
            value: "year",
            price_text: `${(plan.unit_price * 360) / 100}元`,
          },
        ],
      };
    }),
  });
}

export function fetchSubscriptionList(body: FetchParams) {
  return request.post<
    ListResponse<{
      step: SubscriptionStatus;
      reason: string;
      count: number;
      created_at: string;
      active_at: string;
      subscription_plan: {
        name: string;
      };
    }>
  >("/api/subscription/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}

export function fetchSubscriptionListProcess(r: TmpRequestResp<typeof fetchSubscriptionList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const data = r.data;
  return Result.Ok({
    ...data,
    list: data.list.map((s) => {
      return {
        text: (() => {
          if (s.count === 9999) {
            return "终身VIP";
          }
          return `${s.subscription_plan.name}x${s.count}天`;
        })(),
        status: s.step,
        status_text: SubscriptionStatusTextMap[s.step],
        reason: s.reason,
        day_count: s.count,
        created_at: (() => {
          if (s.step === SubscriptionStatus.Active && s.active_at) {
            return dayjs(s.active_at).format("YYYY-MM-DD HH:mm");
          }
          return dayjs(s.created_at).format("YYYY-MM-DD HH:mm");
        })(),
      };
    }),
  });
}

export function fetchGiftCardProfile(body: { code: string }) {
  return request.post<{
    name: string;
    status: GiftCardStatus;
  }>("/api/gift_card/profile", { code: body.code });
}

export function usingGiftCard(body: { code: string }) {
  return request.post("/api/gift_card/using", { code: body.code });
}
