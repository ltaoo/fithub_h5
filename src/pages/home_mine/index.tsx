import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { ScrollView } from "@/components/ui";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionHistoryList, fetchWorkoutActionHistoryListProcess } from "@/biz/workout_action/services";

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
  };
  const ui = {
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.workout_action_history.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };
  const tools = [
    {
      icon: "📊",
      name: "数据统计",
      onClick() {
        props.history.push("root.workout_day_list");
      },
    },
    { icon: "📝", name: "训练计划", onClick() {} },
    { icon: "🎯", name: "目标设置", onClick() {} },
    { icon: "📅", name: "预约课程", onClick() {} },
  ];
  let _state = {
    get response() {
      return request.workout_action_history.list.response;
    },
    get tools() {
      return tools;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.workout_action_history.list.onStateChange((v) => bus.emit(Events.StateChange, { ..._state }));

  return {
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeMineView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeMineViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="h-full">
      <div class="p-4">
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
          <div class="flex items-center">
            <div class="w-16 h-16 rounded-full bg-gray-200 mr-4">{/* 头像占位 */}</div>
            <div>
              <h3 class="text-lg font-semibold">用户名</h3>
              <p class="text-gray-600 text-sm">会员等级</p>
            </div>
          </div>
          <div class="mt-4 flex justify-between">
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
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 class="text-lg font-semibold mb-4">快捷工具</h3>
          <div class="grid grid-cols-4 gap-4">
            {state().tools.map((tool) => (
              <div class="text-center cursor-pointer" onClick={tool.onClick}>
                <div class="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-gray-100 rounded-lg text-2xl">
                  {tool.icon}
                </div>
                <p class="text-sm text-gray-600">{tool.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollView>
  );
}
