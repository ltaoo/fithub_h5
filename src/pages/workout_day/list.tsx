/**
 * @file 训练记录列表
 */
import { For, Show } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { DropdownMenu, ListView, ScrollView } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { PageView } from "@/components/page-view";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { continueWorkoutDay, fetchWorkoutDayList, fetchWorkoutDayListProcess } from "@/biz/workout_day/services";
import { WorkoutDayStatus, WorkoutDayStatusTextMap } from "@/biz/workout_day/constants";
import { RefCore } from "@/domains/ui/cur";

function WorkoutDayListViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchWorkoutDayList, {
          process: fetchWorkoutDayListProcess,
          client: props.client,
        })
      ),
      continue: new RequestCore(continueWorkoutDay, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    gotoWorkoutDayProfileView(v: { id: number }) {
      props.history.push("root.workout_day_profile", {
        id: String(v.id),
      });
    },
    handleClickWorkoutDayMore(v: { id: number }, pos: { x: number; y: number }) {
      ui.$ref.select(v);
      ui.$workout_day_menu.toggle(pos);
    },
    async handleContinueWorkout(v: { id: number }) {
      props.app.tip({
        icon: "loading",
        text: ["操作中..."],
      });
      const r = await request.workout_day.continue.run({ id: v.id });
      if (r.error) {
        return;
      }
      props.app.hideLoading();
      ui.$workout_day_menu.hide();
      props.history.push("root.workout_day_self", {
        id: String(v.id),
        multiple: "0",
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.workout_day.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.workout_day.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $history: props.history,
    $menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "补录训练记录",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.workout_day_catch_up_on");
          },
        }),
        new MenuItemCore({
          label: "增加有氧记录",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.workout_day_cardio");
          },
        }),
      ],
    }),
    $ref: new RefCore<{ id: number }>(),
    $workout_day_menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "继续",
          onClick() {
            const v = ui.$ref.value;
            if (!v) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            methods.handleContinueWorkout({ id: v.id });
          },
        }),
        new MenuItemCore({
          label: "编辑",
          onClick() {
            const v = ui.$ref.value;
            if (!v) {
              props.app.tip({
                text: ["异常操作"],
              });
              return;
            }
            ui.$workout_day_menu.hide();
            props.history.push("root.workout_day_update", {
              id: String(v.id),
            });
          },
        }),
      ],
    }),
  };
  let _state = {
    get response() {
      return request.workout_day.list.response;
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

  request.workout_day.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.workout_day.list.init();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayListViewModel, [props]);
  return (
    <>
      <PageView
        store={vm}
        operations={
          <Flex class="justify-between">
            <div></div>
            <IconButton
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </IconButton>
          </Flex>
        }
      >
        <ListView store={vm.request.workout_day.list} class="space-y-2">
          <For each={state().response.dataSource}>
            {(value) => {
              return (
                <div class="border-2 border-w-fg-3 p-4 rounded-lg">
                  <div class="text-lg text-w-fg-0">{value.title}</div>
                  <Flex class="" justify="between">
                    <div>
                      <Show when={value.status === WorkoutDayStatus.Finished}>
                        <Flex class="gap-1 text-sm text-w-fg-1">
                          <div>完成于</div>
                          <div>{value.finished_at_text}</div>
                        </Flex>
                      </Show>
                      <Show when={value.status === WorkoutDayStatus.GiveUp}>
                        <Flex class="gap-1 text-sm text-w-fg-1">
                          <div>{WorkoutDayStatusTextMap[value.status]}</div>
                        </Flex>
                      </Show>
                    </div>
                    <Flex class="gap-2" items="center">
                      <Show when={[WorkoutDayStatus.Finished, WorkoutDayStatus.GiveUp].includes(value.status)}>
                        <div
                          class="p-2 rounded-full bg-w-bg-5"
                          onClick={(event) => {
                            const { x, y } = event.currentTarget.getBoundingClientRect();
                            vm.methods.handleClickWorkoutDayMore(value, { x, y });
                          }}
                        >
                          <MoreHorizontal class="w-4 h-4 text-w-fg-0" />
                        </div>
                      </Show>
                      <div
                        class="px-4 py-1 border-2 border-w-fg-3 text-w-fg-0 bg-w-bg-5 rounded-full text-sm"
                        onClick={() => {
                          vm.methods.gotoWorkoutDayProfileView(value);
                        }}
                      >
                        详情
                      </div>
                    </Flex>
                  </Flex>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
      <DropdownMenu store={vm.ui.$workout_day_menu} />
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
