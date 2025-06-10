import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button, ListView, ScrollView } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import {
  fetchSubscriptionList,
  fetchSubscriptionListProcess,
  fetchSubscriptionPlanList,
  fetchSubscriptionPlanListProcess,
} from "@/biz/subscription/services";
import { ListCore } from "@/domains/list";
import { Result } from "@/domains/result";

function MineSubscriptionViewModel(props: ViewComponentProps) {
  const request = {
    subscription_plan: {
      list: new RequestCore(fetchSubscriptionPlanList, {
        process: fetchSubscriptionPlanListProcess,
        client: props.client,
      }),
    },
    subscription: {
      list: new ListCore(
        new RequestCore(fetchSubscriptionList, {
          process: fetchSubscriptionListProcess,
          client: props.client,
        })
      ),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async ready() {
      await request.subscription.list.init();
      return Result.Ok(null);
    },
    showDialogSubscriptionPlanChoices(plan: { id: number }) {
      const resp = request.subscription_plan.list.response;
      if (!resp) {
        return;
      }
      const matched = resp.list.find((v) => {
        return v.id === plan.id;
      });
      if (!matched) {
        return;
      }
      _cur_plan = matched;
      ui.$dialog_choices.show();
      methods.refresh();
    },
    selectChoice(choice: { value: string }) {
      _selected_choice_value = choice.value;
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await methods.ready();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.subscription.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $dialog_choices: new DialogCore({}),
    $btn_order_confirm: new ButtonCore({
      onClick() {
        const plan = _cur_plan;
        if (!plan) {
          props.app.tip({
            text: ["请选择订阅"],
          });
          return;
        }
      },
    }),
  };

  let _cur_plan: TheResponseOfRequestCore<typeof request.subscription_plan.list>["list"][number] | null = null;
  let _selected_choice_value = "month";
  let _state = {
    get subscription() {
      return request.subscription.list.response;
    },
    get subscription_plans() {
      return request.subscription_plan.list.response ? request.subscription_plan.list.response.list : [];
    },
    get selected_plan() {
      return _cur_plan
        ? {
            name: _cur_plan.name,
            choices: _cur_plan.choices.map((choice) => {
              return {
                ...choice,
                selected: choice.value === _selected_choice_value,
              };
            }),
          }
        : {};
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

  request.subscription.list.onStateChange(() => methods.refresh());
  request.subscription_plan.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    async ready() {
      methods.ready();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MineSubscriptionView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MineSubscriptionViewModel, [props]);
  return (
    <>
      <PageView store={vm}>
        <ListView store={vm.request.subscription.list} class="space-y-2">
          <For each={state().subscription.dataSource}>
            {(v) => {
              return (
                <div class="relative p-4 border-2 border-w-fg-3 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="text-lg text-w-fg-0">{v.text}</div>
                    <div class="text-w-fg-0 text-sm">{v.status_text}</div>
                  </div>
                  <div class="text-sm text-w-fg-1">{v.created_at}</div>
                  <div class="text-w-fg-2">{v.reason}</div>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
      <Sheet store={vm.ui.$dialog_choices} app={props.app}>
        <div class="p-2">
          <div class="text-xl text-center">{state().selected_plan.name}</div>
          <Show when={state().selected_plan}>
            <div class="flex items-center gap-2 mt-4">
              <For each={state().selected_plan.choices}>
                {(choice) => {
                  return (
                    <div
                      class=""
                      classList={{
                        "flex-1 p-4 rounded-lg border-2 border-w-fg-3 text-w-fg-0": true,
                        "border-w-fg-2": choice.selected,
                      }}
                      onClick={() => {
                        vm.methods.selectChoice(choice);
                      }}
                    >
                      <div class="text-lg">{choice.title}</div>
                      <div class="text-w-fg-1">{choice.price_text}</div>
                    </div>
                  );
                }}
              </For>
            </div>
            <div class="mt-2">
              <Button class="w-full" store={vm.ui.$btn_order_confirm}>
                购买
              </Button>
            </div>
          </Show>
          <div class="safe-height"></div>
        </div>
      </Sheet>
    </>
  );
}
