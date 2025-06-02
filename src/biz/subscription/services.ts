import { request } from "@/biz/requests";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";

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
    return Result.Err(r.error.message);
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
