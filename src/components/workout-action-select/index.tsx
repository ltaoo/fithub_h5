/**
 * @file 动作多选面板
 */
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { ChevronDown, ChevronLeft, MoreHorizontal, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import * as PopoverPrimitive from "@/packages/ui/popover";
import { Button, Dialog, Input, ListView, Popover, ScrollView } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionProfileView } from "@/components/workout-action-profile";

import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";

export function WorkoutActionSelectView(props: {
  store: WorkoutActionSelectViewModel;
  app: ViewComponentProps["app"];
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="flex flex-col h-w-screen bg-w-bg-0 border-w-fg-3">
        <div class="flex gap-2 p-2">
          <div class="w-[240px]">
            <Select store={vm.ui.$input_type_select} />
          </div>
          <Input store={vm.ui.$input_keyword} />
          <Button store={vm.ui.$btn_search_submit} size="sm" class="w-[88px]">
            搜索
          </Button>
        </div>
        <div class="flex-1 flex h-0 border-t-2 border-w-fg-3">
          <div class="scroll--hidden w-[90px] h-full pt-2 px-2 overflow-y-auto border-r-2 border-w-fg-3">
            <For each={state().tags}>
              {(tag) => {
                return (
                  <div
                    classList={{
                      "py-2 rounded-md text-center border-2 border-w-bg-0": true,
                      "text-w-fg-0": tag.selected,
                      "text-w-fg-1": !tag.selected,
                    }}
                    onClick={() => {
                      vm.methods.handleClickTag(tag);
                    }}
                  >
                    <div class="text-center text-sm">{tag.text}</div>
                  </div>
                );
              }}
            </For>
          </div>
          <ScrollView store={vm.ui.$view} class="flex-1 h-full overflow-y-auto">
            <ListView store={vm.request.action.list}>
              <div class="actions grid grid-cols-3 gap-2 p-2">
                <For each={state().actions}>
                  {(action) => {
                    return (
                      <div
                        classList={{
                          "relative p-2 flex justify-between border-2 border-w-fg-3 rounded-md text-w-fg-0": true,
                          "border-w-fg-2 bg-w-bg-5": !!state().value.find((act) => act.id === action.id),
                          "border-w-fg-3 bg-w-bg-3 text-w-fg-3": !!state().disabled.includes(action.id),
                        }}
                        onClick={() => {
                          vm.methods.select(action);
                        }}
                      >
                        <div class="absolute inset-0 p-2">
                          <div class="overflow-hidden  truncate line-clamp-2 break-all whitespace-pre-wrap">
                            <div class="text-sm">{action.zh_name}</div>
                          </div>
                          <div class="absolute right-1 bottom-1">
                            <div
                              class="p-1 rounded-full"
                              onClick={(event) => {
                                event.stopPropagation();
                                vm.methods.handleClickWorkoutAction(action);
                              }}
                            >
                              <MoreHorizontal class="w-4 h-4 text-w-fg-2" />
                            </div>
                          </div>
                        </div>
                        <div class="w-full" style="padding-bottom: 100%"></div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </ListView>
          </ScrollView>
        </div>
        <div>
          <div class="flex items-center gap-2 p-2 bg-w-bg-1 border-t border-w-fg-3">
            <div class="w-[40px] p-2 rounded-full bg-w-bg-5" onClick={() => vm.methods.cancel()}>
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </div>
            <div class="flex-1 flex items-center gap-2">
              <div
                class="text-sm text-w-fg-1 whitespace-nowrap"
                onClick={(event) => {
                  if (state().selected.length === 0) {
                    return;
                  }
                  const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
                  vm.ui.$popup_selected_actions.toggle({ x, y, width, height });
                }}
              >
                已选择{state().selected.length}个动作
              </div>
              <Button store={vm.ui.$btn_submit} class="w-full">
                确定
              </Button>
            </div>
          </div>
          <div class="safe-height"></div>
        </div>
      </div>
      <Sheet ignore_safe_height store={vm.ui.$workout_action.ui.$dialog} app={props.app}>
        <WorkoutActionProfileView store={vm.ui.$workout_action} />
      </Sheet>
      <Popover store={vm.ui.$popup_selected_actions}>
        <div class="space-y-2 w-[232px]">
          <For each={state().selected}>
            {(v) => {
              return <div class="text-w-fg-0">{v.zh_name}</div>;
            }}
          </For>
        </div>
      </Popover>
    </>
  );
}
