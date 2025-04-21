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
      <div class="z-10 fixed inset-0 bg-black opacity-40"></div>
      <div class="z-50 relative w-screen">
        <div class="flex flex-col bg-white border-t" style={{ height: "100vh" }}>
          <div class="flex gap-2 py-3 px-4 h-[62px]">
            <div class="w-[240px]">
              <Select store={vm.ui.$search_type_select} />
            </div>
            <Input store={vm.ui.$search_input} />
            <Button class="w-20" store={vm.ui.$search_submit_btn}>
              搜索
            </Button>
            {/* <Button variant="subtle" store={vm.ui.$search_reset_btn}>
            重置
          </Button> */}
          </div>
          <div class="flex-1 flex h-0 border-t">
            <div class="w-[90px] h-full overflow-y-auto border-r">
              <For
                each={[
                  "胸",
                  "背",
                  "腿",
                  "肩",
                  "手臂",
                  "卧推",
                  "肩推",
                  "划船",
                  "引体",
                  "蹲",
                  "弓步",
                  "前平举",
                  "侧平举",
                  "臂屈伸",
                  "弯举",
                  "腿屈伸",
                  "腿弯举",
                ]}
              >
                {(tag) => {
                  return <div class="px-4 py-2 text-center">{tag}</div>;
                }}
              </For>
            </div>
            <ScrollView store={vm.ui.$view} class="flex-1 h-full overflow-y-auto">
              <ListView store={vm.request.action.list} class="grid grid-cols-3 gap-2 p-2">
                <For each={state().actions}>
                  {(action) => {
                    return (
                      <div
                        classList={{
                          "p-2 flex justify-between border border-gray-200 rounded-md": true,
                          "border-green-500 bg-green-100": !!state().value.find((act) => act.id === action.id),
                          "text-gray-100": !!state().disabled.includes(action.id),
                        }}
                        onClick={() => {
                          vm.methods.select(action);
                        }}
                      >
                        <div>
                          <div class="">{action.zh_name}</div>
                          {/* <div class="text-sm">{action.name}</div> */}
                        </div>
                      </div>
                    );
                  }}
                </For>
              </ListView>
            </ScrollView>
          </div>
          <div class="h-[88px] bg-white border-t">
            <div class="flex items-center gap-2 p-4">
              <div
                classList={{
                  "flex items-center justify-center flex-1 py-4 rounded-md bg-gray-300 text-gray-500": true,
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
                  "flex items-center justify-center w-[88px] py-4 rounded-md bg-gray-300 text-gray-500": true,
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
      <div class="z-50 absolute bottom-0 w-full bg-white"></div>
    </div>
  );
}
