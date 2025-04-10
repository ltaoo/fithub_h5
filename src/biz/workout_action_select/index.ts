/**
 * @file 健身动作单选择
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

export function WorkoutActionSelectViewModel(props: {
  defaultValue: { id: number | string; zh_name: string } | null;
  client: HttpClientCore;
  list?: typeof $workout_action_list;
  onCreate?: (vm: WorkoutActionSelectViewModel) => void;
  onChange?: (action: null | WorkoutActionProfile) => void;
}) {
  let _loading = true;
  let _selected: { id: number | string; zh_name: string } | null = (() => {
    if (props.defaultValue === null) {
      return null;
    }
    if (props.list) {
      const m = props.list.response.dataSource.find((a) => a.id === props.defaultValue?.id);
      if (m) {
        return m;
      }
    }
    return props.defaultValue;
  })();
  let _actions: WorkoutActionProfile[] = props.list?.response.dataSource ?? [];
  let _extra_actions: WorkoutActionProfile[] = [];
  let _state = {
    get loading() {
      return _loading;
    },
    get value() {
      return _selected;
    },
    get selected() {
      return _selected;
    },
    get actions() {
      return [..._actions, ..._extra_actions];
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
    select(action: { id: number | string; zh_name: string }, extra: Partial<{ silence: boolean }> = {}) {
      console.log("[BIZ]workout_action_select2 - select", action);
      // methods.refreshActions();
      ui.$popover.hide();
      const v = _actions.find((a) => a.id === action.id);
      _selected = action;
      if (v) {
        _selected = v;
      }
      if (extra.silence) {
        return;
      }
      const existing = _extra_actions.find((a) => a.id === action.id);
      if (!existing && v) {
        _extra_actions.push(v);
      }
      bus.emit(Events.Change, v);
      bus.emit(Events.StateChange, { ..._state });
    },
    unselect() {
      _selected = null;
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    setActions(actions: WorkoutActionProfile[]) {
      console.log("[BIZ]workout_action_select - setActions 1", _selected);
      _actions = actions;
      _loading = false;
      console.log("[BIZ]workout_action_select - setActions", actions, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    find(value: { id: number | string }) {
      return _actions.find((a) => a.id === value.id) ?? null;
    },
    clear() {
      _selected = null;
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
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: WorkoutActionProfile | null;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.action.list.onStateChange((state) => {
    // console.log("[BIZ]workout_action_select - request.action.list.onStateChange");
    const v = [...state.dataSource];
    _actions = v;
    if (_selected !== null) {
      if (!_selected.zh_name) {
        _selected = {
          id: _selected.id,
          zh_name: v.find((a) => a.id === _selected?.id)?.zh_name ?? "",
        };
      }
    }
    bus.emit(Events.StateChange, { ..._state });
  });
  bus.on(Events.Change, (action) => {
    if (props.onChange) {
      props.onChange(action);
    }
  });

  const vm = {
    shape: "custom" as const,
    type: "workout_action_select2",
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
    setValue(value: { id: number | string; zh_name: string } | null, extra: Partial<{ silence: boolean }> = {}) {
      console.log("[BIZ]workout_action_select - setValue", value, _actions);
      if (value === null) {
        bus.emit(Events.Change, null);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      // methods.select(value, { silence: extra.silence ?? true });
      methods.select(value, { silence: false });
    },
    ready() {
      // request.action.list.init();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };

  if (props.onCreate) {
    props.onCreate(vm);
  }

  return vm;
}

export type WorkoutActionSelectViewModel = ReturnType<typeof WorkoutActionSelectViewModel>;
