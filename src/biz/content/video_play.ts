import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PlayerCore } from "@/domains/player";
import { DialogCore, DropdownMenuCore, MenuItemCore } from "@/domains/ui";
import { sleep } from "@/utils";

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
    $dialog_outer: new DialogCore({
      onCancel() {
        ui.$video.pause();
      },
    }),
    // $dialog_points: new DialogCore({
    //   open: true,
    // }),
    $dropdown_menu: new DropdownMenuCore({}),
  };

  let _points = props.points;
  let _time = 0;
  let _state = {
    get points() {
      return _points;
    },
    get time() {
      return _time;
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

  ui.$video.onCanPlay(() => {
    ui.$video.play();
  });
  ui.$video.onStateChange(() => methods.refresh());
  ui.$dropdown_menu.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    app: props.app,
    play(url: string) {
      ui.$dialog_outer.show();
      // ui.$dropdown_menu.toggle({
      //   // 这两个值是手动触发后查看得到的
      //   x: 596,
      //   y: 16,
      // });
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
    async playWithTime(time: number, opt: Partial<{ delay: boolean }> = {}) {
      _time = time;
      methods.refresh();
      ui.$video.setCurrentTime(time);
      if (opt.delay) {
        await sleep(800);
      }
      ui.$video.play();
    },
    replay() {
      ui.$video.setCurrentTime(_time);
      ui.$video.play();
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
