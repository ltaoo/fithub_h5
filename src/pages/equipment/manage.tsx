import { ViewComponentProps } from "@/store/types";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { useViewModel } from "@/hooks";
import { ScrollViewCore } from "@/domains/ui";
import { Info } from "lucide-solid";

function MyEquipmentManageViewModel(props: ViewComponentProps) {
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MyEquipmentManageView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MyEquipmentManageViewModel, [props]);
  return (
    <PageView store={vm}>
      <div class="space-y-2">
        <div class="flex gap-4 p-4 border-2 border-w-fg-3 rounded-lg text-w-fg-0">
          <Info class="w-8 h-8 text-w-fg-0" />
          <div>
            <div class="text-sm">管理自己可使用的器械，在选择健身计划时，没有的器械将会高亮提示</div>
          </div>
        </div>
      </div>
    </PageView>
  );
}
