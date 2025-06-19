/**
 * @file 健身动作选择
 */
import { $workout_action_list } from "@/store";
import { ViewComponentProps } from "@/store/types";
import {
  fetchWorkoutActionList,
  fetchWorkoutActionListProcess,
  WorkoutActionProfile,
} from "@/biz/workout_action/services";
import {
  WorkoutActionType,
  WorkoutActionTypeOptions,
  WorkoutActionTypeSubTagMap,
} from "@/biz/workout_action/constants";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { ButtonCore, DialogCore, InputCore, PopoverCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { BizError } from "@/domains/error";
import { WorkoutActionProfileViewModel } from "@/biz/workout_action/workout_action";

export function WorkoutActionSelectViewModel(props: {
  defaultValue?: { id: number | string; zh_name: string }[];
  list: typeof $workout_action_list;
  multiple?: boolean;
  app: ViewComponentProps["app"];
  client: HttpClientCore;
  onChange?: (action: WorkoutActionProfile[]) => void;
  onOk?: (actions: { id: number | string; zh_name: string }[]) => void;
  onError?: (error: BizError) => void;
}) {
  const request = {
    action: {
      list: props.list,
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    cancel() {
      ui.$dialog.hide();
    },
    select(vv: { id: number | string; zh_name: string }, extra: Partial<{ silence: boolean }> = {}) {
      // console.log("[BIZ]workout_action_select2 - select", vv);
      const disabled = _disabled.includes(vv.id);
      if (disabled) {
        return;
      }
      const existing = _selected.find((item) => item.id === vv.id);
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
        _selected = _selected.filter((item) => item.id !== vv.id);
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      const v = _actions.find((item) => item.id === vv.id);
      if (!v) {
        bus.emit(Events.Error, new BizError(["健身动作不存在"]));
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
    async handleClickTag(tag: { text: string; selected: boolean }) {
      if (tag.selected) {
        return;
      }
      _selected_tag = tag.text;
      const r = await request.action.list.search({
        type: ui.$input_type_select.value,
        tags: tag.text === "全部" ? [] : [tag.text],
      });
    },
    handleOk() {
      if (_selected.length === 0) {
        bus.emit(Events.Error, new BizError(["请选择健身动作"]));
        return;
      }
      if (props.onOk) {
        props.onOk(_selected);
      }
      bus.emit(Events.Ok, _selected);
    },
    handleClickWorkoutAction(v: { id: number }) {
      ui.$workout_action.ui.$dialog.show();
      ui.$workout_action.methods.fetch({ id: v.id });
    },
  };
  const ui = {
    $input_type_select: new SelectCore({
      defaultValue: WorkoutActionType.Resistance,
      options: WorkoutActionTypeOptions,
      async onChange(v) {
        _selected_tag = "全部";
        if (v) {
          _tags = WorkoutActionTypeSubTagMap[v];
        }
        methods.refresh();
        const r = await request.action.list.search({
          tags: [],
          type: v,
        });
        if (r.error) {
          bus.emit(Events.Error, r.error);
          return;
        }
        // ui.$search_type_select.hide();
      },
    }),
    $input_keyword: new InputCore({
      defaultValue: "",
      placeholder: "请输入关键字搜索",
      onEnter() {
        ui.$btn_search_submit.click();
      },
    }),
    $btn_search_submit: new ButtonCore({
      async onClick() {
        const v = ui.$input_keyword.value;
        // if (!v) {
        //   bus.emit(Events.Error, new BizError("请输入关键字搜索"));
        //   return;
        // }
        ui.$btn_search_submit.setLoading(true);
        const r = await request.action.list.search({ keyword: v });
        ui.$btn_search_submit.setLoading(false);
        if (r.error) {
          bus.emit(Events.Error, r.error);
          return;
        }
        _actions = r.data.dataSource;
        bus.emit(Events.StateChange, { ..._state });
      },
    }),
    $btn_search_reset: new ButtonCore({
      onClick() {
        request.action.list.reset();
      },
    }),
    $btn_show_dialog: new ButtonCore({
      onClick() {
        ui.$dialog.show();
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
    $btn_submit: new ButtonCore({
      onClick() {
        methods.handleOk();
      },
    }),
    $btn_cancel: new ButtonCore({
      onClick() {
        ui.$dialog.hide();
      },
    }),
    $workout_action: WorkoutActionProfileViewModel({ app: props.app, client: props.client }),
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.action.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };

  let _loading = true;
  let _multiple = props.multiple ?? true;
  let _selected: { id: number | string; zh_name: string }[] = (() => {
    return props.defaultValue ?? [];
  })();
  let _disabled: (number | string)[] = [];
  let _mode = "multiple" as "multiple" | "single";
  let _actions: WorkoutActionProfile[] = props.list?.response.dataSource ?? [];
  let _tags = WorkoutActionTypeSubTagMap[WorkoutActionType.Resistance];
  let _selected_tag = "全部";
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
    get tags() {
      return _tags.map((t) => {
        return {
          text: t,
          selected: _selected_tag === t,
        };
      });
    },
  };

  enum Events {
    Change,
    Error,
    Ok,
    Cancel,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Ok]: typeof _selected;
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
    init() {
      request.action.list.init();
    },
    clear() {
      _selected = [];
      bus.emit(Events.Change, []);
    },
    handleOk: methods.handleOk,
    ready() {
      // request.action.list.init();
    },
    destroy() {
      bus.destroy();
      request.action.list.destroy();
    },
    onOk(handler: Handler<TheTypesOfEvents[Events.Ok]>) {
      return bus.on(Events.Ok, handler);
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

  if (props.onError) {
    vm.onError(props.onError);
  }

  return vm;
}

export type WorkoutActionSelectViewModel = ReturnType<typeof WorkoutActionSelectViewModel>;
