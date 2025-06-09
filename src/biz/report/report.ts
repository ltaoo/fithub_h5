import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore } from "@/domains/request";
import { Result } from "@/domains/result";
import { ButtonCore, DialogCore, InputCore } from "@/domains/ui";
import { HttpClientCore } from "@/domains/http_client";

import { createReport } from "./services";

export function ReportModel(props: Pick<ViewComponentProps, "app" | "client">) {
  const request = {
    report: {
      create: new RequestCore(createReport, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    async create() {
      const v = ui.$input_report.value;
      if (!v) {
        return Result.Err("请输入反馈内容");
      }
      ui.$btn_report_submit.setLoading(true);
      const r = await request.report.create.run({
        content: v,
      });
      ui.$btn_report_submit.setLoading(false);
      if (r.error) {
        return Result.Err(r.error);
      }
      ui.$input_report.clear();
      ui.$dialog_report.hide();
      return Result.Ok(null);
    },
  };
  const ui = {
    $dialog_report: new DialogCore(),
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
        ui.$input_report.clear();
        props.app.tip({
          text: ["反馈成功"],
        });
        ui.$dialog_report.hide();
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
