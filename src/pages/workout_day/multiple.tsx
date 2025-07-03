/**
 * @file 训练计划 执行
 * 默认就是多个人，教练自己练，也算多个，只是无法切换到其他人
 */
import { For, Show } from "solid-js";
import { Bird, ChevronLeft, Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { MultipleAvatar } from "@/components/avatar/multiple";
import { Avatar } from "@/components/avatar";
import { PageView } from "@/components/page-view";
import { PageLoading } from "@/components/page-loading";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { fetchStartedWorkoutDayList, fetchStartedWorkoutDayListProcess } from "@/biz/workout_day/services";
import { RouteViewCore } from "@/domains/route_view";
import { ScrollViewCore } from "@/domains/ui";

import { WorkoutDayRecordView } from "./record";

export function WorkoutDayMultiplePersonViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      started_list: new RequestCore(fetchStartedWorkoutDayList, {
        delay: 500,
        process: fetchStartedWorkoutDayListProcess,
        client: props.client,
      }),
    },
  };
  type TheWorkoutDay = TheResponseOfRequestCore<typeof request.workout_day.started_list>["list"][number];
  type TheStudent = { id: number; nickname: string; avatar_url: string; is_self: boolean };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickStart(day: TheWorkoutDay) {
      // if (day.is_self) {
      //   props.history.replace("root.workout_day_self", {
      //     id: String(day.id),
      //     multiple: "0",
      //   });
      //   return;
      // }
      if (day.students.length === 1) {
        const v = day.students[0];
        if (v.is_self) {
          props.history.replace("root.workout_day_self", {
            id: String(day.id),
            multiple: "0",
          });
          return;
        }
      }
      for (let i = 0; i < day.students.length; i += 1) {
        const v = day.students[i];
        const view = new RouteViewCore({
          name: "",
          pathname: "",
          query: {
            id: String(v.workout_day_id),
            multiple: "1",
          },
          title: "",
        });
        _views_for_student.push(view);
        _students.push({ id: v.id, nickname: v.nickname, avatar_url: v.avatar_url, is_self: v.is_self });
      }
      _working = true;
      methods.refresh();
    },
    handleClickStudent(v: TheStudent, idx: number) {
      if (_cur_student_idx === idx) {
        return;
      }
      _cur_student_idx = idx;
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $history: props.history,
  };

  let _working = false;
  let _students: TheStudent[] = [];
  let _views_for_student: RouteViewCore[] = [];
  let _cur_student_idx = 0;
  let _state = {
    get loading() {
      return request.workout_day.started_list.loading;
    },
    get list() {
      return request.workout_day.started_list.response?.list ?? [];
    },
    get working() {
      return _working;
    },
    get views() {
      return _views_for_student;
    },
    get students() {
      return _students;
    },
    get cur_view_idx() {
      return _cur_student_idx;
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

  request.workout_day.started_list.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const r = await request.workout_day.started_list.run();
      if (r.error) {
        return;
      }
      if (props.view.query.directly_working === "1") {
        methods.handleClickStart(r.data.list[0]);
      }
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutDayMultiplePersonView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutDayMultiplePersonViewModel, [props]);

  return (
    <>
      <Show when={!state().loading} fallback={<PageLoading text="加载中"></PageLoading>}>
        <Show
          when={!state().working}
          fallback={
            <div>
              <For each={state().views}>
                {(view, idx) => {
                  return (
                    <div
                      classList={{
                        "absolute inset-0 h-screen": true,
                        "hidden ": idx() !== state().cur_view_idx,
                      }}
                    >
                      <WorkoutDayRecordView
                        app={props.app}
                        storage={props.storage}
                        pages={props.pages}
                        history={props.history}
                        client={props.client}
                        view={view}
                      />
                    </div>
                  );
                }}
              </For>
            </div>
          }
        >
          <PageView store={vm}>
            <div class="space-y-2">
              <For
                each={state().list}
                fallback={
                  <div class="w-full h-[360px] center flex items-center justify-center">
                    <div class="flex flex-col items-center justify-center text-w-fg-1">
                      <Bird class="w-24 h-24" />
                      <div class="mt-4 flex items-center space-x-2">
                        <div class="text-center text-xl">列表为空</div>
                      </div>
                    </div>
                  </div>
                }
              >
                {(v) => {
                  return (
                    <div class="p-4 rounded-lg border-2 border-w-fg-3">
                      <div class="flex">
                        <div class="px-2 rounded-full bg-green-500 text-white text-sm">已开始</div>
                      </div>
                      <div class="mt-2 text-w-fg-0">{v.title}</div>
                      <div class="flex text-w-fg-1 text-sm">
                        <div>开始时间</div>
                        <div>{v.started_at_text}</div>
                      </div>
                      <div class="flex items-center justify-between mt-4">
                        <MultipleAvatar value={v.students} />
                        <div
                          class="px-4 py-2 border-2 border-w-fg-3 bg-w-bg-5 rounded-full text-sm"
                          onClick={() => {
                            vm.methods.handleClickStart(v);
                          }}
                        >
                          继续
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </PageView>
        </Show>
        <Show when={state().students.length}>
          <div class="fixed bottom-[56px] w-full p-2">
            <div class="inline-flex items-center gap-2 rounded-full p-2 bg-w-bg-5">
              <div
                classList={{
                  "rounded-full ": true,
                }}
              >
                <div
                  class="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-w-bg-3"
                  onClick={() => {
                    vm.methods.back();
                  }}
                >
                  <ChevronLeft class="w-6 h-6 text-w-fg-0" />
                </div>
              </div>
              <For each={state().students}>
                {(s, idx) => {
                  return (
                    <div
                      classList={{
                        "rounded-full ": true,
                        "ring-2 ring-green-500": state().cur_view_idx === idx(),
                      }}
                      onClick={() => {
                        vm.methods.handleClickStudent(s, idx());
                      }}
                    >
                      <Show
                        when={!s.is_self}
                        fallback={
                          <div class="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-w-bg-2">
                            <div class="text-w-fg-0 text-sm">我</div>
                          </div>
                        }
                      >
                        <Show
                          when={s.avatar_url}
                          fallback={
                            <div class="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-w-bg-3">
                              <div class="text-w-fg-0 text-sm">{s.nickname[0]}</div>
                            </div>
                          }
                        >
                          <img class="w-[32px] h-[32px] rounded-full object-contain" src={s.avatar_url} />
                        </Show>
                      </Show>
                    </div>
                  );
                }}
              </For>
              {/* <div
              classList={{
                "rounded-full ": true,
              }}
            >
              <div>
                <div class="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-w-bg-3">
                  <Plus class="w-6 h-6 text-w-fg-0" />
                </div>
              </div>
            </div> */}
            </div>
            <div class="safe-height safe-height--no-color"></div>
          </div>
        </Show>
      </Show>
    </>
  );
}
