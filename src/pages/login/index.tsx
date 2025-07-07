/**
 * @file 用户登录
 */
import { ViewComponent, ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { ButtonCore, InputCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { Result } from "@/domains/result";
import { UserAccountForm } from "@/biz/user/account_form";

function LoginViewModel(props: ViewComponentProps) {
  const ui = {
    $form: UserAccountForm().ui.$form,
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
        await props.app.$user.login();
        ui.$btn_submit.setLoading(false);
      },
    }),
    $btn_goto_home: new ButtonCore({
      async onClick() {
        props.history.destroyAllAndPush("root.home_layout.index");
      },
    }),
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
    state: _state,
    ui,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LoginPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(LoginViewModel, [props]);

  return (
    <div class="pt-12 px-4 h-w-screen">
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
      </div>
      <div class="w-full mt-8">
        <Button class="w-full" store={vm.ui.$btn_submit}>
          登录
        </Button>
        <div
          class="mt-1 py-2 text-center text-sm text-w-fg-1 cursor-pointer hover:underline"
          onClick={() => {
            props.history.push("root.register");
          }}
        >
          没有账号，前往注册
        </div>
        {props.app.$user.isLogin ? (
          <div class="mt-2">
            <Button class="w-full" variant="subtle" store={vm.ui.$btn_goto_home}>
              前往首页
            </Button>
            <div class="mt-1 text-sm text-w-fg-2 text-center">检测到当前已登录</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
