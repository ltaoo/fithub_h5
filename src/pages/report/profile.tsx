import { Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { cancelReport, deleteReport, fetchReportProfile, fetchReportProfileProcess } from "@/biz/report/services";
import { Loader2 } from "lucide-solid";
import { Button } from "@/components/ui";
import { Result } from "@/domains/result";

function ReportProfileViewModel(props: ViewComponentProps) {
  const request = {
    report: {
      profile: new RequestCore(fetchReportProfile, { process: fetchReportProfileProcess, client: props.client }),
      cancel: new RequestCore(cancelReport, { client: props.client }),
      delete: new RequestCore(deleteReport, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async cancelReport() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        const tip = "参数错误";
        return Result.Err(tip);
      }
      ui.$btn_cancel.setLoading(true);
      const r = await request.report.cancel.run({ id });
      ui.$btn_cancel.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      return Result.Ok(null);
    },
    async deleteReport() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        const tip = "参数错误";
        return Result.Err(tip);
      }
      ui.$btn_delete.setLoading(true);
      const r = await request.report.delete.run({ id });
      ui.$btn_delete.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      return Result.Ok(null);
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $btn_cancel: new ButtonCore({
      async onClick() {
        const r = await methods.cancelReport();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        request.report.profile.reload();
      },
    }),
    $btn_delete: new ButtonCore({
      async onClick() {
        const r = await methods.deleteReport();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["删除成功"],
        });
        props.history.back();
      },
    }),
  };
  let _state = {
    get loading() {
      return request.report.profile.loading;
    },
    get profile() {
      return request.report.profile.response;
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

  request.report.profile.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        return;
      }
      request.report.profile.run({ id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ReportProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ReportProfileViewModel, [props]);

  return (
    <PageView
      store={vm}
      operations={
        <div class="flex">
          <Button class="w-full" store={vm.ui.$btn_cancel}>
            撤销
          </Button>
        </div>
      }
    >
      <Show when={state().loading}>
        <div class="flex justify-center">
          <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
        </div>
      </Show>
      <Show when={state().profile}>
        <div class="p-4">
          <div class="text-xl text-w-fg-0">{state().profile?.content}</div>
          <div class="text-w-fg-1">{state().profile?.created_at}</div>
        </div>
        <Show
          when={state().profile?.reply_content}
          fallback={
            <div class="p-4 border-2 border-w-fg-3 rounded-lg">
              <div class="text-center text-w-fg-1">暂无回复</div>
            </div>
          }
        >
          <div class="p-4 border-2 border-w-fg-3">{state().profile?.reply_content}</div>
        </Show>
      </Show>
    </PageView>
  );
}
