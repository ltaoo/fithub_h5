/**
 * @file 训练计划
 */
import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ListView, ScrollView } from "@/components/ui";
import { WorkoutPlanPreviewCard } from "@/components/workout-plan-share-card";
import { fetchWorkoutPlanList, fetchWorkoutPlanListProcess } from "@/biz/workout_plan/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";

function HomeWorkoutPlanListPageViewModel(props: ViewComponentProps) {
  let _state = {
    get response() {
      return request.workout_plan.list.response;
    },
  };
  const methods = {};
  const request = {
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, { process: fetchWorkoutPlanListProcess, client: props.client })
      ),
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.workout_plan.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $create_btn: new ButtonCore({
      onClick: () => {
        props.history.push("root.home_layout.workout_plan_create");
      },
    }),
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
    ui,
    request,
    ready() {
      request.workout_plan.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeWorkoutPlanListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanListPageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <h1 class="text-2xl font-bold mb-4">计划列表</h1>
        <div>
          <Button store={vm.ui.$create_btn}>创建计划</Button>
        </div>
        <div class="py-4">
          <ListView store={vm.request.workout_plan.list} class="space-y-4">
            <For each={state().response.dataSource}>
              {(plan) => {
                return (
                  <div
                    class="p-4 rounded-md bg-gray-100"
                    onClick={() => {
                      props.history.push("root.workout_plan_profile", {
                        id: plan.id.toString(),
                      });
                    }}
                  >
                    <div>
                      <div>{plan.title}</div>
                    </div>
                  </div>
                );
              }}
            </For>
          </ListView>
        </div>
      </ScrollView>
    </>
  );
}
