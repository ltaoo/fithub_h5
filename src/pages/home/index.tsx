/**
 * @file 首页
 */
import { createSignal, For, Show, onCleanup, onMount } from "solid-js";
import { Send, FileSearch, RefreshCcw, AlertTriangle, Loader, Bird, BarChart } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";

function HomeIndexPageViewModel(props: ViewComponentProps) {
  const week_days = ["日", "一", "二", "三", "四", "五", "六"];

  let _timer: NodeJS.Timeout | null = null;
  let _current_time = new Date();
  let _month = "";
  let _week = "";
  let _time = "";
  const methods = {
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
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const request = {};
  const ui = {
    $view: new ScrollViewCore(),
  };
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
      <ScrollView store={$model.ui.$view} class="p-4 whitespace-nowrap">
        <div class="flex flex-col items-start gap-2 text-lg">
          <div class="flex items-center gap-4">
            <span>{state().month}</span>
            <span>{state().week}</span>
          </div>
          <div class="text-2xl font-bold">{state().time}</div>
        </div>
      </ScrollView>
    </>
  );
};
