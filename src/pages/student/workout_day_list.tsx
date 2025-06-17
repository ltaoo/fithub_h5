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
import { fetchStudentWorkoutDayList, fetchStudentWorkoutDayListProcess } from "@/biz/student/services";
import { toNumber } from "@/utils/primitive";

function StudentWorkoutDayListViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      list: new ListCore(
        new RequestCore(fetchStudentWorkoutDayList, {
          process: fetchStudentWorkoutDayListProcess,
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
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
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
          label: "补录",
          onClick() {
            ui.$menu.hide();
            props.history.push("root.workout_day_catch_up_on");
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
      const student_id = toNumber(props.view.query.student_id);
      if (student_id === null) {
        return;
      }
      request.workout_day.list.init({ id: student_id });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function StudentWorkoutDayListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(StudentWorkoutDayListViewModel, [props]);
  return (
    <>
      <PageView
        store={vm}
        // operations={
        //   <Flex class="justify-between">
        //     <div></div>
        //     <IconButton
        //       onClick={(event) => {
        //         const { x, y } = event.currentTarget.getBoundingClientRect();
        //         vm.ui.$menu.toggle({ x, y });
        //       }}
        //     >
        //       <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
        //     </IconButton>
        //   </Flex>
        // }
      >
        <ListView store={vm.request.workout_day.list} class="space-y-2">
          <For each={state().response.dataSource}>
            {(value) => {
              return (
                <div class="border-2 border-w-fg-3 p-4 rounded-lg">
                  <div class="text-lg text-w-fg-0">{value.workout_plan.title}</div>
                  <div class="text-w-fg-1">{value.started_at_text}</div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm text-w-fg-1">{WorkoutDayStatusTextMap[value.status]}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Show when={[WorkoutDayStatus.Finished, WorkoutDayStatus.GiveUp].includes(value.status)}>
                        <div
                          class="p-2 rounded-full bg-w-bg-5"
                          onClick={(event) => {
                            const { x, y } = event.currentTarget.getBoundingClientRect();
                            vm.methods.handleClickWorkoutDayMore(value, { x, y });
                          }}
                        >
                          <MoreHorizontal class="w-4 h-4 text-w-fg-1" />
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
                    </div>
                  </div>
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
