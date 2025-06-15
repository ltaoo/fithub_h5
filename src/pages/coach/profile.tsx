import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchCoachProfile } from "@/biz/coach/service";

function CoachProfileViewModel(props: ViewComponentProps) {
  const request = {
    coach: {
      profile: new RequestCore(fetchCoachProfile, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
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

export function CoachProfileView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(CoachProfileViewModel, [props]);

  return (
    <PageView store={vm}>
      <div></div>
    </PageView>
  );
}
