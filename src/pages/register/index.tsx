/**
 * @file 用户注册
 */
import { ViewComponent, ViewComponentProps } from "@/store/types";
import { Button, Input } from "@/components/ui";

import { BizError } from "@/domains/error";
import { base, Handler } from "@/domains/base";
import { InputCore, ButtonCore } from "@/domains/ui";
import { useViewModel } from "@/hooks";

function RegisterViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };

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
    $input_code: new InputCore({ defaultValue: "" }),
    $btn_submit: new ButtonCore({
      async onClick() {
        ui.$btn_submit.setLoading(true);
        const r = await props.app.$user.register();
        ui.$btn_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
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
        props.history.push("root.home_layout.index");
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
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const RegisterPage = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(RegisterViewModel, [props]);

  return (
    <div class="pt-12 min-h-screen px-4 bg-w-bg-0">
      <div class="h-[160px] mx-auto">
        <div class="relative cursor-pointer">
          <div class="z-10 absolute left-14 top-[32px] w-[82%] h-[32px] rounded-xl bg-green-500"></div>
          <div class="z-20 relative text-6xl text-center italic">FamilyFlix</div>
        </div>
      </div>
      <div class="space-y-4 rounded-md">
        <div>
          <div>邮箱</div>
          <Input class="mt-1 bg-w-bg-0" store={vm.ui.$input_email} />
        </div>
        <div>
          <div>密码</div>
          <Input class="mt-1 bg-w-bg-0" store={vm.ui.$input_pwd} />
        </div>
        <div>
          <div>邀请码</div>
          <Input class="mt-1 bg-w-bg-0" store={vm.ui.$input_code} />
        </div>
      </div>
      <div class="w-full mt-4">
        <Button class="w-full" store={vm.ui.$btn_submit}>
          注册
        </Button>
        <div
          class="mt-1 py-2 text-center text-w-fg-1 cursor-pointer hover:underline"
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
