/**
 * @file 首页
 */
import { Switch, Match, For, Show } from "solid-js";
import { Bell, Menu, BicepsFlexed, Check } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { WorkoutPlanCard } from "@/components/workout-plan-card";
import { ScrollView, Skeleton } from "@/components/ui";

import { RequestCore } from "@/domains/request";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { CalendarCore } from "@/domains/ui/calendar";
import { ListCore } from "@/domains/list";
import { TabHeaderCore } from "@/domains/ui/tab-header";
import { fetchWorkoutPlanSetList, fetchWorkoutPlanSetListProcess } from "@/biz/workout_plan/services";
import { fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { sleep } from "@/utils";

import { HomeViewTabHeader } from "./components/tabs";

function HomeIndexPageViewModel(props: ViewComponentProps) {
  const request = {
    workout_plan_set: {
      list: new RequestCore(fetchWorkoutPlanSetList, { process: fetchWorkoutPlanSetListProcess, client: props.client }),
    },
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
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
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await sleep(800);
        ui.$view.finishPullToRefresh();
      },
    }),
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
    $calendar: CalendarCore({
      today: new Date(),
    }),
  };

  const week_days = ["一", "二", "三", "四", "五", "六", "日"];

  const _state = {
    get weekdays() {
      return ui.$calendar.state.weekdays.map((day, idx) => {
        return {
          ...day,
          week_text: week_days[idx],
          is_pass: dayjs(day.value).isBefore(new Date(), "date"),
          has_workout: request.workout_day.list.response.dataSource.find((v) => {
            return dayjs(day.value).isSame(v.day, "date");
          }),
        };
      });
    },
    get cur_tab() {
      return ui.$tab.state.curId;
    },
    get initial() {
      return request.workout_plan_set.list.initial;
    },
    get dataSource() {
      const resp = request.workout_plan_set.list.response;
      if (!resp) {
        return [];
      }
      if (resp.list.length === 0) {
        return [];
      }
      const cur_id = ui.$tab.state.curId ?? resp.list[0].id;
      if (!cur_id) {
        return [];
      }
      const matched = resp.list.find((vv) => vv.id === Number(cur_id));
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

  request.workout_day.list.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      request.workout_day.list.init();
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
    destroy() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeIndexPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(HomeIndexPageViewModel, [props]);

  return (
    <>
      <div class="z-0 fixed top-0 left-0 w-full">
        <div class="">
          <div class="grid grid-cols-7 gap-2 p-2">
            <For each={state().weekdays}>
              {(day) => {
                return (
                  <div class="relative">
                    <Show when={day.is_pass}>
                      <div class="absolute inset-0 bg-w-bg-0 opacity-50 pointer-events-none"></div>
                    </Show>
                    <div
                      class="relative py-2 px-2 rounded-full border-2"
                      classList={{
                        "border-green-500 text-w-fg-0 ": day.is_today,
                        " border-w-bg-5 text-w-fg-1 ": !day.is_today,
                        "": day.is_pass,
                      }}
                    >
                      <div class="text-center">{day.text}</div>
                      <div class="flex items-center justify-center h-[32px]">
                        <Show when={day.has_workout}>
                          <Check class="w-4 h-4 text-green-500" />
                        </Show>
                      </div>
                      {/* <div class="text-w-fg-0 text-sm text-center">{day.week_text}</div> */}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="border-b-2 border-w-bg-5">
            <HomeViewTabHeader
              store={vm.ui.$tab}
              onMoreClick={() => {
                vm.methods.gotoWorkoutPlanListView();
              }}
            />
          </div>
        </div>
      </div>
      <div class="absolute top-[134px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view} class="">
          <div class="p-2 pb-8 relative whitespace-nowrap">
            <Show
              when={!state().initial}
              fallback={
                <div class="p-4 h-[160px] rounded-xl border-2 border-w-bg-5">
                  <Skeleton class="w-[120px] h-[32px]" />
                </div>
              }
            >
              <Show
                when={state().dataSource.length}
                fallback={
                  <div class="flex justify-center p-4">
                    <div class="text-sm text-w-fg-1">没有数据了</div>
                  </div>
                }
              >
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
              </Show>
            </Show>
          </div>
        </ScrollView>
      </div>
    </>
  );
};
