/**
 * @file 周期性计划
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";

interface WorkoutPlan {
  id: string;
  title: string;
  level: "beginner" | "advanced";
  type: "strength" | "hiit" | "cardio";
  duration: number; // in minutes
  calories: number;
  equipment: string[];
  thumbnail: string;
}

function PlanIntervalViewModel(props: ViewComponentProps) {
  let _plans = [
    {
      id: "1",
      title: "新手力量训练入门",
      level: "beginner",
      type: "strength",
      duration: 30,
      calories: 200,
      equipment: ["哑铃", "健身垫"],
      thumbnail: "https://static.funzm.com/assets/images/682e277957709aef.png",
    },
    {
      id: "2",
      title: "进阶力量塑形",
      level: "advanced",
      type: "strength",
      duration: 45,
      calories: 350,
      equipment: ["哑铃", "健身垫", "弹力带"],
      thumbnail: "https://static.funzm.com/assets/images/4819a10cf67aa5a6.png",
    },
  ];
  let _state = {
    get plans() {
      return _plans;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
type PlanIntervalViewModel = ReturnType<typeof PlanIntervalViewModel>;

export function WorkoutPlanIntervalView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(PlanIntervalViewModel, [props]);

  return (
    <div class="plans-grid">
      <For each={state().plans}>
        {(plan) => {
          return (
            <div class="plan-card" style={{ "background-image": `url(${plan.thumbnail})` }}>
              <div class="plan-overlay">
                <div class="plan-info">
                  <h3>{plan.title}</h3>
                  <div class="plan-meta">
                    <span>{plan.duration}分钟</span>
                    <span>{plan.calories}千卡</span>
                  </div>
                  <div class="plan-tags">
                    <For each={plan.equipment}>
                      {(equipment) => {
                        return <span class="equipment-tag">{equipment}</span>;
                      }}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
