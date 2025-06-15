import { For } from "solid-js";
import { ChevronDown, MoreHorizontal, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";
import { DropdownMenu, Video } from "@/components/ui";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PlayerCore } from "@/domains/player";
import { DialogCore, DropdownMenuCore, MenuItemCore } from "@/domains/ui";

type VideoTimePoint = {
  time: number;
  time_text: string;
  text: string;
};
export function VideoWithPointsModel(props: { points: VideoTimePoint[]; app: ViewComponentProps["app"] }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickPoint(v: VideoTimePoint) {
      // ui.$dialog_points.hide();
      ui.$dropdown_menu.hide();
      ui.$video.setCurrentTime(v.time);
      ui.$video.play();
    },
  };
  const ui = {
    $video: new PlayerCore({ app: props.app }),
    $dialog_outer: new DialogCore({}),
    // $dialog_points: new DialogCore({
    //   open: true,
    // }),
    $dropdown_menu: new DropdownMenuCore({}),
  };

  let _points = props.points;
  let _state = {
    get points() {
      return _points;
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

  ui.$video.onStateChange(() => methods.refresh());
  ui.$dropdown_menu.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    app: props.app,
    play(url: string) {
      ui.$dialog_outer.show();
      ui.$dropdown_menu.toggle({
        // 这两个值是手动触发后查看得到的
        x: 596,
        y: 16,
      });
      if (ui.$video.url === url && ui.$video.paused) {
        ui.$video.play();
      }
      if (ui.$video.url !== url && ui.$video._mounted) {
        ui.$video.load(url);
      }
    },
    load(url: string) {
      ui.$video.load(url);
    },
    setPoints(v: VideoTimePoint[]) {
      _points = v;
      ui.$dropdown_menu.setItems(
        _points.map((v) => {
          return new MenuItemCore({
            label: v.text,
            onClick() {
              methods.handleClickPoint(v);
            },
          });
        })
      );
      methods.refresh();
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type VideoWithPointsModel = ReturnType<typeof VideoWithPointsModel>;

export function WorkoutPlanVideoPlayView(props: { store: VideoWithPointsModel; onClose?: () => void }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="relative h-screen">
        <div class="flex items-center h-full">
          <Video store={vm.ui.$video} />
        </div>
        <div class="z-[99] absolute right-4 top-4">
          <div class="flex gap-2">
            <IconButton
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$dropdown_menu.toggle({ x, y });
                // vm.ui.$dialog_points.show();
              }}
            >
              <div class="px-2 text-w-fg-0">动作列表</div>
            </IconButton>
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
        {/* <div class="z-[99] absolute right-4 bottom-4">
          
          <div class="safe-height safe-height--no-color"></div>
        </div> */}
      </div>
      {/* <Sheet store={vm.ui.$dialog_points} app={vm.app} plus_idx={10}>
        <div class="p-4 min-h-[360px] space-y-2">
          <For each={state().points}>
            {(v) => {
              return (
                <div
                  class="flex items-center gap-2"
                  onClick={() => {
                    vm.methods.handleClickPoint(v);
                  }}
                >
                  <div class="text-w-fg-0">{v.text}</div>
                  <div class="text-blue-500 underline">{v.time_text}</div>
                </div>
              );
            }}
          </For>
        </div>
        <div>
          <div class="flex items-center gap-2 p-2 bg-w-bg-1 border-t border-w-fg-3">
            <div
              class="w-[40px] p-2 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.ui.$dialog_points.hide();
              }}
            >
              <ChevronDown class="w-6 h-6 text-w-fg-0" />
            </div>
            <div class="flex-1 flex items-center gap-2"></div>
          </div>
          <div class="safe-height"></div>
        </div>
      </Sheet> */}
      <DropdownMenu store={vm.ui.$dropdown_menu} />
    </>
  );
}
