/**
 * @file 学员列表 页面
 */
import { For, Show } from "solid-js";
import { Mars, Plus, Search, Venus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input, ListView, ScrollView, Skeleton } from "@/components/ui";

import { ButtonCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { base, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchStudentList, fetchStudentListProcess } from "@/biz/student/services";
import { HumanGenderType } from "@/biz/student/constants";

function HomeStudentListPageViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      list: new ListCore(new RequestCore(fetchStudentList, { process: fetchStudentListProcess, client: props.client })),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    search() {
      const v = ui.$input_search.value;
      request.student.list.search({ keyword: v });
    },
    gotoStudentProfileView(v: { id: number | string }) {
      props.history.push("root.student_profile", {
        id: String(v.id),
      });
    },
    gotoStudentCreateView() {
      props.history.push("root.student_create");
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.student.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.student.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $create_btn: new ButtonCore({
      onClick() {
        props.history.push("root.student_create");
      },
    }),
    $input_search: new InputCore({ defaultValue: "" }),
  };
  let _state = {
    get response() {
      return request.student.list.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.student.list.onStateChange(() => methods.refresh());

  return {
    state: _state,
    ui,
    request,
    methods,
    ready() {
      request.student.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeStudentListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeStudentListPageViewModel, [props]);

  return (
    <>
      <div>
        <div class="flex items-center justify-between gap-2 p-2">
          {/* <div class="text-xl text-w-fg-0"></div> */}
          <Input class="w-full" store={vm.ui.$input_search} />
          <div
            class="p-2 rounded-full bg-w-bg-5"
            onClick={() => {
              vm.methods.search();
            }}
          >
            <Search class="w-6 h-6 text-w-fg-0" />
          </div>
          <div
            class="p-2 rounded-full bg-w-bg-5"
            onClick={() => {
              vm.methods.gotoStudentCreateView();
            }}
          >
            <Plus class="w-6 h-6 text-w-fg-0" />
          </div>
        </div>
      </div>
      <div class="absolute top-[56px] bottom-0 w-full">
        <ScrollView store={vm.ui.$view} class="scroll--hidden">
          <div class="p-2">
            <ListView
              store={vm.request.student.list}
              class="space-y-2"
              skeleton={
                <>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <Skeleton class="w-[32px] h-[24px]" />
                  </div>
                </>
              }
            >
              <For each={state().response.dataSource}>
                {(student) => {
                  return (
                    <div
                      class="p-4 rounded-lg border-2 border-w-fg-3"
                      onClick={() => {
                        vm.methods.gotoStudentProfileView(student);
                      }}
                    >
                      <div class="flex items-center gap-2">
                        <div
                          class="rounded-full w-[48px] h-[48px] bg-w-bg-5"
                          style={{
                            "background-image": `url('${student.avatar_url}')`,
                            "background-size": "cover",
                            "background-position": "center",
                          }}
                        ></div>
                        <div class="space-y-1">
                          <div class="text-w-fg-0">{student.nickname}</div>
                          <Show when={student.gender === HumanGenderType.Female}>
                            <Venus class="w-3 h-3 text-pink-500" />
                          </Show>
                          <Show when={student.gender === HumanGenderType.Male}>
                            <Mars class="w-4 h-4 text-blue-500" />
                          </Show>
                        </div>
                      </div>
                      <div class="flex items-center justify-between">
                        <div></div>
                        <div class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full">
                          <div class="text-sm text-w-fg-0">详情</div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </ListView>
          </div>
        </ScrollView>
      </div>
    </>
  );
}
