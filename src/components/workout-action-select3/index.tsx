/**
 * @file 动作多选面板
 */
import { For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { Check } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";
import { Button, Dialog, Input, ListView, ScrollView } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { useViewModelStore } from "@/hooks";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { cn } from "@/utils/index";

export function WorkoutActionSelect3View(props: { store: WorkoutActionSelectDialogViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="">
      <div class="z-10 fixed inset-0 bg-w-bg-0 opacity-40"></div>
      <div class="z-50 relative w-screen">
        <div class="flex flex-col bg-w-bg-0 border-t-2 border-w-bg-5" style={{ height: "100vh" }}>
          <div class="flex gap-2 py-3 px-4 h-[62px]">
            <div class="w-[240px]">
              <Select store={vm.ui.$input_type_select} />
            </div>
            <Input store={vm.ui.$input_keyword} />
            <Button store={vm.ui.$btn_submit}>搜索</Button>
            {/* <Button variant="subtle" store={vm.ui.$search_reset_btn}>
            重置
          </Button> */}
          </div>
          <div class="flex-1 flex h-0 border-t">
            <div class="w-[90px] h-full pt-2 px-2 overflow-y-auto border-r-2 border-w-bg-5">
              <For each={state().tags}>
                {(tag) => {
                  return (
                    <div
                      classList={{
                        "py-2 rounded-md text-center text-w-fg-2": true,
                        "bg-w-bg-3": tag.selected,
                      }}
                      onClick={() => {
                        vm.methods.handleClickTag(tag);
                      }}
                    >
                      <div class="text-center">{tag.text}</div>
                    </div>
                  );
                }}
              </For>
            </div>
            <ScrollView store={vm.ui.$view} class="flex-1 h-full overflow-y-auto">
              <ListView store={vm.request.action.list}>
                <div class="grid grid-cols-3 gap-2 p-2">
                  <For each={state().actions}>
                    {(action) => {
                      return (
                        <div
                          classList={{
                            "p-2 flex justify-between border-2 border-w-bg-5 rounded-md text-w-fg-1": true,
                            "border-green-500 bg-green-100": !!state().value.find((act) => act.id === action.id),
                            "text-gray-100": !!state().disabled.includes(action.id),
                          }}
                          onClick={() => {
                            vm.methods.select(action);
                          }}
                        >
                          <div>
                            <div class="text-sm">{action.zh_name}</div>
                            {/* <div class="text-sm">{action.name}</div> */}
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </ListView>
            </ScrollView>
          </div>
          <div class="h-[88px] bg-w-bg-0 border-t-2 border-w-bg-5">
            <div class="flex items-center gap-2 p-4">
              <div
                classList={{
                  "flex items-center justify-center flex-1 py-4 rounded-md ": true,
                  "bg-w-bg-5 text-w-fg-1": !state().selected.length,
                  "bg-blue-500 text-white": !!state().selected.length,
                }}
                onClick={() => {
                  vm.handleOk();
                }}
              >
                <div class="">确定</div>
              </div>
              <div
                classList={{
                  "flex items-center justify-center w-[88px] py-4 rounded-md bg-w-bg-5 text-w-fg-1": true,
                }}
                onClick={() => {
                  vm.ui.$dialog.hide();
                }}
              >
                <div class="">取消</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div class="z-50 absolute bottom-0 w-full bg-white"></div> */}
    </div>
  );
}
