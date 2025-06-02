/**
 * @file 用户登录
 */
import { ViewComponent, ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Input } from "@/components/ui";
import { base, Handler } from "@/domains/base";
import { ButtonCore, InputCore } from "@/domains/ui";

function LoginViewModel(props: ViewComponentProps) {
  const ui = {
    $input_email: new InputCore({
      defaultValue: "",
      placeholder: "请输入邮箱",
      onChange(v) {
        props.app.$user.inputEmail(v);
      },
    }),
    $input_pwd: new InputCore({
      defaultValue: "",
      type: "password",
      placeholder: "请输入密码",
      onChange(v) {
        props.app.$user.inputPassword(v);
      },
    }),
    $btn_submit: new ButtonCore({
      async onClick() {
        ui.$btn_submit.setLoading(true);
        await props.app.$user.login();
        ui.$btn_submit.setLoading(false);
      },
    }),
    $btn_goto_home: new ButtonCore({
      async onClick() {
        props.history.push("root.home_layout.index");
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LoginPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(LoginViewModel, [props]);

  return (
    <div class="pt-12 px-4 min-h-screen">
      <div class="h-[160px] mx-auto">
        <div class="relative cursor-pointer">
          <div class="z-20 relative text-6xl text-center italic">Fit Hub</div>
        </div>
      </div>
      <div class="space-y-4 rounded-md">
        <div>
          <div>邮箱</div>
          <Input class="mt-1" store={vm.ui.$input_email} />
        </div>
        <div>
          <div>密码</div>
          <Input class="mt-1" store={vm.ui.$input_pwd} />
        </div>
      </div>
      <div class="w-full mt-8">
        <Button class="w-full" store={vm.ui.$btn_submit}>
          登录
        </Button>
        <div
          class="mt-1 py-2 text-center text-w-fg-1 cursor-pointer hover:underline"
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
