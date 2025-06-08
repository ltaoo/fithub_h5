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
  const request = {};
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
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

  return {
    methods,
    state: _state,
    get menus() {
      return _menus;
    },
    ready() {
      methods.setCurMenu();
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
                app={props.app}
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
      <div class="relative z-10 w-full border-t border-w-fg-3">
        <div class="relative flex items-center bg-w-bg-1 h-[48px]">
          <For each={vm.menus}>
            {(menu) => {
              const { icon, text, url, badge, onClick } = menu;
              return (
                <Menu
                  class="basis-1/3 h-full"
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
        <div class="safe-height "></div>
      </div>
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
        "relative flex items-center justify-center h-full px-4 py-1 text-w-fg-0 cursor-pointer": true,
      }}
      onClick={props.onClick}
    >
      <div class="z-10 relative flex flex-col items-center h-full">
        {/* <div class="w-6 h-6">{props.icon}</div> */}
        <div class="flex-1 mt-1">
          <div class="relative inline-block">
            <div
              classList={{
                "text-w-fg-0": props.highlight,
                "text-w-fg-1": !props.highlight,
              }}
            >
              {props.children}
            </div>
            <Show when={props.badge}>
              <div class="absolute right-[-8px] top-0 w-2 h-2 rounded-full bg-red-500" />
            </Show>
          </div>
        </div>
        <div
          classList={{
            "z-0 translate-y-[-4px] w-[32px] h-[4px]": true,
            "bg-w-fg-0": props.highlight,
          }}
        ></div>
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
