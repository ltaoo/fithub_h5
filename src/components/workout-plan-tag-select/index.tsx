import { For, JSX } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";

import { WorkoutPlanTagSelectViewModel } from "@/biz/workout_plan_tag_select";
import { MultipleSelectionCore } from "@/domains/multiple";
import { X } from "lucide-solid";

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
          vm.ui.$dialog.show();
        }}
      >
        <div class="flex flex-wrap gap-2">
          <For
            each={state().value}
            fallback={
              <div class="">
                <div class="text-center text-w-fg-1">点击选择标签</div>
              </div>
            }
          >
            {(text) => {
              return (
                <div>
                  <div class="px-2 py-1 border rounded-full text-sm">{text}</div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
      <Sheet store={vm.ui.$dialog} position="bottom" size="lg">
        <div class="w-screen p-2 bg-w-bg-1">
          <div class="flex justify-between">
            <div></div>
            <div
              class="flex items-center justify-center p-2 rounded-full bg-gray-200"
              onClick={() => {
                vm.ui.$dialog.hide();
              }}
            >
              <X class="w-6 h-6 text-gray-800" />
            </div>
          </div>
          <div class="space-y-4">
            <For each={state().tagGroups}>
              {(group) => {
                return (
                  <div>
                    <div>{group.title}</div>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <For each={group.options}>
                        {(opt) => {
                          return (
                            <div
                              classList={{
                                "px-2 py-1 border rounded-full text-sm": true,
                                "border-green-500": opt.selected,
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
        </div>
      </Sheet>
    </>
  );
}
