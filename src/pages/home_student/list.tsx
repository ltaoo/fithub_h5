import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, ListView, ScrollView } from "@/components/ui";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { base, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchStudentList } from "@/biz/student/services";
import { Plus } from "lucide-solid";

function HomeStudentListPageViewModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore(),
    $create_btn: new ButtonCore({
      onClick() {
        props.history.push("root.student_create");
      },
    }),
  };
  const request = {
    student: {
      list: new ListCore(new RequestCore(fetchStudentList, { client: props.client })),
    },
  };
  const methods = {};
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

  return {
    state: _state,
    ui,
    request,
    methods,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeStudentListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeStudentListPageViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="p-4">
      <div class="flex items-center justify-between gap-2">
        <div class="text-2xl font-bold">我的学员</div>
        <Button variant="subtle" store={vm.ui.$create_btn}>
          <Plus class="w-6 h-6" />
        </Button>
      </div>
      <div class="py-4">
        <ListView store={vm.request.student.list} class="space-y-2">
          <For each={state().response.dataSource}>{(student) => <div>{student.name}</div>}</For>
        </ListView>
      </div>
    </ScrollView>
  );
}
