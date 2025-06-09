import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { HttpClientCore } from "@/domains/http_client";
import { Result } from "@/domains/result";
import { CheckboxCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { RefCore } from "@/domains/ui/cur";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { RequestCore } from "@/domains/request";
import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";
import {
  createWorkoutSchedule,
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
  updateWorkoutSchedule,
} from "@/biz/workout_plan/services";
import { ListCore } from "@/domains/list";
import { update_arr_item } from "@/utils";

export function WorkoutScheduleValuesModel(props: ViewComponentProps) {
  const request = {
    workout_schedule: {
      create: new RequestCore(createWorkoutSchedule, { client: props.client }),
      update: new RequestCore(updateWorkoutSchedule, { client: props.client }),
    },
    workout_plan: {
      list: new ListCore(
        new RequestCore(fetchWorkoutPlanList, {
          process: fetchWorkoutPlanListProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickWeekday(day: CalendarCore["state"]["weekdays"][number]) {
      if (ui.$workout_plan_select.ui.$dialog.open) {
        return;
      }
      const matched = _selected_plans.find((v) => v.day_id === day.id);
      if (matched) {
        const vv = ui.$workout_plan_select.methods.mapListWithId([matched.plan_id]);
        ui.$workout_plan_select.setValue(vv);
      }
      ui.$ref_weekday.select(day);
      ui.$workout_plan_select.ui.$dialog.show();
    },
    hideWorkoutPlanSelectDialog() {
      ui.$workout_plan_select.ui.$dialog.hide();
    },
    ensureSelectedWorkoutPlan() {
      const selected_plans = ui.$workout_plan_select.state.selected;
      if (selected_plans.length === 0) {
        props.app.tip({
          text: ["请先选择计划"],
        });
        return;
      }
      const selected = selected_plans[0];
      const the_day = ui.$ref_weekday.value;
      if (!the_day) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      const existing_idx = _selected_plans.findIndex((v) => v.day_id === the_day.id);
      (() => {
        const v = {
          day_id: the_day.id,
          weekday: dayjs(the_day.value).day(),
          day: dayjs(the_day.value).date(),
          plan_id: selected.id,
        };
        if (existing_idx !== -1) {
          _selected_plans = update_arr_item(_selected_plans, existing_idx, v);
          return;
        }
        _selected_plans.push(v);
      })();
      methods.refresh();
      ui.$workout_plan_select.clear();
      ui.$workout_plan_select.ui.$dialog.hide();
    },
    async toBody() {
      const r = await ui.$values.validate();
      if (r.error) {
        return Result.Err(r.error.message);
      }
      const { title, overview, level, tags, type, status } = r.data;
      if (!title) {
        return Result.Err("请输入标题");
      }
      if (_selected_plans.length === 0) {
        return Result.Err("请至少增加一个训练计划");
      }
      const body = {
        title,
        overview,
        level: level ?? 1,
        status: status ? 1 : 2,
        tags: tags.join(","),
        type: type ?? 1,
        workout_plans: _selected_plans.map((v) => {
          return {
            weekday: type === 1 ? v.weekday : 0,
            day: type === 2 ? v.day : 0,
            workout_plan_id: Number(v.plan_id),
          };
        }),
      };
      return Result.Ok(body);
    },
    async submit() {
      const r = await methods.toBody();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const body = r.data;
      const r2 = await request.workout_schedule.create.run(body);
      if (r2.error) {
        props.app.tip({
          text: [r2.error.message],
        });
        return;
      }
      props.history.replace("root.workout_schedule_create_success", {
        id: String(r2.data.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $calendar: CalendarCore({
      today: new Date(),
    }),
    $values: new ObjectFieldCore({
      label: "",
      name: "",
      fields: {
        title: new SingleFieldCore({
          label: "标题",
          name: "title",
          input: new InputCore({ defaultValue: "", placeholder: "请输入标题" }),
        }),
        overview: new SingleFieldCore({
          label: "概要",
          name: "overview",
          input: new InputCore({ defaultValue: "", placeholder: "请输入概要" }),
        }),
        level: new SingleFieldCore({
          label: "难度",
          name: "level",
          input: new SelectCore({
            defaultValue: 1,
            options: [
              {
                label: "新手",
                value: 1,
              },
              {
                label: "中级",
                value: 3,
              },
              {
                label: "高级",
                value: 5,
              },
            ],
          }),
        }),
        tags: new SingleFieldCore({
          label: "标签",
          name: "tags",
          input: new TagInputCore({}),
        }),
        type: new SingleFieldCore({
          label: "循环类型",
          name: "type",
          input: new SelectCore({
            defaultValue: 1,
            options: [
              {
                label: "周循环",
                value: 1,
              },
              // {
              //   label: "月循环",
              //   value: 2,
              // },
              // {
              //   label: "不循环",
              //   value: 3,
              // },
            ],
          }),
        }),
        status: new SingleFieldCore({
          label: "外部是否可见",
          name: "status",
          input: new CheckboxCore({ checked: false }),
        }),
      },
    }),
    $workout_plan_select: WorkoutPlanSelectViewModel({
      defaultValue: [],
      multiple: false,
      list: request.workout_plan.list,
      onOk(v) {
        methods.ensureSelectedWorkoutPlan();
      },
    }),
    $ref_weekday: new RefCore<CalendarCore["state"]["weekdays"][number]>(),
  };

  let _selected_plans: {
    day_id: number;
    weekday: number;
    day: number;
    plan_id: number;
  }[] = [];
  let _state = {
    get selected_plan_map() {
      return _selected_plans
        .map((v) => {
          return {
            [v.day_id]: v.plan_id,
          };
        })
        .reduce((a, b) => {
          return {
            ...a,
            ...b,
          };
        }, {});
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    ui,
    methods,
    state: _state,
    ready() {
      ui.$workout_plan_select.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
