/**
 * @file 多选选择基础实现
 */
import { base, Handler } from "@/domains/base";
import { DialogCore } from "@/domains/ui";

export function SelectViewModel<T extends { id: number }>(props: {
  defaultValue: T[];
  list: T[];
  multiple?: boolean;
  disabled?: boolean;
  onChange?: (list: T[]) => void;
}) {
  const request = {};
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    select(vv: T) {
      const existing = _selected.find((v) => v.id === vv.id);
      if (_multiple === false) {
        if (existing) {
          return;
        }
        _selected = [vv];
        bus.emit(Events.Change, _selected);
        methods.refresh();
        return;
      }
      if (existing) {
        _selected = _selected.filter((v) => v.id !== vv.id);
        bus.emit(Events.Change, _selected);
        methods.refresh();
        return;
      }
      const v = _list.find((v) => v.id === vv.id);
      if (!v) {
        return;
      }
      _selected.push(v);
      bus.emit(Events.Change, _selected);
      methods.refresh();
    },
    remove(vv: T) {
      _selected = _selected.filter((v) => v.id !== vv.id);
      bus.emit(Events.Change, _selected);
      methods.refresh();
    },
    setOptions(options: T[]) {
      _list = options;
      methods.refresh();
    },
    clear() {
      _selected = [];
      bus.emit(Events.Change, _selected);
      methods.refresh();
    },
    mapListWithIds(ids: number[]): T[] {
      return _list.filter((v) => {
        return ids.includes(v.id);
      });
    },
    findWithId(id: number) {
      return _list.find((v) => v.id === id) ?? null;
    },
  };
  const ui = {
    $dialog: new DialogCore(),
  };

  let _multiple = props.multiple ?? true;
  let _disabled = props.disabled ?? true;
  let _selected: T[] = props.defaultValue ?? [];
  let _list: T[] = props.list ?? [];
  let _state = {
    get value() {
      return _selected;
    },
    get disabled() {
      return _disabled;
    },
    get selected() {
      return _selected.flatMap((item) => {
        const existing = _list.find((a) => a.id === item.id);
        if (!existing) {
          return [];
        }
        return [existing];
      });
    },
    get list() {
      return _list.map((v) => {
        return {
          ...v,
          selected: _state.selected
            .map((v2) => {
              return v2.id;
            })
            .includes(v.id),
        };
      });
    },
  };
  enum Events {
    Change,
    ActionsLoaded,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.ActionsLoaded]: typeof _list;
    [Events.Change]: typeof _selected;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  bus.on(Events.Change, (actions) => {
    if (props.onChange) {
      props.onChange(actions);
    }
  });

  return {
    shape: "custom" as const,
    type: "select_base",
    state: _state,
    methods,
    request,
    ui,
    get value() {
      return _selected;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    setValue(value: T[]) {
      const v = _list.filter((a) => {
        return value.find((v) => v.id === a.id);
      });
      _selected = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    select: methods.select,
    clear: methods.clear,
    setOptions: methods.setOptions,
    ready() {},
    onListLoaded(handler: Handler<TheTypesOfEvents[Events.ActionsLoaded]>) {
      return bus.on(Events.ActionsLoaded, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SelectViewModel = ReturnType<typeof SelectViewModel>;
