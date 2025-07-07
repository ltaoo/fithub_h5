import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore } from "@/domains/request";
import { HttpClientCore } from "@/domains/http_client";
import { fetchGiftCardProfile, sendGiftCard, usingGiftCard } from "@/biz/subscription/services";
import { ButtonCore, DialogCore, InputCore } from "@/domains/ui";
import { Result } from "@/domains/result";

export function GiftCardExchangeModel(props: { app: ViewComponentProps["app"]; client: HttpClientCore }) {
  const request = {
    gift_card: {
      profile: new RequestCore(fetchGiftCardProfile, { client: props.client }),
      exchange: new RequestCore(usingGiftCard, { client: props.client }),
      send: new RequestCore(sendGiftCard, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    clearGiftCardProfile() {
      ui.$input_gift_card_code.clear();
      // @ts-ignore
      request.gift_card.profile.modifyResponse(() => {
        return null;
      });
    },
    async usingGiftCard() {
      const v = ui.$input_gift_card_code.value;
      if (!v) {
        props.app.tip({
          text: ["请输入礼品码"],
        });
        return;
      }
      ui.$btn_gift_card_confirm.setLoading(true);
      const r = await request.gift_card.exchange.run({ code: v });
      ui.$btn_gift_card_confirm.setLoading(false);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      props.app.tip({
        text: ["兑换成功"],
      });
      ui.$dialog_gift_card.hide();
      methods.clearGiftCardProfile();
      bus.emit(Events.Success);
    },
    async sendGiftCard(coach: { id: number }) {
      const v = ui.$input_gift_card_code.value;
      if (!v) {
        return Result.Err("请输入礼品码");
      }
      ui.$btn_gift_card_confirm.setLoading(true);
      const r = await request.gift_card.send.run({ code: v, to_coach_id: coach.id });
      ui.$btn_gift_card_confirm.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      ui.$dialog_gift_card.hide();
      methods.clearGiftCardProfile();
      bus.emit(Events.Success);
      return Result.Ok(null);
    },
  };
  const ui = {
    $dialog_gift_card: new DialogCore({}),
    $input_gift_card_code: new InputCore({
      defaultValue: "",
      onMounted() {
        ui.$input_gift_card_code.focus();
      },
    }),
    $btn_gift_card_profile: new ButtonCore({
      async onClick() {
        const v = ui.$input_gift_card_code.value;
        if (!v) {
          props.app.tip({
            text: ["请输入礼品码"],
          });
          return;
        }
        ui.$btn_gift_card_profile.setLoading(true);
        const r = await request.gift_card.profile.run({ code: v });
        ui.$btn_gift_card_profile.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        // ui.$dialog_gift_card.hide();
        // methods.refreshMyProfile();
      },
    }),
    $btn_gift_card_confirm: new ButtonCore({
      onClick() {
        methods.usingGiftCard();
      },
    }),
  };
  let _state = {
    get gift_card() {
      return request.gift_card.profile.response;
    },
  };
  enum Events {
    Success,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Success]: void;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  request.gift_card.profile.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onSuccess(handler: Handler<TheTypesOfEvents[Events.Success]>) {
      return bus.on(Events.Success, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}
