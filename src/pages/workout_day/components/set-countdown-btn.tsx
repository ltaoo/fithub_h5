/**
 * @file 如果是 HIIT 计时
 */
import { Show } from "solid-js";
import { Play, Pause, Check, Circle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { InputCore } from "@/domains/ui";

import { SetActionCountdownViewModel } from "./set-action-countdown";

export function SetActionCountdownBtn(props: {
  store: SetActionCountdownViewModel;
  onClick?: (event: { x: number; y: number; finished: boolean }) => void;
}) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div class="overflow-hidden relative flex items-center gap-2">
      <div
        class="flex items-center justify-center p-2 rounded-full bg-w-bg-5"
        onClick={(event) => {
          const { x, y } = event;
          if (props.onClick) {
            props.onClick({ x, y, finished: vm.state.running });
          }
          if (vm.state.running) {
            vm.pause();
            return;
          }
          vm.start();
        }}
      >
        <Show
          when={state().running}
          fallback={
            <div class="text-gray-400">
              <Play class="w-4 h-4" />
            </div>
          }
        >
          <div class="text-gray-400">
            <Pause class="w-4 h-4" />
          </div>
        </Show>
      </div>
    </div>
  );
}
