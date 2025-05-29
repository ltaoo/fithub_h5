import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionHistoryList, fetchWorkoutActionHistoryListProcess } from "@/biz/workout_action/services";
import { ActivityCalendar } from "@/biz/activity_calendar";
import { fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { ChevronRight } from "lucide-solid";

function HomeMineViewModel(props: ViewComponentProps) {
  const request = {
    workout_action_history: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionHistoryList, {
          process: fetchWorkoutActionHistoryListProcess,
          client: props.client,
        })
      ),
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
    gotoWorkoutDayListView() {
      props.history.push("root.workout_day_list");
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $calendar: ActivityCalendar<{ day: string; num: number }>({
      x: 17,
      min: 2,
    }),
  };
  let _state = {
    get response() {
      return request.workout_action_history.list.response;
    },
    get calendar() {
      return ui.$calendar.state;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_action_history.list.onStateChange(() => methods.refresh());
  ui.$calendar.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const r = await request.workout_day.list.init();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const { dataSource } = r.data;
      const vv = dataSource.filter((v) => {
        return v.day !== null;
      }) as { day: string }[];
      ui.$calendar.methods.setData(
        vv.map((v) => {
          return {
            day: v.day,
            num: 1,
          };
        })
      );
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeMineView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeMineViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="bg-gray-100">
      <div class="">
        <div class="p-4 mb-4">
          <div class="flex items-center">
            <div class="w-16 h-16 rounded-full bg-gray-200 mr-4">{/* 头像占位 */}</div>
            <div>
              <h3 class="text-lg font-semibold">用户名</h3>
              <p class="text-gray-600 text-sm">会员等级</p>
            </div>
          </div>
          {/* <div class="mt-4 flex justify-between">
            <div class="text-center">
              <p class="text-gray-600 text-sm">训练天数</p>
              <p class="font-semibold">0</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">累计时长</p>
              <p class="font-semibold">0h</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">消耗热量</p>
              <p class="font-semibold">0kcal</p>
            </div>
          </div> */}
        </div>
        <div
          class="mine-page-content overflow-hidden p-4 bg-white"
          style={{
            "border-radius": "12px 12px 0 0",
          }}
        >
          <div class="bg-white rounded-lg mb-4">
            <div class="flex items-center justify-between  mb-4">
              <h3 class="text-lg font-semibold">训练记录</h3>
              <div
                class="p-2"
                onClick={() => {
                  vm.methods.gotoWorkoutDayListView();
                }}
              >
                <ChevronRight class="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div class="mt-2">
              <div class="flex space-x-1" style="padding: 0 4rpx;">
                <For each={state().calendar.weeks}>
                  {(week) => {
                    return (
                      <div class="space-y-1">
                        <For each={week.days}>
                          {(day) => {
                            const ColorMap: Record<number, string> = {
                              1: "#65da65",
                            };
                            const v = day.payload?.num ?? 0;
                            return (
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  "border-radius": "4px",
                                  border: "1px solid #e6e6e6",
                                  opacity: day.hidden ? "0.2" : "1",
                                  "background-color": ColorMap[v] ?? "white",
                                }}
                                data-day={day.day}
                              ></div>
                            );
                          }}
                        </For>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollView>
  );
}
