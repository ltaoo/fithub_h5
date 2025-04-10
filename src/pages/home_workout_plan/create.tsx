/**
 * @file 创建训练计划
 */
import { For, Show } from "solid-js";
import { Loader } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, Input, ListView, ScrollView } from "@/components/ui";
import { WorkoutPlanPreviewCard } from "@/components/workout-plan-share-card";
import { WorkoutPlanPreviewPayload } from "@/biz/workout_plan/types";
import { createWorkoutPlan } from "@/biz/workout_plan/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";

import { WorkoutPlanValuesView } from "./workout_plan_form";
import { WorkoutPlanEditorViewModel } from "./model";

function HomeWorkoutPlanCreatePageViewModel(props: ViewComponentProps) {
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
      create: new RequestCore(createWorkoutPlan, { client: props.client }),
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
    $action_select_dialog: $model.$action_select_dialog,
    $action_search_input: $model.$action_search_input,
    $action_search_btn: $model.$action_search_btn,
    $action_select_view: $model.$action_select_view,
    $preview_dialog: new DialogCore({ footer: false }),
    $values: $model.$values,
    $back: new ButtonCore({
      onClick() {
        props.history.back();
      },
    }),
    $preview: new ButtonCore({
      async onClick() {
        const r = await $model.toBody();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        _preview = JSON.parse(r.data.details);
        bus.emit(Events.StateChange, { ..._state });
        ui.$preview_dialog.show();
      },
    }),
    $submit: new ButtonCore({
      async onClick() {
        const r = await $model.toBody();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        const body = r.data;
        console.log("[PAGE]home_workout_plan/create - before create.run", body);
        const r2 = await request.workout_plan.create.run(body);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        props.history.back();
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
  ui.$action_select.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    state: _state,
    ui,
    ready() {
      // $action_select.ready();
      $model.ready();

      // const v = {
      //   level: 4,
      //   steps: [
      //     {
      //       title: "弹力带肩胛骨划圈",
      //       type: "warmup",
      //       set_type: "normal",
      //       set_count: 2,
      //       set_rest_duration: 30,
      //       step_note: "",
      //       action: { id: 15 },
      //       reps: 15,
      //       unit: "次",
      //       weight: "",
      //       note: "",
      //       actions: [],
      //       sets3: [],
      //     },
      //     {
      //       title: "自重深蹲 + 侧向平移组合",
      //       type: "warmup",
      //       set_type: "combo",
      //       set_count: 3,
      //       set_rest_duration: 30,
      //       step_note: "",
      //       actions: [
      //         { action: { id: 13 }, reps: 15, unit: "次", weight: "", rest_duration: 0, note: "" },
      //         { action: { id: 14 }, reps: 15, unit: "秒", weight: "", rest_duration: 0, note: "" },
      //       ],
      //       sets3: [],
      //     },
      //     {
      //       title: "交替反向弓步 + 推举",
      //       type: "strength",
      //       set_type: "combo",
      //       set_count: 3,
      //       set_rest_duration: 90,
      //       step_note: "",
      //       actions: [
      //         { action: { id: 11 }, reps: 12, unit: "次", weight: "18RM", rest_duration: 0, note: "" },
      //         { action: { id: 12 }, reps: 12, unit: "次", weight: "18RM", rest_duration: 0, note: "" },
      //       ],
      //       sets3: [],
      //     },
      //     {
      //       title: "单臂划船 + 同侧腿后伸",
      //       type: "strength",
      //       set_type: "combo",
      //       set_count: 4,
      //       set_rest_duration: 90,
      //       step_note: "",
      //       actions: [
      //         { action: { id: 9 }, reps: 10, unit: "次", weight: "15RM", rest_duration: 0, note: "" },
      //         { action: { id: 10 }, reps: 10, unit: "次", weight: "15RM", rest_duration: 0, note: "" },
      //       ],
      //       sets3: [],
      //     },
      //     {
      //       title: "罗马尼亚硬拉",
      //       type: "strength",
      //       set_type: "normal",
      //       set_count: 5,
      //       set_rest_duration: 90,
      //       step_note: "",
      //       action: { id: 8 },
      //       reps: 15,
      //       unit: "次",
      //       weight: "",
      //       note: "弹力带辅助",
      //       actions: [],
      //       sets3: [],
      //     },
      //     {
      //       title: "死虫式负重加压",
      //       type: "strength",
      //       set_type: "normal",
      //       set_count: 2,
      //       set_rest_duration: 90,
      //       step_note: "",
      //       action: { id: 7 },
      //       reps: 30,
      //       unit: "秒",
      //       weight: "",
      //       note: "",
      //       actions: [],
      //       sets3: [],
      //     },
      //     {
      //       title: "改良版低冲击 HIIT",
      //       type: "cardio",
      //       set_type: "combo",
      //       set_count: 4,
      //       set_rest_duration: 180,
      //       step_note: "",
      //       actions: [
      //         { action: { id: 3 }, reps: 40, unit: "秒", weight: "", rest_duration: 0, note: "无绳可做站姿划船模拟" },
      //         { action: { id: 4 }, reps: 40, unit: "秒", weight: "", rest_duration: 0, note: "" },
      //         { action: { id: 5 }, reps: 40, unit: "秒", weight: "", rest_duration: 0, note: "可用弹力带替代" },
      //         { action: { id: 6 }, reps: 60, unit: "秒", weight: "", rest_duration: 0, note: "" },
      //       ],
      //       sets3: [],
      //     },
      //     {
      //       title: "胸椎旋转释放",
      //       type: "stretching",
      //       set_type: "normal",
      //       set_count: 2,
      //       set_rest_duration: 0,
      //       step_note: "",
      //       action: { id: 1 },
      //       reps: 8,
      //       unit: "次",
      //       weight: "",
      //       note: "",
      //       actions: [],
      //       sets3: [],
      //     },
      //     {
      //       title: "髂腰肌动态拉伸",
      //       type: "stretching",
      //       set_type: "normal",
      //       set_count: 2,
      //       set_rest_duration: 0,
      //       step_note: "",
      //       action: { id: 2 },
      //       reps: 6,
      //       unit: "次",
      //       weight: "",
      //       note: "",
      //       actions: [],
      //       sets3: [],
      //     },
      //   ],
      //   points: ["力量训练组间休息严格控制在 90 秒以内以维持热量消耗"],
      //   suggestions: ["完成 24 小时内补充 20g 乳清蛋白 + 5g 谷氨酰胺"],
      // };
      // $values.setValue(v);
      // $values.refresh();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeWorkoutPlanCreatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeWorkoutPlanCreatePageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <h1 class="text-2xl font-bold mb-4">创建训练计划</h1>
        <div class="bg-white p-4 rounded-lg">
          <WorkoutPlanValuesView store={vm.ui.$values} />
        </div>
        <div class="h-[68px]"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div class="flex gap-2">
            <Button variant="subtle" store={vm.ui.$back}>
              返回
            </Button>
            <Button variant="subtle" store={vm.ui.$preview}>
              预览
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
            <Input store={vm.ui.$action_search_input} />
            <Button class="w-20" store={vm.ui.$action_search_btn}>
              搜索
            </Button>
          </div>
          <div class="mt-2">
            <div class="flex gap-2">
              <div class="px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">力量</div>
              <div class="px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">有氧</div>
            </div>
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
      <Dialog store={vm.ui.$preview_dialog}>
        <Show
          when={state().preview}
          fallback={
            <div class="flex justify-center items-center h-full">
              <Loader class="animate-spin" />
            </div>
          }
        >
          <WorkoutPlanPreviewCard {...state().preview!} />
        </Show>
      </Dialog>
    </>
  );
}
