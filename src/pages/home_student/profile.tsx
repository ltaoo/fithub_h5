import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";

function MemberProfileViewModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore({}),
  };

  let _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeStudentProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MemberProfileViewModel, [props]);
  return (
    <ScrollView store={vm.ui.$view}>
      <div class="flex flex-col">
        <div class="flex flex-row">
          
        </div>
      </div>
    </ScrollView>
  );
}
