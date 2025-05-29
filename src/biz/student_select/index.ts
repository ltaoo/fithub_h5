/**
 * @file 学员选择
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

type StudentId = number | string;
type Student = {
  id: StudentId;
  nickname: string;
};

export function StudentSelectViewModel(props: {
  defaultValue: Student[];
  client: HttpClientCore;
  list: ListCore<any>;
  onChange?: (students: Student[]) => void;
}) {
  const request = {
    student: {
      list: props.list,
    },
  };
  const methods = {
    select(student: Student) {
      const existing = _selected.find((v) => v.id === student.id);
      if (existing) {
        _selected = _selected.filter((v) => v.id !== student.id);
        bus.emit(Events.Change, _selected);
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      const v = _student_list.find((v) => v.id === student.id);
      if (!v) {
        return;
      }
      _selected.push(v);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    remove(student: Student) {
      _selected = _selected.filter((v) => v.id !== student.id);
      bus.emit(Events.Change, _selected);
      bus.emit(Events.StateChange, { ..._state });
    },
    map_student_list(students: { id: StudentId }[]) {
      return _student_list.flatMap((a) => {
        return students.find((v) => v.id === a.id) ?? [];
      });
    },
    find(value: { id: StudentId }) {
      return _student_list.find((a) => a.id === value.id) ?? null;
    },
    search(value: string) {
      request.student.list.search({
        keyword: value,
      });
    },
    set_student_list(student_list: Student[]) {
      request.student.list.modifyResponse((v) => {
        return {
          ...v,
          initial: false,
          dataSource: student_list,
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
        await request.student.list.loadMore();
        ui.$scroll.finishLoadingMore();
      },
    }),
  };

  let _selected: Student[] = [];
  let _student_list: Student[] = props.list?.response.dataSource ?? [];
  let _state = {
    get value() {
      return _selected;
    },
    get selected() {
      return _selected.flatMap((item) => {
        const existing = _student_list.find((a) => a.id === item.id);
        if (!existing) {
          return [];
        }
        return [existing];
      });
    },
    get list() {
      return _student_list.map((v) => {
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
    [Events.ActionsLoaded]: typeof _student_list;
    [Events.Change]: typeof _selected;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.student.list.onStateChange((state) => {
    _student_list = state.dataSource;
    bus.emit(Events.ActionsLoaded, _student_list);
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
    setValue(value: Student[]) {
      // console.log("[BIZ]workout_action_select - setValue", value, _student_list);
      const v = _student_list.filter((a) => {
        return value.find((v) => v.id === a.id);
      });
      _selected = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    ready() {
      // request.action.list.init();
    },
    onStudentListLoaded(handler: Handler<TheTypesOfEvents[Events.ActionsLoaded]>) {
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
