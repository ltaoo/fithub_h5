/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal } from "solid-js";
import { Users, Home, Bike, BicepsFlexed, User, Star, Boxes } from "lucide-solid";

import { pages } from "@/store/views";
import { ViewComponent, ViewComponentProps } from "@/store/types";
import { PageKeys } from "@/store/routes";

import { useViewModel } from "@/hooks";
import { Show } from "@/packages/ui/show";
import { KeepAliveRouteView } from "@/components/ui";

import { fetchStartedWorkoutDayList, fetchStartedWorkoutDayListProcess } from "@/biz/workout_day/services";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { cn } from "@/utils/index";

function HomeLayoutViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      fetch_started: new RequestCore(fetchStartedWorkoutDayList, {
        process: fetchStartedWorkoutDayListProcess,
        client: props.client,
        onFailed(error) {
          // ...
        },
      }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    gotoWorkoutDayView() {
      const list = request.workout_day.fetch_started.response?.list;
      if (!list) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      const first = list[0];
      if (!first) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      props.history.push("root.workout_day", {
        id: String(first.id),
      });
    },
    gotoWorkoutPrepareView() {
      props.history.push("root.workout_day_prepare");
    },
    setCurMenu() {
      const name = props.history.$router.name as PageKeys;
      _route_name = name;
      const keys = [
        "root.home_layout.workout_plan_layout.mine",
        "root.home_layout.workout_plan_layout.interval",
        "root.home_layout.workout_plan_layout.single",
      ] as PageKeys[];
      if (keys.includes(name)) {
        _route_name = "root.home_layout.workout_plan_layout.recommend";
      }
      methods.refresh();
    },
  };

  const _menus: { text: string; icon: JSX.Element; badge?: boolean; url?: PageKeys; onClick?: () => void }[] = [
    {
      text: "首页",
      icon: <Home class="w-6 h-6" />,
      url: "root.home_layout.index",
    },
    {
      text: "工具",
      icon: <Boxes class="w-6 h-6" />,
      url: "root.home_layout.tools",
    },
    {
      text: "学员",
      icon: <Users class="w-6 h-6" />,
      url: "root.home_layout.student_list",
    },
    {
      text: "我的",
      icon: <User class="w-6 h-6" />,
      url: "root.home_layout.mine",
    },
  ];

  let _route_name: PageKeys = "root.home_layout.index";
  let _state = {
    get views() {
      return props.view.subViews;
    },
    get cur_route_name() {
      return _route_name;
    },
    get has_workout_day() {
      return !!request.workout_day.fetch_started.response?.list.length;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  props.view.onSubViewsChange((v) => {
    bus.emit(Events.StateChange, { ..._state });
    // setSubViews(nextSubViews);
  });
  props.view.onCurViewChange((nextCurView) => {
    bus.emit(Events.StateChange, { ..._state });
    // setCurSubView(nextCurView);
  });
  props.history.onRouteChange(({ name }) => {
    methods.setCurMenu();
  });
  props.view.onShow(() => {
    request.workout_day.fetch_started.run();
  });
  request.workout_day.fetch_started.onStateChange(() => methods.refresh());

  return {
    methods,
    state: _state,
    get menus() {
      return _menus;
    },
    ready() {
      methods.setCurMenu();
      request.workout_day.fetch_started.run();
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeLayout: ViewComponent = (props) => {
  const [state, vm] = useViewModel(HomeLayoutViewModel, [props]);

  return (
    <div class="flex flex-col w-full h-full">
      <div class="flex-1 z-0 relative w-full h-full">
        <For each={state().views}>
          {(subView, i) => {
            const routeName = subView.name;
            const PageContent = pages[routeName as Exclude<PageKeys, "root">];
            return (
              <KeepAliveRouteView
                class={cn(
                  "absolute inset-0",
                  "data-[state=open]:animate-in data-[state=open]:fade-in",
                  "data-[state=closed]:animate-out data-[state=closed]:fade-out"
                )}
                store={subView}
                index={i()}
              >
                <PageContent
                  app={props.app}
                  client={props.client}
                  storage={props.storage}
                  pages={pages}
                  history={props.history}
                  view={subView}
                />
              </KeepAliveRouteView>
            );
          }}
        </For>
      </div>
      <div class="relative z-10 w-full border-t-w-bg-2">
        <div class="relative h-[68px]">
          <div class="flex items-center bg-w-bg-1">
            <For each={vm.menus}>
              {(menu) => {
                const { icon, text, url, badge, onClick } = menu;
                return (
                  <Menu
                    class="basis-1/3"
                    app={props.app}
                    icon={icon}
                    history={props.history}
                    highlight={(() => {
                      return state().cur_route_name === url;
                    })()}
                    url={url}
                    badge={badge}
                    onClick={onClick}
                  >
                    {text}
                  </Menu>
                );
              }}
            </For>
          </div>
        </div>
        <div class="safe-height"></div>
      </div>
      {/* <div class="fixed right-4 bottom-20">
        <div>
          <Show when={state().has_workout_day}>
            <div
              class="p-4 rounded-full bg-w-bg-5"
              onClick={() => {
                vm.methods.gotoWorkoutDayView();
              }}
            >
              <div class="text-white text-sm">进行中的训练</div>
            </div>
          </Show>
        </div>
      </div> */}
    </div>
  );
};

function Menu(
  props: Pick<ViewComponentProps, "app" | "history"> & {
    highlight?: boolean;
    url?: PageKeys;
    icon: JSX.Element;
    badge?: boolean;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const inner = (
    <div
      classList={{
        "relative flex items-center justify-center px-4 py-2 space-x-2 opacity-80 cursor-pointer": true,
        "bg-w-bg-5": props.highlight,
      }}
      onClick={props.onClick}
    >
      <div class="flex flex-col items-center text-w-fg-1">
        <div class="w-6 h-6">{props.icon}</div>
        <div class="flex-1 mt-1">
          <div class="relative inline-block">
            <div class="text-sm">{props.children}</div>
            <Show when={props.badge}>
              <div class="absolute right-[-8px] top-0 w-2 h-2 rounded-full bg-red-500" />
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <Show when={props.url} fallback={inner}>
      <div
        classList={{
          [props.class || ""]: true,
        }}
        onClick={() => {
          if (!props.url) {
            return;
          }
          props.history.push(props.url);
          // props.app.showView(props.view);
        }}
      >
        {inner}
      </div>
    </Show>
  );
}
