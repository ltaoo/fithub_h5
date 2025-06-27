/**
 * @file 用户注册
 */
import { ViewComponent, ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { InputCore, ButtonCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { UserAccountForm } from "@/biz/user/account_form";

function RegisterViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };

  const ui = {
    $form: UserAccountForm().ui.$form,
    $input_code: new InputCore({ defaultValue: "" }),
    $btn_submit: new ButtonCore({
      async onClick() {
        const r = await ui.$form.validate();
        if (r.error) {
          props.app.tip({ text: r.error.messages });
          return;
        }
        const values = r.data;
        props.app.$user.inputEmail(values.email);
        props.app.$user.inputPassword(values.password);
        ui.$btn_submit.setLoading(true);
        const r2 = await props.app.$user.register();
        ui.$btn_submit.setLoading(false);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["注册成功"],
        });
      },
    }),
    $btn_home: new ButtonCore({
      onClick() {
        props.history.destroyAllAndPush("root.home_layout.index");
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
    ui,
    methods,
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

export const RegisterPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(RegisterViewModel, [props]);

  return (
    <div class="pt-12 min-h-screen px-4">
      <div class="h-[160px] mx-auto">
        <div class="relative cursor-pointer">
          <div class="z-20 relative text-6xl text-center italic">Fit Hub</div>
        </div>
      </div>
      <div class="space-y-4 rounded-md text-w-fg-0">
        <div>
          <div>邮箱</div>
          <Input class="mt-1" store={vm.ui.$form.fields.email.input} />
        </div>
        <div>
          <div>密码</div>
          <Input class="mt-1" store={vm.ui.$form.fields.password.input} />
        </div>
        {/* <div>
          <div>邀请码</div>
          <Input class="mt-1" store={vm.ui.$input_code} />
        </div> */}
      </div>
      <div class="w-full mt-8">
        <Button class="w-full" store={vm.ui.$btn_submit}>
          注册
        </Button>
        <div
          class="mt-1 py-2 text-center text-sm text-w-fg-1 cursor-pointer hover:underline"
          onClick={() => {
            props.history.push("root.login");
          }}
        >
          已有账号，前往登录
        </div>
        {props.app.$user.isLogin ? (
          <div class="mt-2">
            <Button class="w-full" variant="subtle" store={vm.ui.$btn_home}>
              前往首页
            </Button>
            <div class="mt-1 text-sm text-w-fg-2 text-center">检测到当前已登录</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
