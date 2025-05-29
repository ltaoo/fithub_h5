/**
 * @file 首页
 */
import { Switch, Match, For } from "solid-js";
import { Bell, Menu, BicepsFlexed } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { ScrollView } from "@/components/ui";
import { DragSelectView } from "@/components/drag-select";
import { Sheet } from "@/components/ui/sheet";

import { RequestCore } from "@/domains/request";
import { base, Handler } from "@/domains/base";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { DragSelectViewModel } from "@/biz/drag_select";
import { fetchWorkoutPlanSetList, fetchWorkoutPlanSetListProcess } from "@/biz/workout_plan/services";

import { HomeViewTabHeader } from "./components/tabs";
import { Countdown } from "@/components/countdown";
import { CountdownViewModel } from "@/biz/countdown";

function HomeIndexPageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan_set: {
      list: new RequestCore(fetchWorkoutPlanSetList, { process: fetchWorkoutPlanSetListProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    format_date(date: Date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const week = week_days[date.getDay()];
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return {
        month: `${month}月${day}日`,
        week: `星期${week}`,
        time: `${hours}:${minutes}`,
      };
    },
    update_time() {
      _current_time = new Date();
      const { month, week, time } = methods.format_date(_current_time);
      _month = month;
      _week = week;
      _time = time;
      methods.refresh();
    },
    gotoWorkoutPlanProfileView(v: { id: number }) {
      props.history.push("root.workout_plan_profile", {
        id: String(v.id),
      });
    },
    gotoWorkoutPlanListView() {
      props.history.push("root.workout_plan_list");
    },
    gotoWorkoutDayPrepareView() {
      props.history.push("root.workout_day_prepare");
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $tab: new TabHeaderCore({
      options: [
        {
          id: 1,
          text: "推荐",
        },
        {
          id: 2,
          text: "HIIT",
        },
        {
          id: 3,
          text: "五分化",
        },
      ] as { id: number; text: string }[],
      // onMounted() {
      //   ui.$tab.selectById(1);
      // },
      onChange(value) {
        // props.history.push(value.id);
        methods.refresh();
      },
    }),
    $dialog_height_input: new DialogCore(),
    $input_height: DragSelectViewModel({
      options: ["172", "174", "176", "178", "180", "182", "184", "186", "188", "190"].map((v) => {
        return {
          label: v,
          value: v,
        };
      }),
      defaultValue: "182",
    }),
  };

  const week_days = ["日", "一", "二", "三", "四", "五", "六"];

  let _timer: NodeJS.Timeout | null = null;
  let _current_time = new Date();
  let _month = "";
  let _week = "";
  let _time = "";

  const _state = {
    get cur_time() {
      return _current_time;
    },
    get month() {
      return methods.format_date(this.cur_time).month;
    },
    get week() {
      return methods.format_date(this.cur_time).week;
    },
    get time() {
      return methods.format_date(this.cur_time).time;
    },
    get cur_tab() {
      return ui.$tab.state.curId;
    },
    get dataSource() {
      const resp = request.workout_plan_set.list.response;
      if (!resp) {
        return [];
      }
      const curId = ui.$tab.state.curId ?? resp.list[0].id;
      if (!curId) {
        return [];
      }
      const matched = resp.list.find((vv) => vv.id === Number(curId));
      if (!matched) {
        return [];
      }
      return matched.list;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      _timer = setInterval(() => {
        methods.update_time();
      }, 1000);
      const r = await request.workout_plan_set.list.run();
      if (r.error) {
        return;
      }
      const { list } = r.data;
      ui.$tab.setTabs(
        list.map((v) => {
          return {
            id: v.id,
            text: v.title,
          };
        })
      );
      // if (list.length) {
      //   ui.$tab.selectById(list[0].id);
      // }
      methods.refresh();
    },
    destroy() {
      if (_timer) {
        clearInterval(_timer);
        _timer = null;
      }
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeIndexPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(HomeIndexPageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="relative whitespace-nowrap">
        <div class="absolute right-4 top-6">
          <div class="flex gap-2">
            <div>
              <div class="flex items-center justify-center p-4 rounded-full bg-w-bg-5 text-w-fg-1">
                <Bell class="w-6 h-6" />
              </div>
            </div>
            <div>
              <div
                class="flex items-center justify-center p-4 rounded-full bg-w-bg-5 text-w-fg-1"
                onClick={() => {
                  vm.methods.gotoWorkoutDayPrepareView();
                }}
              >
                <BicepsFlexed class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start gap-2 p-4 text-lg">
          <div class="text-3xl font-bold">{state().time}</div>
          <div class="flex items-center gap-4">
            <span>{state().month}</span>
            <span>{state().week}</span>
          </div>
        </div>
        <div class="space-y-4">
          <div class="border-b-2 border-w-bg-5">
            <HomeViewTabHeader
              store={vm.ui.$tab}
              onMoreClick={() => {
                vm.methods.gotoWorkoutPlanListView();
              }}
            />
          </div>
          <div class="px-4 pb-8">
            <div class="space-y-2">
              <For each={state().dataSource}>
                {(vv) => {
                  return (
                    <WorkoutPlanCard
                      title={vv.title}
                      overview={vv.overview}
                      estimated_duration_text="58分钟"
                      cover_path="https://static.funzm.com/assets/images/682e277957709aef.png"
                      tags={vv.tags}
                      onClick={() => {
                        vm.methods.gotoWorkoutPlanProfileView({ id: vv.id });
                      }}
                    />
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </ScrollView>
    </>
  );
};
