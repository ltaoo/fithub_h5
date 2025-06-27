import { InputCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

export function UserAccountForm() {
  const ui = {
    $form: new ObjectFieldCore({
      fields: {
        email: new SingleFieldCore({
          label: "邮箱",
          rules: [
            {
              required: true,
              maxLength: 30,
              minLength: 5,
              mode: "email",
            },
          ],
          input: new InputCore({ defaultValue: "", placeholder: "请输入邮箱" }),
        }),
        password: new SingleFieldCore({
          label: "密码",
          rules: [
            {
              required: true,
              maxLength: 30,
              minLength: 3,
            },
          ],
          input: new InputCore({ defaultValue: "", placeholder: "请输入密码", type: "password" }),
        }),
      },
    }),
  };
  return {
    ui,
  };
}
