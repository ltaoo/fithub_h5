/**
 * @file 健身动作列表
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ListView, ScrollView } from "@/components/ui";
import { fetchWorkoutActionList, fetchWorkoutActionListProcess } from "@/biz/workout_action/services";
import { base, Handler } from "@/domains/base";
import { ButtonCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import { Select } from "@/components/ui/select";
import { WorkoutActionType, WorkoutActionTypeOptions } from "@/biz/workout_action/constants";

function HomeActionListPageViewModel(props: ViewComponentProps) {
  let _state = {
    get response() {
      return request.action.list.response;
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $type_select: new SelectCore({
      defaultValue: WorkoutActionType.RESISTANCE,
      options: WorkoutActionTypeOptions,
      onChange(v) {
        request.action.list.search({ type: v });
      },
    }),
    $keyword_input: new InputCore({
      defaultValue: "",
    }),
    $search_reset: new ButtonCore({
      onClick() {
        ui.$keyword_input.reset();
        request.action.list.reset();
      },
    }),
    $search_submit: new ButtonCore({
      async onClick() {
        const v = ui.$keyword_input.value;
        if (!v) {
          props.app.tip({
            text: ["请输入关键词"],
          });
          return;
        }
        ui.$search_submit.setLoading(true);
        const r = await request.action.list.search({ keyword: v });
        ui.$search_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
      },
    }),
    $goto_create_btn: new ButtonCore({
      onClick() {
        props.history.push("root.home_layout.action_create");
      },
    }),
  };
  const request = {
    action: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionList, { process: fetchWorkoutActionListProcess, client: props.client })
      ),
    },
  };
  const methods = {
    handleClickAction(action: { id: string | number }) {
      props.history.push("root.home_layout.action_update", { id: action.id.toString() });
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  request.action.list.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });
  ui.$view.onReachBottom(async () => {
    await request.action.list.loadMore();
    ui.$view.finishLoadingMore();
  });

  return {
    state: _state,
    ui,
    request,
    methods,
    ready() {
      request.action.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeActionListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeActionListPageViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="p-4">
      <h1 class="text-2xl font-bold mb-4">动作列表</h1>
      <div class="flex items-center gap-2 mt-2">
        <Button store={vm.ui.$search_reset}>重置</Button>
        <Button store={vm.ui.$goto_create_btn}>新增动作</Button>
      </div>
      <div class="mt-2">
        <div class="flex items-center gap-2">
          <div class="w-[180px]">
            <Select store={vm.ui.$type_select} />
          </div>
          <Input class="flex-1" store={vm.ui.$keyword_input} />
          <Button class="w-[120px]" store={vm.ui.$search_submit}>
            搜索
          </Button>
        </div>
        <div></div>
      </div>
      <div class="py-4">
        <ListView store={vm.request.action.list}>
          <div class="space-y-2">
            <For each={state().response.dataSource}>
              {(action) => (
                <div
                  class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                  onClick={() => {
                    vm.methods.handleClickAction(action);
                  }}
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">{action.zh_name}</h3>
                      <p class="text-gray-600">{action.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </ListView>
      </div>
    </ScrollView>
  );
}
