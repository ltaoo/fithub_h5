/**
 * @file 工具列表
 */
import { For } from "solid-js";

import { PageKeys } from "@/store/routes";
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";

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
  let _tool_groups: {
    title: string;
    menus: { icon: string; title: string; onClick?: () => void }[];
  }[] = [
    {
      title: "查询",
      menus: [
        {
          title: "动作库",
          icon: "//static.fithub.top/icons/icon7.jpeg",
          onClick() {
            props.history.push("root.workout_action_list");
          },
        },
        {
          title: "肌肉",
          icon: "//static.fithub.top/icons/icon1.jpeg",
          onClick() {
            props.history.push("root.muscle");
          },
        },
        {
          title: "器械",
          icon: "//static.fithub.top/icons/icon2.jpeg",
          onClick() {
            props.history.push("root.equipment");
          },
        },
        // {
        //   title: "评估参考",
        // },
        // {
        //   title: "常见问题",
        // icon: "//static.fithub.top/icons/icon11.jpeg",
        // },
      ],
    },
    {
      title: "计算",
      menus: [
        {
          title: "BMI计算",
          icon: "//static.fithub.top/icons/icon13.jpeg",
          onClick() {
            props.history.push("root.tools_bmi_calc");
          },
        },
        {
          title: "基础代谢",
          icon: "//static.fithub.top/icons/icon3.jpeg",
          onClick() {
            props.history.push("root.tools_bmr_calc");
          },
        },
        {
          title: "RM换算",
          icon: "//static.fithub.top/icons/icon10.jpeg",
          onClick() {
            props.history.push("root.tools_rm_calc");
          },
        },
        {
          title: "心率换算",
          icon: "//static.fithub.top/icons/icon12.jpeg",
          onClick() {
            props.history.push("root.tools_heart_rate");
          },
        },
      ],
    },
    {
      title: "工具",
      menus: [
        {
          title: "节拍器",
          icon: "//static.fithub.top/icons/icon4.jpeg",
          onClick() {
            props.history.push("root.tools_metronome");
          },
        },
        {
          title: "秒表",
          icon: "//static.fithub.top/icons/icon5.jpeg",
          onClick() {
            props.history.push("root.tools_stopwatch");
          },
        },
        {
          title: "1RM测试",
          icon: "//static.fithub.top/icons/icon9.jpeg",
          onClick() {
            props.history.push("root.tools_max_rm_test");
          },
        },
        // {
        //   title: "分组",
        //   onClick() {
        //     props.history.push("root.tools_countdown");
        //   },
        // },
        // {
        //   title: "抽签",
        // },
      ],
    },
    {
      title: "学习",
      menus: [
        {
          title: "内容",
          icon: "//static.fithub.top/icons/icon8.jpeg",
          onClick() {
            props.history.push("root.content_list");
          },
        },
        {
          title: "答题挑战",
          icon: "//static.fithub.top/icons/icon6.jpeg",
          onClick() {
            props.history.push("root.paper_list");
          },
        },
      ],
    },
  ];
  let _state = {
    get groups() {
      return _tool_groups;
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
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ToolsView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ToolsViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="scroll--hidden bg-w-bg-0">
      <div class="p-2">
        {/* <div class="flex items-center justify-between gap-2">
          <div class="text-xl text-w-fg-0">常用工具</div>
          <div></div>
        </div> */}
        <div class="space-y-4">
          <For each={state().groups}>
            {(group) => {
              return (
                <div class="w-full border-2 border-w-fg-3 rounded-lg">
                  <div class="p-4 border-b-2 border-w-fg-3">
                    <div class="text-w-fg-0">{group.title}</div>
                  </div>
                  <div class="grid grid-cols-4 gap-4 p-4">
                    <For each={group.menus}>
                      {(menu) => {
                        return (
                          <div class="relative aspect-square rounded-full" onClick={menu.onClick}>
                            <div
                              class="w-full h-full rounded-xl"
                              style={{
                                "background-image": `url('${menu.icon}')`,
                                "background-size": "cover",
                                "background-position": "center",
                              }}
                            ></div>
                            <div class="relative mt-2">
                              <div class="whitespace-nowrap text-w-fg-0 text-sm text-center">{menu.title}</div>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
      <div class="h-[68px]"></div>
    </ScrollView>
  );
}
