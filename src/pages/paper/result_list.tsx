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
import { Result } from "@/domains/result";
import { fetchExamList, fetchExamListProcess, fetchPaperList, fetchRunningExam, startExam } from "@/biz/paper/services";

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
    $history: props.history,
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
    destroy() {
      bus.destroy();
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
          class="space-y-2"
          store={vm.request.exam.list}
          skeleton={
            <div class="p-4 border-2 border-w-fg-3 rounded-lg">
              <Skeleton class="w-[68px] h-[24px]" />
            </div>
          }
        >
          <For each={state().response.dataSource}>
            {(v) => {
              return (
                <div class="p-4 border-2 border-w-fg-3 rounded-lg">
                  <div class="text-w-fg-0">{v.name}</div>
                  <div class="flex">
                    <div class="text-sm text-w-fg-1">{v.status_text}</div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="text-w-fg-1 text-sm">{v.started_at}</div>
                    <div
                      class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full"
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
