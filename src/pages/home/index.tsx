/**
 * @file 首页
 */
import { Switch, Match } from "solid-js";
import { Bell, Menu, BicepsFlexed } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { TabHeaderCore } from "@/domains/ui/tab-header";

import { HomeViewTabHeader } from "./components/tabs";
import { WorkoutPlanCard } from "@/components/workout-plan-card";

function HomeIndexPageViewModel(props: ViewComponentProps) {
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
    gotoWorkoutPlanListView() {
      props.history.push("root.workout_plan_list");
    },
  };
  const request = {};
  enum TabValues {
    Recommend = 1,
    HIIT = 2,
    FivePart = 3,
  }
  const ui = {
    $view: new ScrollViewCore(),
    $tab: new TabHeaderCore({
      options: [
        {
          id: TabValues.Recommend,
          text: "推荐",
        },
        {
          id: TabValues.HIIT,
          text: "HIIT",
        },
        {
          id: TabValues.FivePart,
          text: "五分化",
        },
      ] as { id: TabValues; text: string }[],
      onMounted() {
        ui.$tab.selectById(props.history.$router.name);
      },
      onChange(value) {
        // props.history.push(value.id);
        methods.refresh();
      },
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
      return ui.$tab.state.curId ?? (TabValues.Recommend as TabValues | null);
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
    state: _state,
    ui,
    methods,
    TabValues,
    ready() {
      _timer = setInterval(() => {
        methods.update_time();
      }, 1000);
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
  const [state, $model] = useViewModel(HomeIndexPageViewModel, [props]);

  return (
    <>
      <ScrollView store={$model.ui.$view} class="relative whitespace-nowrap">
        <div class="absolute right-4 top-6">
          <div class="flex gap-2">
            <div>
              <div class="flex items-center justify-center p-4 rounded-full bg-gray-200">
                <Bell class="w-6 h-6" />
              </div>
            </div>
            <div>
              <div class="flex items-center justify-center p-4 rounded-full bg-gray-200">
                <BicepsFlexed class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start gap-2 p-4 text-lg">
          <div class="flex items-center gap-4">
            <span>{state().month}</span>
            <span>{state().week}</span>
          </div>
          <div class="text-3xl font-bold">{state().time}</div>
        </div>
        <div class="space-y-4">
          <div class="border-b">
            <HomeViewTabHeader
              store={$model.ui.$tab}
              onMoreClick={() => {
                $model.methods.gotoWorkoutPlanListView();
              }}
            />
          </div>
          <div class="px-4 pb-8">
            <Switch>
              <Match when={state().cur_tab === $model.TabValues.Recommend}>
                <div class="space-y-2">
                  <WorkoutPlanCard
                    title="五分化背部训练计划"
                    overview="专注整体厚度"
                    estimated_duration_text="58分钟"
                    cover_path="https://static.funzm.com/assets/images/682e277957709aef.png"
                    tags={["五分化", "背部", "高强度"]}
                  />
                  <WorkoutPlanCard
                    title="五分化手臂训练计划"
                    overview="专注整体厚度"
                    estimated_duration_text="48分钟"
                    cover_path="https://static.funzm.com/assets/images/682e277957709aef.png"
                    tags={["五分化", "手臂", "中强度"]}
                  />
                  <WorkoutPlanCard
                    title="五分化下肢训练计划"
                    overview="冲击大重量"
                    estimated_duration_text="68分钟"
                    cover_path="https://static.funzm.com/assets/images/682e277957709aef.png"
                    tags={["五分化", "下肢", "高强度"]}
                  />
                </div>
              </Match>
              <Match when={state().cur_tab === $model.TabValues.HIIT}>
                <div>
                  {/* <div class="text-xl">HIIT</div> */}
                  <div class="p-2 mt-2 bg-gray-100 rounded-md">
                    <div class="">
                      <div class="flex">
                        <div>
                          <div>
                            <img
                              class="h-[120px] object-cover"
                              src="https://static.funzm.com/assets/images/682e277957709aef.png"
                            />
                          </div>
                          <div class="tags flex gap-2 mt-2">
                            <div class="py-1 px-2 bg-green-500 rounded-full text-white text-sm">20分钟</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Match>
              <Match when={state().cur_tab === $model.TabValues.FivePart}>
                <div>
                  {/* <div class="text-xl">居家力量</div> */}
                  <div class="p-2 mt-2 bg-gray-100 rounded-md">
                    <div class="">
                      <div class="flex">
                        <div>
                          <div>
                            <img
                              class="h-[120px] object-cover"
                              src="https://static.funzm.com/assets/images/682e277957709aef.png"
                            />
                          </div>
                          <div class="tags flex gap-2 mt-2">
                            <div class="py-1 px-2 bg-green-500 rounded-full text-white text-sm">两分化</div>
                            <div class="py-1 px-2 bg-green-500 rounded-full text-white text-sm">胸+肩</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </ScrollView>
    </>
  );
};
