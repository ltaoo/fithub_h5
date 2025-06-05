/**
 * @file 健身动作多选择
 */
import { $workout_action_list } from "@/store";
import {
  fetchWorkoutActionList,
  fetchWorkoutActionListProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";

export function WorkoutActionMultipleSelectViewModel(props: {
  defaultValue: { id: number | string; name: string }[];
  client: HttpClientCore;
  list?: typeof $workout_action_list;
  onChange?: (action: { id: number | string; name: string }[]) => void;
}) {
  let _selected: WorkoutActionProfile[] = [];
  let _actions: WorkoutActionProfile[] = props.list?.response.dataSource ?? [];
  let _state = {
    get value() {
      return _selected;
    },
    get selected() {
      return _selected.flatMap((item) => {
        const existing = _actions.find((a) => a.id === item.id);
        if (!existing) {
          return [];
        }
        return [existing];
      });
    },
    get actions() {
      return _actions;
    },
  };
  const request = {
    action: {
      list:
        props.list ??
        new ListCore(
          new RequestCore(fetchWorkoutActionList, { process: fetchWorkoutActionListProcess, client: props.client })
        ),
    },
  };
  const methods = {
    select(action: { id: number | string; name: string }) {
      const existing = _selected.find((item) => item.id === action.id);
      if (existing) {
        _selected = _selected.filter((item) => item.id !== action.id);
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      const v = _actions.find((item) => item.id === action.id);
      if (!v) {
        return;
      }
      _selected.push(v);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    remove(action: { id: number | string; name: string }) {
      _selected = _selected.filter((item) => item.id !== action.id);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    mapActions(actions: { id: number | string }[]) {
      return _actions.flatMap((a) => {
        return actions.find((item) => item.id === a.id) ?? [];
      });
    },
    find(value: { id: number | string }) {
      return _actions.find((a) => a.id === value.id) ?? null;
    },
    search(value: string) {
      request.action.list.search({
        keyword: value,
      });
    },
    setActions(actions: WorkoutActionProfile[]) {
      request.action.list.modifyResponse((v) => {
        return {
          ...v,
          initial: false,
          dataSource: actions,
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
        await request.action.list.loadMore();
        ui.$scroll.finishLoadingMore();
      },
    }),
  };
  enum Events {
    Change,
    ActionsLoaded,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.ActionsLoaded]: typeof _actions;
    [Events.Change]: typeof _selected;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.action.list.onStateChange((state) => {
    // console.log("[BIZ]workout_action_select - request.action.list.onStateChange");
    _actions = state.dataSource;
    bus.emit(Events.ActionsLoaded, _actions);
    bus.emit(Events.StateChange, { ..._state });
  });
  bus.on(Events.Change, (actions) => {
    if (props.onChange) {
      props.onChange(actions);
    }
  });

  return {
    shape: "custom" as const,
    type: "workout_action_select",
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
    setValue(value: { id: number | string; name: string }[]) {
      console.log("[BIZ]workout_action_select - setValue", value, _actions);
      const v = _actions.filter((a) => {
        return value.find((item) => item.id === a.id);
      });
      _selected = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    ready() {
      // request.action.list.init();
    },
    onActionsLoaded(handler: Handler<TheTypesOfEvents[Events.ActionsLoaded]>) {
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

export type WorkoutActionMultipleSelectViewModel = ReturnType<typeof WorkoutActionMultipleSelectViewModel>;
