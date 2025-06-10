import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { Sheet } from "@/components/ui/sheet";

function SubscriptionOrderViewModel(props: ViewComponentProps) {
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
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function SubscriptionOrderView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(SubscriptionOrderViewModel, [props]);

  return (
    <>
      <PageView store={vm} no_extra_bottom>
        <div class="bg-w-bg-0">
          <div class="w-[80vw] mx-auto">
            {/* 标题区域 */}
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-w-fg-0">订阅VIP</h2>
              <p class="mt-2 text-w-fg-1">解锁全部高级功能</p>
            </div>

            {/* 价格卡片 */}
            <div class="bg-w-bg-5 rounded-2xl shadow-lg overflow-hidden">
              {/* 价格区域 */}
              <div class="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-w-fg-0">
                <div class="flex items-center justify-center space-x-2">
                  <span class="text-4xl font-bold">¥9.9</span>
                  <span class="text-lg">/月</span>
                </div>
                <div class="mt-2 text-center">
                  <span class="text-sm line-through opacity-75">原价 ¥12/月</span>
                </div>
              </div>

              {/* 功能列表 */}
              <div class="p-6">
                <h3 class="text-lg font-semibold text-w-fg-0 mb-4">VIP特权</h3>
                <ul class="space-y-3">
                  {state().features.map((feature) => (
                    <li class="flex items-start">
                      <svg
                        class="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="ml-3 text-w-fg-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 订阅按钮 */}
              <div
                class="px-6 pb-6"
                onClick={() => {
                  vm.methods.handleClickSubscription();
                }}
              >
                <button class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors">
                  立即订阅
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageView>
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
          <div class="text-sm text-w-fg-1">点击复制微信号</div>
          <div class="mt-2 text-w-fg-0">添加时请备注「订阅」</div>
        </div>
      </Sheet>
    </>
  );
}
