import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PlayerCore } from "@/domains/player";
import { ButtonCore, InputCore } from "@/domains/ui";

export function VideoURLInputModel(props: { app: ViewComponentProps["app"]; onError?: (e: BizError) => void }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    preview() {
      const url = ui.$input.value;
      if (!url) {
        bus.emit(Events.Error, new BizError(["请输入视频链接"]));
        return;
      }
      _preview = true;
      methods.refresh();
      setTimeout(() => {
        ui.$video.load(url);
      }, 200);
    },
  };
  const ui = {
    $input: new InputCore({ defaultValue: "" }),
    $btn_preview: new ButtonCore({
      onClick() {
        methods.preview();
      },
    }),
    $video: new PlayerCore({ app: props.app }),
  };

  let _preview = false;
  let _state = {
    get value() {
      return ui.$input.value;
    },
    get defaultValue() {
      return ui.$input.defaultValue;
    },
    get preview() {
      return _preview;
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

  ui.$video.onError((err) => {
    bus.emit(Events.Error, new BizError([err.message]));
  });

  if (props.onError) {
    bus.on(Events.Error, props.onError);
  }

  return {
    shape: "input" as const,
    methods,
    ui,
    state: _state,
    get value() {
      return _state.value;
    },
    get defaultValue() {
      return _state.defaultValue;
    },
    setValue(...args: Parameters<typeof ui.$input.setValue>) {
      return ui.$input.setValue(...args);
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(...args: Parameters<typeof ui.$input.onChange>) {
      return ui.$input.onChange(...args);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export type VideoURLInputModel = ReturnType<typeof VideoURLInputModel>;
