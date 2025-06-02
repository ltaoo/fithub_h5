import { For, JSX } from "solid-js";
import { ChevronDown, Plus, X } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui";

import { WorkoutPlanTagSelectViewModel } from "@/biz/workout_plan_tag_select";

export function WorkoutPlanTagSelectView(
  props: { store: WorkoutPlanTagSelectViewModel } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div
        classList={{
          "py-2 ": true,
          [props.class || ""]: true,
        }}
        onClick={() => {
          vm.methods.showDialog();
        }}
      >
        <div class="flex flex-wrap gap-2">
          <For each={state().value}>
            {(text) => {
              return (
                <div
                  classList={{
                    "px-4 py-1 border-2 border-w-bg-5 rounded-full text-sm text-w-fg-1": true,
                  }}
                >
                  <div>{text}</div>
                </div>
              );
            }}
          </For>
          <div
            classList={{
              "flex items-center gap-1": true,
              "px-4 py-1 border-2 border-w-bg-5 rounded-full text-sm text-w-fg-1": true,
            }}
          >
            <Plus class="w-4 h-4" />
            <div>点击选择标签</div>
          </div>
        </div>
      </div>
      <Sheet store={vm.ui.$dialog} position="bottom" size="lg">
        <div class="w-screen bg-w-bg-0">
          <div class="flex justify-between p-2">
            <div></div>
            <div
              class="flex items-center justify-center p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.ui.$dialog.hide();
              }}
            >
              <X class="w-4 h-4 text-w-fg-1" />
            </div>
          </div>
          <div class="p-2 space-y-4">
            <For each={state().tagGroups}>
              {(group) => {
                return (
                  <div class="border-2 border-w-bg-5 rounded-lg">
                    <div class="p-2 border-b-2 border-w-bg-5 text-w-fg-1">{group.title}</div>
                    <div class="flex flex-wrap gap-2 p-2">
                      <For each={group.options}>
                        {(opt) => {
                          return (
                            <div
                              classList={{
                                "px-4 py-1 border-2 rounded-full text-sm text-w-fg-1": true,
                                "border-w-bg-5": !opt.selected,
                                "border-w-fg-2 bg-w-g-5": opt.selected,
                              }}
                              onClick={() => {
                                vm.methods.select(opt.value);
                              }}
                            >
                              <div>{opt.label}</div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="flex items-center gap-2 p-2 bg-w-bg-1 border-t-2 border-w-bg-5">
            <div class="w-[40px] p-2 rounded-full bg-w-bg-5" onClick={() => vm.methods.cancel()}>
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </div>
            <div class="flex-1 flex items-center gap-2">
              <Button store={vm.ui.$btn_submit} class="w-full">
                确定
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
