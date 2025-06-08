/**
 * @file 编辑训练计划
 */
import { For, Show } from "solid-js";
import { Loader } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ListView, ScrollView } from "@/components/ui";
import { WorkoutPlanPreviewCard } from "@/components/workout-plan-share-card";
import { fetchWorkoutActionListByIds, fetchWorkoutActionListByIdsProcess } from "@/biz/workout_action/services";
import { WorkoutPlanPreviewPayload } from "@/biz/workout_plan/types";
import {
  fetchWorkoutPlanProfile,
  fetchWorkoutPlanProfileProcess,
  updateWorkoutPlan,
} from "@/biz/workout_plan/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";

import { WorkoutPlanEditorViewModel } from "./model";

function HomeWorkoutPlanUpdatePageViewModel(props: ViewComponentProps) {
  const workout_plan_id = props.view.query.id;

  let _preview: WorkoutPlanPreviewPayload | null = null;

  let _state = {
    get actions() {
      return ui.$action_select.state.actions;
    },
    get selectedActions() {
      return ui.$action_select.state.selected;
    },
    get preview() {
      return _preview;
    },
  };

  const $model = WorkoutPlanEditorViewModel(props);

  const request = {
    workout_plan: {
      profile: new RequestCore(fetchWorkoutPlanProfile, {
        process: fetchWorkoutPlanProfileProcess,
        client: props.client,
      }),
      update: new RequestCore(updateWorkoutPlan, { client: props.client }),
    },
    workout_action: {
      list_by_ids: new RequestCore(fetchWorkoutActionListByIds, {
        process: fetchWorkoutActionListByIdsProcess,
        client: props.client,
      }),
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $action_dialog_btn: new ButtonCore({
      onClick() {
        ui.$action_select.ready();
        ui.$action_select_dialog.show();
      },
    }),
    $action_select: $model.$action_select,
    $action_select_view: new ScrollViewCore({
      async onReachBottom() {
        await ui.$action_select.request.action.list.loadMore();
        ui.$action_select_view.finishLoadingMore();
      },
    }),
    $action_select_dialog: $model.$action_select_dialog,
    $values: $model.$values,
    $back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $preview_dialog: new DialogCore({ footer: false }),
    $submit: new ButtonCore({
      async onClick() {},
    }),
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  ui.$action_select.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    state: _state,
    ui,
    async ready() {
      if (!workout_plan_id) {
        props.app.tip({
          text: ["缺少 id 参数"],
        });
        return;
      }
      ui.$action_select.ready();
      const r = await request.workout_plan.profile.run({ id: workout_plan_id });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const r2 = await request.workout_action.list_by_ids.run({
        ids: [],
      });
      if (r2.error) {
        props.app.tip({
          text: [r2.error.message],
        });
        return;
      }
      const profile = r.data;
      const actions = r2.data.list;
      console.log("[PAGE]home_workout_plan/update - after profile.run", actions);
      ui.$action_select.methods.setActions(
        actions.map((act) => {
          return {
            id: act.id,
            name: act.name,
            zh_name: act.zh_name,
            type: act.type,
            overview: act.overview,
            tags1: act.tags1,
            tags2: act.tags2,
            level: act.level,
            equipments: act.equipments,
            muscles: act.muscles,
          };
        })
      );
      $model.$values.setValue(profile);
      $model.$values.refresh();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeWorkoutPlanUpdatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanUpdatePageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <h1 class="text-2xl font-bold mb-4">编辑训练计划</h1>
        <div class="bg-white p-4 rounded-lg">
          {/* <WorkoutPlanValuesView store={vm.ui.$values} /> */}
        </div>
        <div class="h-[68px]"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div class="flex gap-2">
            <Button variant="subtle" store={vm.ui.$back}>
              返回
            </Button>
            <Button store={vm.ui.$submit}>提交</Button>
          </div>
        </div>
      </ScrollView>
      <div
        class="absolute bottom-24 right-12 p-4 bg-white rounded-full border border-gray-200 cursor-pointer"
        onClick={() => {
          vm.ui.$action_dialog_btn.click();
        }}
      >
        <div>添加动作</div>
      </div>
      <Dialog store={vm.ui.$action_select_dialog}>
        <div class="w-[520px]">
          <div class="flex gap-2">
            <div class="px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">力量</div>
            <div class="px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">有氧</div>
          </div>
          <div class="mt-2 h-[480px] overflow-y-auto">
            <ScrollView store={vm.ui.$action_select_view}>
              <ListView store={vm.ui.$action_select.request.action.list} class="space-y-2">
                <For each={state().actions}>
                  {(action) => {
                    return (
                      <div
                        class="p-2 flex justify-between items-center border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          vm.ui.$action_select.methods.select(action);
                        }}
                      >
                        <div>
                          <div class="">{action.zh_name}</div>
                          <div class="text-sm">{action.name}</div>
                        </div>
                        <Show when={state().selectedActions.find((item) => item.id === action.id)}>
                          <div class="text-sm text-green-500">已选</div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </ListView>
            </ScrollView>
          </div>
        </div>
      </Dialog>
    </>
  );
}
