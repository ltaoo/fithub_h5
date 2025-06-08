import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { createWorkoutDay } from "@/biz/workout_day/services";
import { Button } from "@/components/ui";

function FeaturePlaygroundViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      create: new RequestCore(createWorkoutDay, { _name: "create_workout_day", client: props.client, 
        onFailed() {} 
      }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickSubscription() {
      ui.$wechat.show();
    },
    handleClickWechat() {
      props.app.copy("hnust_lt");
      props.app.tip({
        text: ["微信号复制成功"],
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore(),
    $wechat: new DialogCore({}),
    $btn: new ButtonCore({
      async onClick() {
        const r = await request.workout_day.create.run({
          workout_plan_id: 0,
          student_ids: [],
          start_when_create: false,
        });
        if (r.error) {
          return;
        }
        console.log("success");
      },
    }),
  };

  let _features = ["无限次训练记录", "创建自己的训练计划", "创建自己的周期计划", "优先客服支持", "数据分析报告"];
  let _state = {
    get features() {
      return _features;
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

export function FeaturePlaygroundView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(FeaturePlaygroundViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <Button store={vm.ui.$btn}>test</Button>
      </PageView>
      <Sheet store={vm.ui.$wechat} app={props.app}></Sheet>
    </>
  );
}
