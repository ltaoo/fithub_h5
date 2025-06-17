import { ChevronRight } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
// import { user } from '@/store/index';
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button, Textarea } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { __VERSION__ } from "@/constants";
import { Sheet } from "@/components/ui/sheet";
import { ReportModel } from "@/biz/report/report";
import { ThemeTypes } from "@/domains/app/types";

function ApplicationSettingsViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    logout() {
      props.app.$user.logout();
    },
    handleClickWechat() {
      props.app.copy("hnust_lt");
      props.app.tip({
        text: ["复制成功"],
      });
    },
    handleThemeChange(theme: ThemeTypes) {
      props.app.setTheme(theme);
      ui.$theme_dialog.hide();
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $history: props.history,
    $btn_logout: new ButtonCore({
      onClick() {
        methods.logout();
      },
    }),
    $report: ReportModel({ app: props.app, client: props.client }),
    $wechat: new DialogCore(),
    $theme_dialog: new DialogCore(),
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

export function ApplicationSettingsView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ApplicationSettingsViewModel, [props]);

  return (
    <>
      <PageView no_padding store={vm}>
        <div>
          {/* <div class="pt-2">
            <div
              class="p-4 bg-w-bg-3"
              onClick={() => {
                vm.ui.$theme_dialog.show();
              }}
            >
              <div class="flex items-center justify-between">
                <div class="text-w-fg-0">{props.app.theme}主题色切换</div>
                <div>
                  <ChevronRight class="w-6 h-6 text-w-fg-1" />
                </div>
              </div>
            </div>
          </div> */}
          <div class="pt-2">
            <div
              class="p-4 bg-w-bg-3"
              onClick={() => {
                vm.ui.$report.ui.$dialog_report.show();
              }}
            >
              <div class="flex items-center justify-between">
                <div class="text-w-fg-0">问题反馈</div>
                <div>
                  <ChevronRight class="w-6 h-6 text-w-fg-1" />
                </div>
              </div>
            </div>
            <div
              class="relative p-4 bg-w-bg-3"
              onClick={() => {
                vm.ui.$wechat.show();
              }}
            >
              <div class="absolute top-0 left-4 right-0 bg-w-fg-3 h-[1px]"></div>
              <div class="flex items-center justify-between">
                <div class="text-w-fg-0">联系我</div>
                <div>
                  <ChevronRight class="w-6 h-6 text-w-fg-1" />
                </div>
              </div>
            </div>
          </div>
          <div class="pt-2">
            <div
              class="relative p-4 bg-w-bg-3"
              onClick={() => {
                vm.methods.logout();
              }}
            >
              <div class="flex items-center justify-center">
                <div class="text-center text-w-fg-0">退出登录</div>
              </div>
            </div>
          </div>
          <div class="py-2">
            <div class="text-center text-w-fg-2">{__VERSION__}</div>
          </div>
        </div>
      </PageView>
      <Sheet store={vm.ui.$report.ui.$dialog_report} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center text-w-fg-0">问题反馈</div>
          <div class="mt-4">
            <Textarea store={vm.ui.$report.ui.$input_report} />
          </div>
          <div class="mt-2">
            <Button class="w-full" store={vm.ui.$report.ui.$btn_report_submit}>
              提交
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$wechat} app={props.app}>
        <div class="p-4 flex flex-col items-center">
          <div class="text-xl text-w-fg-0">添加微信好友</div>
          <div
            class="mt-4 w-[60%] aspect-square rounded-xl"
            style={{
              "background-image": `url('https://static.ltaoo.work/litao-qrcode.png')`,
              "background-size": "cover",
              "background-position": "center",
            }}
            onClick={() => {
              vm.methods.handleClickWechat();
            }}
          ></div>
          <div class="mt-2 text-sm text-w-fg-1">点击复制微信号</div>
        </div>
      </Sheet>
    </>
  );
}
