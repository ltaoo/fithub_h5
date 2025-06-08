import { ViewComponentProps } from "@/store/types";
// import { user } from '@/store/index';
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, ScrollViewCore } from "@/domains/ui";
import { __VERSION__ } from "@/constants";

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
  };
  const ui = {
    $view: new ScrollViewCore(),
    $btn_logout: new ButtonCore({
      onClick() {
        methods.logout();
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ApplicationSettingsView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ApplicationSettingsViewModel, [props]);

  return (
    <PageView store={vm}>
      <div>
        <Button class="w-full bg-w-red" store={vm.ui.$btn_logout}>
          退出登录
        </Button>
        <div class="py-2">
          <div class="text-center text-w-fg-2">{__VERSION__}</div>
        </div>
      </div>
    </PageView>
  );
}
