/**
 * @file 健身动作单选择
 */
import { $workout_action_list } from "@/store";
import {
  fetchWorkoutActionList,
  fetchWorkoutActionListProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import { WorkoutActionType, WorkoutActionTypeOptions } from "@/biz/workout_action/constants";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DialogCore, InputCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { BizError } from "@/domains/error";

export function WorkoutActionSelectDialogViewModel(props: {
  defaultValue: { id: number | string; zh_name: string }[];
  client: HttpClientCore;
  list?: typeof $workout_action_list;
  onChange?: (action: WorkoutActionProfile[]) => void;
  onOk?: (actions: { id: number | string; zh_name: string }[]) => void;
  onError?: (error: BizError) => void;
}) {
  let _loading = true;
  let _selected: { id: number | string; zh_name: string }[] = (() => {
    return props.defaultValue;
  })();
  let _disabled: (number | string)[] = [];
  let _mode = "multiple" as "multiple" | "single";
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
    get disabled() {
      return _disabled;
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
      const disabled = _disabled.includes(action.id);
      if (disabled) {
        return;
      }
      const existing = _selected.find((item) => item.id === action.id);
      if (existing) {
        _selected = _selected.filter((item) => item.id !== action.id);
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      const v = _actions.find((item) => item.id === action.id);
      if (!v) {
        props.onError?.(new BizError("健身动作不存在"));
        return;
      }
      if (_mode === "multiple") {
        _selected.push(v);
      }
      if (_mode === "single") {
        _selected = [v];
      }
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    unselect(action: { id: number | string }) {
      _selected = _selected.filter((item) => item.id !== action.id);
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
    setDisabled(v: (number | string)[]) {
      _disabled = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    setMode(mode: typeof _mode) {
      _mode = mode;
    },
    find(value: { id: number | string }) {
      return _actions.find((a) => a.id === value.id) ?? null;
    },
    clear() {
      _selected = [];
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    handleOk() {
      if (_selected.length === 0) {
        props.onError?.(new BizError("请选择健身动作"));
        return;
      }
      if (props.onOk) {
        props.onOk(_selected);
      }
    },
  };
  const ui = {
    $show_btn: new ButtonCore({
      onClick() {
        ui.$dialog.show();
      },
    }),
    $search_type_select: new SelectCore({
      defaultValue: WorkoutActionType.RESISTANCE,
      options: WorkoutActionTypeOptions,
      async onChange(v) {
        const r = await request.action.list.search({
          type: v,
        });
        if (r.error) {
          bus.emit(Events.Error, r.error);
          return;
        }
        // ui.$search_type_select.hide();
      },
    }),
    $search_input: new InputCore({
      defaultValue: "",
      placeholder: "请输入关键字搜索",
      onEnter() {
        ui.$search_submit_btn.click();
      },
    }),
    $search_submit_btn: new ButtonCore({
      async onClick() {
        const v = ui.$search_input.value;
        if (!v) {
          props.onError?.(new BizError("请输入关键字搜索"));
          return;
        }
        ui.$search_submit_btn.setLoading(true);
        const r = await request.action.list.search({ keyword: v });
        ui.$search_submit_btn.setLoading(false);
        if (r.error) {
          props.onError?.(r.error);
          return;
        }
        _actions = r.data.dataSource;
        bus.emit(Events.StateChange, { ..._state });
      },
    }),
    $search_reset_btn: new ButtonCore({
      onClick() {
        request.action.list.reset();
      },
    }),
    $dialog: new DialogCore({
      onOk() {
        methods.handleOk();
      },
      onCancel() {
        _disabled = [];
      },
    }),
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.action.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _selected;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();
  request.action.list.onStateChange((state) => {
    // console.log("[BIZ]workout_action_select - request.action.list.onStateChange");
    const v = [...state.dataSource];
    _actions = v;
    bus.emit(Events.StateChange, { ..._state });
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
    setValue(value: { id: number | string; zh_name: string }[], extra: Partial<{ silence: boolean }> = {}) {
      console.log("[BIZ]workout_action_select - setValue", value, _actions);
      if (value.length === 0) {
        bus.emit(Events.Change, []);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      _selected = value;
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    clear() {
      _selected = [];
      bus.emit(Events.Change, []);
    },
    handleOk: methods.handleOk,
    ready() {
      // request.action.list.init();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };

  return vm;
}

export type WorkoutActionSelectDialogViewModel = ReturnType<typeof WorkoutActionSelectDialogViewModel>;
