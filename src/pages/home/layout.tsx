/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal } from "solid-js";
import { Users, Home, Tv } from "lucide-solid";

import { ViewComponent, ViewComponentProps } from "@/store/types";
import { PageKeys } from "@/store/routes";
import { Show } from "@/packages/ui/show";
import { KeepAliveRouteView } from "@/components/ui";
import { cn } from "@/utils/index";

function Page(props: ViewComponentProps) {
  const { app, history, client, storage, pages, view } = props;
}

export const HomeLayout: ViewComponent = (props) => {
  const { app, history, client, storage, pages, view } = props;

  const [curSubView, setCurSubView] = createSignal(view.curView);
  const [subViews, setSubViews] = createSignal(view.subViews);

  view.onSubViewsChange((nextSubViews) => {
    setSubViews(nextSubViews);
  });
  view.onCurViewChange((nextCurView) => {
    setCurSubView(nextCurView);
  });

  const [menus, setMenus] = createSignal<
    { text: string; icon: JSX.Element; badge?: boolean; url?: PageKeys; onClick?: () => void }[]
  >([
    {
      text: "首页",
      icon: <Home class="w-6 h-6" />,
      url: "root.home_layout.index",
    },
    {
      text: "训练计划列表",
      icon: <Tv class="w-6 h-6" />,
      url: "root.home_layout.workout_plan_list",
    },
    {
      text: "学员列表",
      icon: <Users class="w-6 h-6" />,
      url: "root.home_layout.student_list",
    },
  ]);
  const [curRouteName, setCurRouteName] = createSignal(history.$router.name);

  history.onRouteChange(({ name }) => {
    setCurRouteName(name);
  });

  return (
    <div class="flex flex-col w-full h-full">
      <div class="flex-1 relative w-full h-full">
        <For each={subViews()}>
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
                  app={app}
                  client={client}
                  storage={storage}
                  pages={pages}
                  history={history}
                  view={subView}
                />
              </KeepAliveRouteView>
            );
          }}
        </For>
      </div>
      <div class="w-full h-[64px] border border-t-slate-300">
        {/* <div
            class="absolute z-50 right-12 bottom-12"
            onClick={() => {
              history.push("root.home_layout.workout_day");
            }}
          >
            <div class="px-4 py-2 border border-slate-300 rounded-xl cursor-pointer">开始训练</div>
          </div> */}
        <div class="flex items-center justify-evenly">
          <For each={menus()}>
            {(menu) => {
              const { icon, text, url, badge, onClick } = menu;
              return (
                <Menu
                  app={app}
                  icon={icon}
                  history={history}
                  highlight={(() => {
                    return curRouteName() === url;
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
      class={cn(
        "relative flex items-center px-4 py-2 space-x-2 opacity-80 cursor-pointer hover:bg-slate-300",
        props.highlight ? "bg-slate-200" : ""
      )}
      onClick={props.onClick}
    >
      <div class="flex flex-col items-center">
        <div class="w-6 h-6">{props.icon}</div>
        <div class="flex-1 text-slate-800">
          <div class="relative inline-block">
            {props.children}
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
