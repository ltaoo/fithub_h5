import { For, Show } from "solid-js";
import { ChevronDown, MoreHorizontal, Reply, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";
import { DropdownMenu, Video } from "@/components/ui";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PlayerCore } from "@/domains/player";
import { DialogCore, DropdownMenuCore, MenuItemCore } from "@/domains/ui";
import { VideoWithPointsModel } from "@/biz/content/video_play";

export function WorkoutPlanVideoPlayView(props: { store: VideoWithPointsModel; onClose?: () => void }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="relative h-screen bg-w-bg-0">
        <div class="flex items-center h-full">
          <Video store={vm.ui.$video} />
        </div>
        <div class="z-[99] absolute right-4 top-4">
          <div class="flex gap-2">
            <Show when={state().points.length}>
              <IconButton
                onClick={(event) => {
                  const { x, y } = event.currentTarget.getBoundingClientRect();
                  vm.ui.$dropdown_menu.toggle({ x, y });
                  // vm.ui.$dialog_points.show();
                }}
              >
                <div class="px-2 text-w-fg-0">动作列表</div>
              </IconButton>
            </Show>
            <Show when={state().time}>
              <IconButton
                onClick={(event) => {
                  vm.replay();
                }}
              >
                <Reply class="w-6 h-6 text-w-fg-0" />
              </IconButton>
            </Show>
            <IconButton
              onClick={() => {
                vm.ui.$video.pause();
                vm.ui.$dialog_outer.hide({ destroy: false });
              }}
            >
              <X class="w-6 h-6 text-w-fg-0" />
            </IconButton>
          </div>
        </div>
      </div>
      <DropdownMenu store={vm.ui.$dropdown_menu} />
    </>
  );
}
