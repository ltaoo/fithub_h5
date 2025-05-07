import { fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { PopoverCore, SelectCore } from "@/domains/ui";

export function EquipmentSelectViewModel(props: {
  defaultValue: { id: number | string }[];
  disabled?: boolean;
  client: HttpClientCore;
}) {
  let _disabled = props.disabled ?? false;
  let _selected: { id: number | string }[] = [];
  let _equipments: TheResponseOfRequestCore<typeof request.equipment.list>["list"] = [];
  let _state = {
    get value() {
      return _selected.flatMap((item) => {
        const matched = _equipments.find((e) => e.id === item.id);
        if (!matched) {
          return [];
        }
        return [matched];
      });
    },
    get equipments() {
      return _equipments;
    },
    get disabled() {
      return _disabled;
    },
  };
  const request = {
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
  };
  const methods = {
    select(equipment: { id: number | string }) {
      const existing = _selected.find((item) => item.id === equipment.id);
      if (existing) {
        _selected = _selected.filter((item) => item.id !== equipment.id);
      } else {
        _selected.push(equipment);
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    remove(equipment: { id: number | string }) {
      _selected = _selected.filter((item) => item.id !== equipment.id);
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
  request.equipment.list.onStateChange((state) => {
    console.log("[BIZ]equipment_select - request.equipment.list.onStateChange", state.response);
    if (!state.response) {
      return;
    }
    _equipments = state.response.list;
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    shape: "custom" as const,
    type: "equipment_select",
    state: _state,
    methods,
    ui,
    get value() {
      return _selected.flatMap((item) => {
        const matched = _equipments.find((e) => e.id === item.id);
        if (!matched) {
          return [];
        }
        return [matched];
      });
    },
    get defaultValue() {
      return props.defaultValue;
    },
    setValue(value: { id: number | string }[]) {
      _selected = value;
    },
    ready() {
      request.equipment.list.run({});
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type EquipmentSelectViewModel = ReturnType<typeof EquipmentSelectViewModel>;
