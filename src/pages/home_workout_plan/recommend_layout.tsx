import { createSignal, For } from "solid-js";

import { PageKeys } from "@/store/routes";
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { KeepAliveRouteView, ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { TabHeaderCore } from "@/domains/ui/tab-header";

import { WorkoutPlanRecommendTabHeader } from "./components/recommend-tabs";

import "./recommend.css";

export function WorkoutPlanRecommendLayoutModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore(),
    $tab: new TabHeaderCore({
      options: [
        {
          id: "root.home_layout.workout_plan_layout.recommend",
          text: "推荐",
        },
        {
          id: "root.home_layout.workout_plan_layout.interval",
          text: "周期计划",
        },
        {
          id: "root.home_layout.workout_plan_layout.single",
          text: "单次计划",
        },
        {
          id: "root.home_layout.workout_plan_layout.mine",
          text: "我的计划",
        },
      ] as { id: PageKeys; text: string }[],
      onMounted() {
        ui.$tab.select(0);
        props.history.push("root.home_layout.workout_plan_layout.recommend");
      },
      onChange(value) {
        props.history.push(value.id);
      },
    }),
  };

  let _state = {
    selectedLevel: "all",
    selectedType: "all",
    searchQuery: "",
  };

  enum Events {
    StateChange,
  }

  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  const setFilter = (level: string, type: string) => {
    _state = {
      ..._state,
      selectedLevel: level,
      selectedType: type,
    };
    bus.emit(Events.StateChange, _state);
  };

  const setSearch = (query: string) => {
    _state = {
      ..._state,
      searchQuery: query,
    };
    bus.emit(Events.StateChange, _state);
  };

  return {
    ui,
    state: _state,
    setFilter,
    setSearch,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutPlanRecommendLayout(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutPlanRecommendLayoutModel, [props]);

  const [subViews, setSubViews] = createSignal(props.view.subViews);
  props.view.onSubViewsChange((v) => setSubViews(v));

  return (
    <div class="bg-white">
      <WorkoutPlanRecommendTabHeader store={vm.ui.$tab} />
      <div class="absolute inset-0 flex flex-col" style={{ top: "49px" }}>
        <For each={subViews()}>
          {(view, idx) => {
            const Page = props.pages[view.name as Exclude<PageKeys, "root">];
            return (
              <KeepAliveRouteView class="absolute inset-0" style={{ "z-index": idx() }} store={view} index={idx()}>
                <Page
                  app={props.app}
                  history={props.history}
                  storage={props.storage}
                  client={props.client}
                  pages={props.pages}
                  view={view}
                />
              </KeepAliveRouteView>
            );
          }}
        </For>
      </div>
    </div>
  );
}
