import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PlayerCore } from "@/domains/player";
import { ButtonCore, InputCore } from "@/domains/ui";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";

export function WorkoutActionInputModel(props: {
  // idx?: number;
  $select: WorkoutActionSelectViewModel;
  onError?: (e: BizError) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $btn_preview: new ButtonCore({
      onClick() {},
    }),
    $select: props.$select,
  };

  let _value: typeof ui.$select.value = [];
  let _state = {
    get value() {
      // return ui.$select.value;
      return _value;
    },
    get defaultValue() {
      return ui.$select.defaultValue;
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

  // ui.$select.onStateChange(() => methods.refresh());
  // 多个 input 共享了同一个 $select，导致同时覆盖了
  // ui.$select.onOk(() => {
  //   const v = ui.$select.value;
  //   if (v.length === 0) {
  //     bus.emit(Events.Error, new BizError(["请选择动作"]));
  //     return;
  //   }
  //   _value = v;
  //   methods.refresh();
  //   ui.$select.ui.$dialog.hide();
  // });

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
    setValue(...args: Parameters<typeof ui.$select.setValue>) {
      // console.log("[BIZ]input_workout_action - setValue", ...args);
      _value = args[0];
      methods.refresh();
      return ui.$select.setValue(...args);
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(...args: Parameters<typeof ui.$select.onChange>) {
      return ui.$select.onChange(...args);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export type WorkoutActionInputModel = ReturnType<typeof WorkoutActionInputModel>;
