/**
 * @file 通用多选选择
 */
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { ButtonCore, DialogCore, InputCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

type StudentId = number | string;
type TheStudent = {
  id: StudentId;
  nickname: string;
  avatar_url?: string;
};

export function StudentSelectViewModel(props: {
  defaultValue: TheStudent[];
  multiple?: boolean;
  list: ListCore<any>;
  onChange?: (list: TheStudent[]) => void;
}) {
  const request = {
    data: {
      list: props.list,
    },
  };
  const methods = {
    select(vv: TheStudent) {
      const existing = _selected.find((v) => v.id === vv.id);
      if (_multiple === false) {
        if (existing) {
          return;
        }
        _selected = [vv];
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      if (existing) {
        _selected = _selected.filter((v) => v.id !== vv.id);
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      const v = _list.find((v) => v.id === vv.id);
      if (!v) {
        return;
      }
      _selected.push(v);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    remove(vv: TheStudent) {
      _selected = _selected.filter((v) => v.id !== vv.id);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    map_list(list: { id: StudentId }[]) {
      return _list.flatMap((a) => {
        return list.find((v) => v.id === a.id) ?? [];
      });
    },
    find(value: { id: StudentId }) {
      return _list.find((a) => a.id === value.id) ?? null;
    },
    search(value: string) {
      request.data.list.search({
        keyword: value,
      });
    },
    set_list(list: TheStudent[]) {
      // @ts-ignore
      request.data.list.modifyResponse((v) => {
        return {
          ...v,
          initial: false,
          dataSource: list,
        };
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    clear() {
      _selected = [];
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {
    $dropdown: new SelectCore({
      defaultValue: "",
      options: [],
    }),
    $popover: new PopoverCore(),
    $scroll: new ScrollViewCore({
      async onReachBottom() {
        await request.data.list.loadMore();
        ui.$scroll.finishLoadingMore();
      },
    }),
    $dialog: new DialogCore(),
    $input_keyword: new InputCore({ defaultValue: "" }),
    $btn_search: new ButtonCore({}),
  };

  let _multiple = props.multiple ?? true;
  let _selected: TheStudent[] = [];
  let _list: TheStudent[] = props.list?.response.dataSource ?? [];
  let _state = {
    get value() {
      return _selected;
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
    get response() {
      return request.data.list.response;
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

  request.data.list.onStateChange((state) => {
    _list = state.dataSource;
    bus.emit(Events.ActionsLoaded, _list);
    bus.emit(Events.StateChange, { ..._state });
  });
  bus.on(Events.Change, (actions) => {
    if (props.onChange) {
      props.onChange(actions);
    }
  });

  return {
    shape: "custom" as const,
    type: "multiple-select",
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
    setValue(value: TheStudent[]) {
      const v = _list.filter((a) => {
        return value.find((v) => v.id === a.id);
      });
      _selected = v;
      bus.emit(Events.StateChange, { ..._state });
    },
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

export type StudentSelectViewModel = ReturnType<typeof StudentSelectViewModel>;
