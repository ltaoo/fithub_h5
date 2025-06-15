/**
 * @file 创建训练计划
 */
import { For, Show, Switch, Match } from "solid-js";
import { ChevronLeft, Dumbbell, MoreHorizontal, Pen, Plus, Send, Trash } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { $workout_action_list } from "@/store";
import { useViewModel } from "@/hooks";
import { Button, Checkbox, Dialog, DropdownMenu, Input, ListView, ScrollView, Textarea } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionSelectView } from "@/components/workout-action-select3";
import { InputTextView } from "@/components/ui/input-text";
import { WorkoutPlanTagSelectView } from "@/components/workout-plan-tag-select";
import { Presence } from "@/components/ui/presence";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { Switcher } from "@/components/ui/switch";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";

import { ActionInput, ActionInputViewModel } from "./components/action-input";
import { WorkoutPlanEditorViewModel } from "./model";

function WorkoutPlanCreateViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const $model = WorkoutPlanEditorViewModel(props);
  const ui = {
    ...$model.ui,
    $view: new ScrollViewCore(),
  };
  let _state = {
    get fields() {
      return $model.state.fields;
    },
    get equipments() {
      return $model.state.equipments;
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  $model.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      $model.ready();
    },
    destroy() {
      $model.destroy();
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanCreatePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanCreateViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center gap-2 w-full">
            <Button class="w-full" icon={<Plus class="w-4 h-4 text-w-fg-1" />} store={vm.ui.$btn_add_act}>
              添加动作
            </Button>
            <Button class="w-full" store={vm.ui.$btn_create_submit}>
              创建
            </Button>
          </div>
        }
      >
        <div class="space-y-4">
          <div class="field relative">
            <div class="flex">
              <div class="text-sm text-w-fg-0">标题</div>
              <div class="text-red-500">*</div>
            </div>
            <Input store={vm.ui.$input_title} class="mt-1" />
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm  text-w-fg-0">简要说明</div>
            </div>
            <Textarea store={vm.ui.$input_overview} class="mt-1" />
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm text-w-fg-0">训练内容</div>
              <div class="text-red-500">*</div>
            </div>
            <div class="w-full space-y-3 my-2">
              <div class="">
                <Show
                  when={state().fields.length}
                  fallback={
                    <div
                      class="flex justify-center p-4 border-2 border-w-fg-3 rounded-lg"
                      onClick={() => {
                        vm.ui.$ref_action_in_menu.clear();
                        vm.ui.$workout_action_select.ui.$dialog.show();
                      }}
                    >
                      <div class="flex flex-col items-center text-w-fg-1">
                        <div>
                          <Plus class="w-8 h-8" />
                        </div>
                        <div class="">点击添加动作</div>
                      </div>
                    </div>
                  }
                >
                  <div class="mt-4 space-y-8">
                    <For each={state().fields}>
                      {(field, index) => {
                        const $inner = vm.ui.$input_actions.mapFieldWithIndex(index());
                        if (!$inner) {
                          return null;
                        }
                        return (
                          <>
                            <div class="relative border-2 border-w-fg-3 rounded-lg shadow-sm">
                              <Switch>
                                <Match when={$inner.field.symbol === "SingleFieldCore"}>
                                  <ActionInput
                                    store={$inner.field.input}
                                    onShowActionSelect={() => {
                                      vm.ui.$ref_menu_type.select("add_action");
                                      vm.ui.$ref_action_in_menu.select({
                                        id: field.id,
                                        idx: index(),
                                      });
                                      const $field = vm.ui.$input_actions.getFieldWithId(field.id);
                                      if (!$field) {
                                        return;
                                      }
                                      vm.ui.$workout_action_select.methods.setDisabled(
                                        $field.field.input.actions.map((act) => act.action.id)
                                      );
                                      vm.ui.$workout_action_select.ui.$dialog.show();
                                    }}
                                  />
                                </Match>
                              </Switch>
                              <div class="z-0 absolute right-4 top-2">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="bg-w-bg-5 rounded-full p-2"
                                    onClick={(event) => {
                                      vm.ui.$ref_action_in_menu.select({
                                        id: field.id,
                                        idx: index(),
                                      });
                                      const $field = vm.ui.$input_actions.getFieldWithId(field.id);
                                      if (!$field) {
                                        return;
                                      }
                                      vm.ui.$input_act_remark.setValue($field.field.input.ui.$input_set_remark.value);
                                      vm.ui.$dialog_act_remark.show();
                                    }}
                                  >
                                    <Pen class="w-4 h-4 text-w-fg-1" />
                                  </div>
                                  <div
                                    class="bg-w-bg-5 rounded-full p-2"
                                    onClick={(event) => {
                                      const client = event.currentTarget.getBoundingClientRect();
                                      vm.ui.$ref_action_in_menu.select({
                                        id: field.id,
                                        idx: index(),
                                      });
                                      vm.ui.$menu.toggle({
                                        x: client.x,
                                        y: client.y,
                                        width: client.width,
                                        height: client.height,
                                      });
                                    }}
                                  >
                                    <MoreHorizontal class="w-4 h-4 text-w-fg-1" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Show when={state().fields.length - 1 === index()}>
                              <div class=""></div>
                            </Show>
                          </>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm text-w-fg-0">标签</div>
            </div>
            <WorkoutPlanTagSelectView class="mt-1" store={vm.ui.$input_tags} app={props.app} />
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm text-w-fg-0">训练建议</div>
            </div>
            <Textarea class="mt-1" store={vm.ui.$input_suggestions} />
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-sm text-w-fg-0">预计时长</div>
            </div>
            <div class="p-4">
              <InputTextView store={vm.ui.$input_duration} class="mt-1" />
            </div>
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-sm text-w-fg-0">锻炼部位</div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <BodyMusclePreview store={vm.ui.$muscle} />
              </div>
            </div>
          </div>
          <div class="field border-2 border-w-fg-3 rounded-lg">
            <div class="p-4 border-b-2 border-w-fg-3">
              <div class="text-sm text-w-fg-0">所需器械</div>
            </div>
            <div class="p-4 space-y-2">
              <For each={state().equipments}>
                {(v) => {
                  return (
                    <div>
                      <div class="text-w-fg-0">{v.zh_name}</div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
          <div class="field">
            <div class="flex">
              <div class="text-sm text-w-fg-0">外部是否可见</div>
            </div>
            <div class="mt-2">
              <Switcher store={vm.ui.$input_status} texts={["公开", "仅自己可见"]} />
              {/* <div class="text-sm text-w-fg-1">公开后无法删除，无法再次修改为仅自己可见</div> */}
            </div>
          </div>
        </div>
      </PageView>
      <Sheet ignore_safe_height store={vm.ui.$workout_action_select.ui.$dialog} app={props.app}>
        <WorkoutActionSelectView store={vm.ui.$workout_action_select} app={props.app} />
      </Sheet>
      <Sheet store={vm.ui.$dialog_act_remark} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center">备注</div>
          <div class="mt-4">
            <Textarea store={vm.ui.$input_act_remark} />
          </div>
          <div class="flex items-center gap-2 mt-2">
            <Button class="w-full" store={vm.ui.$btn_act_remark_cancel}>
              取消
            </Button>
            <Button class="w-full" store={vm.ui.$btn_act_remark_submit}>
              提交
            </Button>
          </div>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu}></DropdownMenu>
    </>
  );
}
