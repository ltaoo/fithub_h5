import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";
import { InputCore } from "@/domains/ui";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { SetValueInputViewModel } from "@/biz/input_set_value";

export function SetValueInput(
  props: { width?: number; store: SingleFieldCore<SetValueInputViewModel> } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [field, $field] = useViewModelStore(props.store);
  const [input, $input] = useViewModelStore(props.store.input);

  return (
    <div
      tabIndex={-1}
      classList={{
        "set-value-input relative flex items-center w-[88px] h-[36px] px-1 border-2 rounded-xl bg-w-bg-2": true,
        "border-w-fg-3": field().status === "normal",
        "border-yellow-500": field().status === "focus",
        "border-red-500 dark:border-red-800": field().status === "error",
        [props.class ?? ""]: true,
      }}
      style={{
        width: `${props.width ?? 88}px`,
      }}
      onClick={(event) => {
        if (props.onClick) {
          // @ts-ignore
          props.onClick(event);
        }
        $field.setStatus("focus");
      }}
    >
      <Show when={input().value !== ""} fallback={<div class="text-w-fg-2">{input().placeholder}</div>}>
        <div class="text-w-fg-0">{input().value}</div>
      </Show>
      <div class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-w-fg-2">{input().unit}</div>
    </div>
  );
}
