/**
 * @file 通用多选选择
 */
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { ButtonCore, DialogCore, InputCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { SelectViewModel } from "@/biz/select_base";
import { TheItemTypeFromListCore } from "@/domains/list/typing";

export function GiftCardSelectViewModel<T extends ListCore<any>>(props: {
  defaultValue: T[];
  multiple?: boolean;
  list: T;
  onChange?: (list: T[]) => void;
}) {
  type TheItemInterface = TheItemTypeFromListCore<typeof props.list>;
  const request = {
    data: {
      list: props.list,
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    mapListWithId(...args: Parameters<typeof ui.$select.methods.mapListWithIds>) {
      return ui.$select.methods.mapListWithIds(...args);
    },
    findWithId(...args: Parameters<typeof ui.$select.methods.findWithId>) {
      return ui.$select.methods.findWithId(...args);
    },
    search(value: string) {
      request.data.list.search({
        keyword: value,
      });
    },
  };
  const ui = {
    $select: SelectViewModel<TheItemInterface>({
      defaultValue: props.defaultValue,
      list: [],
      multiple: props.multiple,
    }),
    $dialog: new DialogCore(),
    $scroll: new ScrollViewCore({
      async onReachBottom() {
        await request.data.list.loadMore();
        ui.$scroll.finishLoadingMore();
      },
    }),
  };

  let _state = {
    get value() {
      return ui.$select.state.value;
    },
    get selected() {
      return ui.$select.state.selected;
    },
    get list() {
      return ui.$select.state.list;
    },
    get response() {
      return request.data.list.response;
    },
  };
  enum Events {
    Change,
    RequestLoaded,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.RequestLoaded]: TheItemInterface[];
    [Events.Change]: TheItemInterface;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.data.list.onStateChange((state) => {
    ui.$select.methods.setOptions(state.dataSource);
    bus.emit(Events.StateChange, { ..._state });
  });
  ui.$select.onStateChange(() => methods.refresh());
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
      return ui.$select.value;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    ready() {},
    setValue: ui.$select.setValue,
    select: ui.$select.select,
    init() {
      request.data.list.init();
    },
    onListLoaded(handler: Handler<TheTypesOfEvents[Events.RequestLoaded]>) {
      return bus.on(Events.RequestLoaded, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type GiftCardSelectViewModel = ReturnType<typeof GiftCardSelectViewModel>;
