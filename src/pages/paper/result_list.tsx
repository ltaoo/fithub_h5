import { For, Show } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { DropdownMenu, ListView, Skeleton } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchExamList, fetchExamListProcess, fetchPaperList, fetchRunningExam, startExam } from "@/biz/paper/services";
import { Result } from "@/domains/result";
import { Sheet } from "@/components/ui/sheet";

function PaperResultListViewModel(props: ViewComponentProps) {
  const request = {
    exam: {
      list: new ListCore(new RequestCore(fetchExamList, { process: fetchExamListProcess, client: props.client })),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    gotoExamResultView(v: { id: number }) {
      props.history.push("root.exam_result", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.exam.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.exam.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };
  let _state = {
    get response() {
      return request.exam.list.response;
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

  request.exam.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.exam.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function PaperResultListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(PaperResultListViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <ListView
          store={vm.request.exam.list}
          skeleton={
            <div class="p-4 border-2 border-w-bg-5 rounded-lg">
              <Skeleton class="w-[68px] h-[24px]" />
            </div>
          }
        >
          <For each={state().response.dataSource}>
            {(v) => {
              return (
                <div class="p-4 border-2 border-w-bg-5 rounded-lg">
                  <div class="text-w-fg-0">{v.name}</div>
                  <div class="flex mt-2">
                    <div class="px-2 py-1 rounded-full border-2 border-w-bg-5 text-sm">{v.status_text}</div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div></div>
                    <div
                      class="px-4 py-1 border-2 border-w-bg-5 bg-w-bg-5 rounded-full"
                      onClick={() => {
                        vm.methods.gotoExamResultView(v);
                      }}
                    >
                      <div class="text-sm text-w-fg-0">详情</div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
    </>
  );
}
