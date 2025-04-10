import { fetchMuscleList, fetchMuscleListProcess, MuscleProfile } from "@/biz/muscle/services";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { PopoverCore, SelectCore } from "@/domains/ui";

export function MuscleSelectViewModel(props: {
  defaultValue: { id: number | string }[];
  disabled?: boolean;
  client: HttpClientCore;
  onLoaded?: (muscles: MuscleProfile[]) => void;
}) {
  let _disabled = props.disabled ?? false;
  let _selected: { id: number | string }[] = [];
  let _muscles: TheResponseOfRequestCore<typeof request.muscle.list>["list"] = [];
  let _state = {
    get value() {
      return _selected.flatMap((item) => {
        const matched = _muscles.find((m) => m.id === item.id);
        if (!matched) {
          return [];
        }
        return [matched];
      });
    },
    get muscles() {
      return _muscles;
    },
    get disabled() {
      return _disabled;
    },
  };
  const request = {
    muscle: {
      list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
    },
  };
  const methods = {
    select(muscle: { id: number | string }) {
      const existing = _selected.find((item) => item.id === muscle.id);
      if (existing) {
        _selected = _selected.filter((item) => item.id !== muscle.id);
      } else {
        _selected.push(muscle);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    remove(muscle: { id: number | string }) {
      _selected = _selected.filter((item) => item.id !== muscle.id);
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $dropdown: new SelectCore({
      defaultValue: "",
      options: [],
    }),
    $popover: new PopoverCore(),
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _selected;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.muscle.list.onSuccess((muscles) => {
    props.onLoaded?.(muscles.list);
  });
  request.muscle.list.onStateChange((state) => {
    console.log("[BIZ]muscle_select - request.muscle.list.onStateChange", state.response);
    if (!state.response) {
      return;
    }
    _muscles = state.response.list;
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    shape: "custom" as const,
    type: "muscle_select",
    state: _state,
    methods,
    ui,
    get value() {
      return _selected;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    setValue(value: { id: number | string }[]) {
      _selected = value;
    },
    ready() {
      request.muscle.list.run();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type MuscleSelectViewModel = ReturnType<typeof MuscleSelectViewModel>;
