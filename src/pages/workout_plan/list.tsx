/**
 * @file 训练计划列表
 */
import { For, Show } from "solid-js";
import { Clock, Plus, Search } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ListView, ScrollView } from "@/components/ui";
import { WorkoutPlanPreviewCard } from "@/components/workout-plan-share-card";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { base, Handler } from "@/domains/base";
import { ButtonCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutPlanList, fetchWorkoutPlanListProcess } from "@/biz/workout_plan/services";

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
      async onPullToRefresh() {
        await request.workout_plan.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.workout_plan.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $btn_back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $btn_create: new ButtonCore({
      onClick() {
        props.history.push("root.workout_plan_create");
      },
    }),
    $input_keyword: new InputCore({ defaultValue: "", placeholder: "请输入关键词" }),
    $btn_submit: new ButtonCore({
      onClick() {
        const v = ui.$input_keyword.value;
        if (!v) {
          props.app.tip({
            text: ["请输入查询关键词"],
          });
          return;
        }
        request.workout_plan.list.search({
          keyword: v,
        });
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
      <div class="z-0 fixed top-0 left-0 w-full">
        <NavigationBar1
          history={props.history}
          extra={
            <div class="flex items-center gap-2">
              <Input store={vm.ui.$input_keyword} />
              <Button
                store={vm.ui.$btn_submit}
                icon={<Search class="w-6 h-6 text-gray-800" />}
                class="flex items-center justify-center p-2 rounded-full bg-gray-200"
              ></Button>
              <Button
                store={vm.ui.$btn_create}
                icon={<Plus class="w-6 h-6 text-gray-800" />}
                class="flex items-center justify-center p-2 rounded-full bg-gray-200"
              ></Button>
            </div>
          }
        />
      </div>
      <div class="absolute top-[74px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view} class="">
          <div class="p-4">
            <div class="">
              <ListView store={vm.request.workout_plan.list} class="space-y-4">
                <For each={state().response.dataSource}>
                  {(plan) => {
                    return (
                      <div
                        onClick={() => {
                          props.history.push("root.workout_plan_profile", {
                            id: plan.id.toString(),
                          });
                        }}
                      >
                        <div class="overflow-hidden relative w-full h-[160px] rounded-lg border">
                          <div class="z-10 absolute inset-0 p-4">
                            <div class="">
                              <div class="text-2xl">{plan.title}</div>
                              <div>{plan.overview}</div>
                              <div class="mt-2">
                                <div class="flex items-center gap-1">
                                  <Clock class="w-4 h-4" />
                                  <div class="text-sm">{plan.estimated_duration_text}</div>
                                </div>
                              </div>
                              <div class="flex flex-wrap gap-2 mt-4">
                                <For each={plan.tags}>
                                  {(text) => {
                                    return <div class="px-2 py-1 rounded-full border text-sm text-white">{text}</div>;
                                  }}
                                </For>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </ListView>
            </div>
          </div>
        </ScrollView>
      </div>
    </>
  );
}
