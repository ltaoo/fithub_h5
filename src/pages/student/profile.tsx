/**
 * @file 学员详情
 */
import { Edit } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchStudentList, fetchStudentProfile } from "@/biz/student/services";

function MemberProfileViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      profile: new RequestCore(fetchStudentProfile),
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
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
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

export function HomeStudentProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MemberProfileViewModel, [props]);
  return (
    <>
      <ScrollView store={vm.ui.$view}>
        <NavigationBar1 title="" history={props.history} />
        <div class="relative p-4">
          <div>
            <div></div>
            <div></div>
          </div>
          <div class="relative">
            <div class="absolute right-2 top-2">
              <div class="p-2 rounded-full bg-gray-200">
                <Edit class="w-4 h-4 text-gray-800" />
              </div>
            </div>
            <div class="text-xl">身体信息</div>
          </div>
          <div>
            <div class="text-xl">问卷调查</div>
          </div>
          <div>
            <div class="text-xl">训练统计</div>
          </div>
          <div>
            <div class="text-xl">训练记录</div>
          </div>
        </div>
      </ScrollView>
    </>
  );
}
