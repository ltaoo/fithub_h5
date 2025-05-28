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
        class="flex items-center justify-center px-4 h-10 rounded-full border border-gray-300 bg-white"
        onClick={(event) => {
          const { x, y } = event;
          if (props.onClick) {
            props.onClick({ x, y, finished: vm.state.running });
          }
          if (vm.state.running) {
            vm.stop();
            return;
          }
          vm.start();
        }}
      >
        <Show
          when={state().running}
          fallback={
            <div class="text-gray-400">
              <Play size={16} />
            </div>
          }
        >
          <div class="text-gray-400">
            <Pause size={16} />
          </div>
        </Show>
      </div>
    </div>
  );
}
