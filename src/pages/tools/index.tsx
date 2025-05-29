import { ViewComponentProps } from "@/store/types";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui";
import { useViewModel } from "@/hooks";
import { PageKeys } from "@/store/routes";

function ToolsViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    handleClickTool(tool: string) {
      const map: Record<string, PageKeys> = {
        muscle: "root.muscle",
      };
      const v = map[tool];
      if (!v) {
        return;
      }
      props.history.push(v);
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
  };
  let _state = {};
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
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ToolsView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ToolsViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view}>
      <div class="p-4">
        <div class="text-3xl">常用工具</div>
        <div class="mt-8">
          <div class="space-y-4">
            <div class="w-full ">
              <div class="text-xl">查询</div>
              <div class="grid grid-cols-5 gap-4 mt-4">
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      动作库
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      器械
                    </div>
                  </div>
                </div>
                <div
                  class="relative pb-8"
                  onClick={() => {
                    vm.methods.handleClickTool("muscle");
                  }}
                >
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap  text-gray-800 text-md text-center">
                      肌肉
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      评估参考
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      常见问题
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full ">
              <div class="text-xl">计算</div>
              <div class="grid grid-cols-5 gap-4 mt-4">
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      BMI计算
                    </div>
                  </div>
                </div>
                <div
                  class="relative pb-8"
                  onClick={() => {
                    props.history.push("root.tools_bmr_calc");
                  }}
                >
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      基础代谢
                    </div>
                  </div>
                </div>
                <div
                  class="relative pb-8"
                  onClick={() => {
                    props.history.push("root.tools_rm_calc");
                  }}
                >
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      RM换算
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 w-[74px] text-gray-800 text-md text-center">
                      心率换算
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full ">
              <div class="text-xl">学习</div>
              <div class="grid grid-cols-5 gap-4 mt-4">
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      学习资料
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      答题挑战
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full">
              <div class="text-xl">小工具</div>
              <div class="grid grid-cols-5 gap-4 mt-4">
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      节拍器
                    </div>
                  </div>
                </div>
                <div
                  class="relative pb-8"
                  onClick={() => {
                    props.history.push("root.stopwatch");
                  }}
                >
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      秒表
                    </div>
                  </div>
                </div>
                <div
                  class="relative pb-8"
                  onClick={() => {
                    props.history.push("root.countdown");
                  }}
                >
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      分组
                    </div>
                  </div>
                </div>
                <div class="relative pb-8">
                  <div class="w-full h-full min-h-[48px] bg-gray-200"></div>
                  <div class="relative mt-2">
                    <div class="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-gray-800 text-md text-center">
                      抽签
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-[68px]"></div>
    </ScrollView>
  );
}
