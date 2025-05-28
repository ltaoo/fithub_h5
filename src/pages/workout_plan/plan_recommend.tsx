import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ScrollView } from "@/components/ui";

function WorkoutPlanRecommendViewModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore({
      onPullToRefresh() {
        console.log("refresh");
        ui.$view.finishPullToRefresh();
      },
    }),
  };

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
    {
      id: "3",
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
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanRecommendView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanRecommendViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="">
      <div class="p-4">
        {/* 搜索区域 */}
        {/* <div class="search-section">
          <input
            type="text"
            placeholder="搜索训练计划..."
            onChange={(e: any) => vm.setSearch(e.target.value)}
            class="search-input"
          />
        </div> */}

        {/* 筛选区域 */}
        {/* <div class="filter-section">
          <div class="filter-group">
            <button
              class={`filter-btn ${state().selectedLevel === "all" ? "active" : ""}`}
              onClick={() => vm.setFilter("all", state().selectedType)}
            >
              全部
            </button>
            <button
              class={`filter-btn ${state().selectedLevel === "beginner" ? "active" : ""}`}
              onClick={() => vm.setFilter("beginner", state().selectedType)}
            >
              新手
            </button>
            <button
              class={`filter-btn ${state().selectedLevel === "advanced" ? "active" : ""}`}
              onClick={() => vm.setFilter("advanced", state().selectedType)}
            >
              进阶
            </button>
          </div>
          <div class="filter-group">
            <button
              class={`filter-btn ${state().selectedType === "strength" ? "active" : ""}`}
              onClick={() => vm.setFilter(state().selectedLevel, "strength")}
            >
              力量训练
            </button>
            <button
              class={`filter-btn ${state().selectedType === "hiit" ? "active" : ""}`}
              onClick={() => vm.setFilter(state().selectedLevel, "hiit")}
            >
              HIIT
            </button>
            <button
              class={`filter-btn ${state().selectedType === "cardio" ? "active" : ""}`}
              onClick={() => vm.setFilter(state().selectedLevel, "cardio")}
            >
              有氧运动
            </button>
          </div>
        </div> */}
        <div>
          <div class="text-xl">分化训练</div>
          <div class="mt-4 overflow-x-auto w-full space-x-2 whitespace-nowrap">
            <div
              class="inline-block p-4 border rounded-md"
              onClick={() => {
                props.history.push("root.workout_plan_profile", {
                  id: String(11),
                });
              }}
            >
              <div>一周四练 周一</div>
            </div>
            <div
              class="inline-block p-4 border rounded-md"
              onClick={() => {
                props.history.push("root.workout_plan_profile", {
                  id: String(12),
                });
              }}
            >
              <div>一周四练 周二</div>
            </div>
            <div
              class="inline-block p-4 border rounded-md"
              onClick={() => {
                props.history.push("root.workout_plan_profile", {
                  id: String(13),
                });
              }}
            >
              <div>一周四练 周四</div>
            </div>
            <div
              class="inline-block p-4 border rounded-md"
              onClick={() => {
                props.history.push("root.workout_plan_profile", {
                  id: String(14),
                });
              }}
            >
              <div>一周四练 周五</div>
            </div>
          </div>
        </div>
        <div class="mt-8">
          <div>
            <div class="text-xl">推荐</div>
          </div>
          <div class="mt-4 space-y-2">
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
        </div>
      </div>
    </ScrollView>
  );
}
