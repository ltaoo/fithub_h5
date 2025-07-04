import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { HttpClientCore } from "@/domains/http_client";
import { Result } from "@/domains/result";
import { CheckboxCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { RefCore } from "@/domains/ui/cur";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { RequestCore } from "@/domains/request";
import { WorkoutPlanSelectViewModel } from "@/biz/workout_plan_select/workout_plan_select";
import {
  createWorkoutSchedule,
  fetchWorkoutPlanList,
  fetchWorkoutPlanListProcess,
  updateWorkoutSchedule,
} from "@/biz/workout_plan/services";
import { WorkoutScheduleType } from "@/biz/workout_plan/constants";
import { map_weekday_text } from "@/biz/workout_plan/workout_schedule";
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
        const vv = ui.$workout_plan_select.methods.mapListWithId(matched.plan_ids);
        ui.$workout_plan_select.setValue(vv);
      }
      ui.$ref_weekday.select(day);
      ui.$workout_plan_select.ui.$dialog.show();
    },
    handleClickDay(day: { idx: number }) {
      if (ui.$workout_plan_select.ui.$dialog.open) {
        return;
      }
      const matched = _selected_plans.find((v) => v.day_id === day.idx);
      if (matched) {
        const vv = ui.$workout_plan_select.methods.mapListWithId(matched.plan_ids);
        ui.$workout_plan_select.setValue(vv);
      }
      ui.$ref_day.select(day);
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
      // const selected = selected_plans[0];
      const schedule_type = ui.$form.fields.type.value;
      if (schedule_type === WorkoutScheduleType.Weekly) {
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
            idx: 0,
            plan_ids: selected_plans.map((v) => v.id),
          };
          if (existing_idx !== -1) {
            _selected_plans = update_arr_item(_selected_plans, existing_idx, v);
            return;
          }
          _selected_plans.push(v);
        })();
      }
      if (schedule_type === WorkoutScheduleType.Days) {
        const the_day = ui.$ref_day.value;
        if (!the_day) {
          props.app.tip({
            text: ["异常操作"],
          });
          return;
        }
        const existing_idx = _selected_plans.findIndex((v) => v.day_id === the_day.idx);
        (() => {
          const v = {
            day_id: the_day.idx,
            weekday: 0,
            day: 0,
            idx: the_day.idx,
            plan_ids: selected_plans.map((v) => v.id),
          };
          if (existing_idx !== -1) {
            _selected_plans = update_arr_item(_selected_plans, existing_idx, v);
            return;
          }
          _selected_plans.push(v);
        })();
      }
      methods.refresh();
      ui.$workout_plan_select.clear();
      ui.$workout_plan_select.ui.$dialog.hide();
    },
    addDay() {
      const idx = _days[_days.length - 1].idx + 1;
      _days.push({
        idx,
        text: `第${idx + 1}天`,
        plan_ids: [],
      });
      methods.refresh();
    },
    async toBody() {
      const r = await ui.$form.validate();
      if (r.error) {
        return Result.Err(r.error);
      }
      const { title, overview, level, type, status } = r.data;
      if (!title) {
        return Result.Err("请输入标题");
      }
      if (_selected_plans.length === 0) {
        return Result.Err("请至少增加一个训练计划");
      }
      // console.log("type - ", type, WorkoutScheduleType.Weekly === type, status);
      const body = {
        title,
        overview,
        level: level ?? 1,
        status: status ? 1 : 2,
        tags: "",
        type: type ?? WorkoutScheduleType.Weekly,
        details: JSON.stringify({
          schedules: (() => {
            if (type === WorkoutScheduleType.Weekly) {
              return _selected_plans.map((v) => {
                return {
                  weekday: v.weekday,
                  day: 0,
                  idx: 0,
                  workout_plan_ids: v.plan_ids,
                };
              });
            }
            if (type === WorkoutScheduleType.Days) {
              return _days.map((d) => {
                return {
                  weekday: 0,
                  day: 0,
                  idx: d.idx,
                  workout_plan_ids: _selected_plans.find((v) => v.idx === d.idx)?.plan_ids ?? [],
                };
              });
            }
            return [];
          })(),
        }),
      };
      return Result.Ok(body);
    },
    async createWorkoutSchedule() {
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
    $form: new ObjectFieldCore({
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
        type: new SingleFieldCore({
          label: "循环类型",
          name: "type",
          input: new SelectCore({
            defaultValue: WorkoutScheduleType.Weekly,
            options: [
              {
                label: "周循环",
                value: WorkoutScheduleType.Weekly,
              },
              // {
              //   label: "月循环",
              //   value: 2,
              // },
              // {
              //   label: "不循环",
              //   value: 3,
              // },
              {
                label: "天数循环",
                value: WorkoutScheduleType.Days,
              },
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
      list: request.workout_plan.list,
      onOk(v) {
        methods.ensureSelectedWorkoutPlan();
      },
    }),
    $ref_weekday: new RefCore<CalendarCore["state"]["weekdays"][number]>(),
    $ref_day: new RefCore<{ idx: number }>(),
  };

  let _selected_plans: {
    day_id: number;
    weekday: number;
    day: number;
    idx: number;
    plan_ids: number[];
  }[] = [];
  let _days: {
    idx: number;
    text: string;
    plan_ids: number[];
  }[] = [
    {
      idx: 0,
      text: "第1天",
      plan_ids: [],
    },
    {
      idx: 1,
      text: "第2天",
      plan_ids: [],
    },
  ];
  let _state = {
    get selected_plan_map() {
      return _selected_plans
        .map((v) => {
          return {
            [v.day_id]: v.plan_ids,
          };
        })
        .reduce((a, b) => {
          return {
            ...a,
            ...b,
          };
        }, {});
    },
    get weekdays() {
      return ui.$calendar.state.weekdays.map((weekday) => {
        return {
          ...weekday,
          weekday_text: map_weekday_text(dayjs(weekday.value).day()),
          plan_id: _state.selected_plan_map[weekday.id] ?? null,
        };
      });
    },
    get days() {
      return _days.map((v) => {
        return {
          ...v,
          plan_id: _state.selected_plan_map[v.idx] ?? null,
        };
      });
    },
    get schedule_type() {
      return ui.$form.fields.type.value;
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

  ui.$form.fields.type.onChange(() => {
    methods.refresh();
  });
  ui.$workout_plan_select.ui.$dialog.onCancel(() => {
    ui.$workout_plan_select.clear();
  });

  return {
    ui,
    methods,
    state: _state,
    ready() {
      ui.$workout_plan_select.init();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
