import { For } from "solid-js";
import { ChevronLeft, Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ListView, ScrollView } from "@/components/ui";

import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { base, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchStudentList, fetchStudentListProcess } from "@/biz/student/services";

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
    gotoStudentProfileView(v: { id: number | string }) {
      props.history.push("root.student_profile", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $create_btn: new ButtonCore({
      onClick() {
        props.history.push("root.student_create");
      },
    }),
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
    <ScrollView store={vm.ui.$view}>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2">
          <div class="text-3xl">我的学员</div>
          <Button
            class="flex items-center justify-center p-2 rounded-full bg-gray-200"
            icon={<Plus class="w-6 h-6 text-gray-800" />}
            store={vm.ui.$create_btn}
          ></Button>
        </div>
        <div class="mt-8">
          <ListView store={vm.request.student.list} class="space-y-2">
            <For each={state().response.dataSource}>
              {(student) => {
                return (
                  <div
                    class="p-2 border border-rounded"
                    onClick={() => {
                      vm.methods.gotoStudentProfileView(student);
                    }}
                  >
                    <div>{student.nickname}</div>
                  </div>
                );
              }}
            </For>
          </ListView>
        </div>
      </div>
    </ScrollView>
  );
}
