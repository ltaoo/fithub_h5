import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PageView } from "@/components/page-view";
import { ButtonCore, InputCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { createReport } from "@/biz/report/services";
import { Result } from "@/domains/result";

function ReportCreateViewModel(props: ViewComponentProps) {
  const request = {
    report: {
      create: new RequestCore(createReport, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async create() {
      const v = ui.$input_report.value;
      if (!v) {
        const tip = "请输入反馈内容";
        return Result.Err(tip);
      }
      ui.$btn_report_submit.setLoading(true);
      const r = await request.report.create.run({
        content: v,
      });
      ui.$btn_report_submit.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      ui.$input_report.clear();
      return Result.Ok(null);
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $input_report: new InputCore({ defaultValue: "" }),
    $btn_report_submit: new ButtonCore({
      async onClick() {
        const r = await methods.create();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["反馈成功"],
        });
      },
    }),
  };
  let _state = {};
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ReportCreateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ReportCreateViewModel, [props]);

  return <PageView store={vm}></PageView>;
}
