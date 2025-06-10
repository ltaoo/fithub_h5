import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { ListView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchReportList, fetchReportListProcess } from "@/biz/report/services";

function ReportListViewModel(props: ViewComponentProps) {
  const request = {
    report: {
      list: new ListCore(new RequestCore(fetchReportList, { process: fetchReportListProcess, client: props.client })),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    gotoReportProfileView(v: { id: number }) {
      props.history.push("root.report_profile", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.report.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.report.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
  };
  let _state = {
    get response() {
      return request.report.list.response;
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

  request.report.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.report.list.init();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ReportListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ReportListViewModel, [props]);

  return (
    <PageView store={vm}>
      <ListView store={vm.request.report.list} class="space-y-2">
        <For each={state().response.dataSource}>
          {(v) => {
            return (
              <div
                class="p-4 border-2 border-w-fg-3 rounded-lg"
                onClick={() => {
                  vm.methods.gotoReportProfileView(v);
                }}
              >
                <div class="text-w-fg-0">{v.content}</div>
                <div class="text-sm text-w-fg-1">{v.created_at}</div>
              </div>
            );
          }}
        </For>
      </ListView>
    </PageView>
  );
}
