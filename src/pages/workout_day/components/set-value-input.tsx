import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";
import { InputCore } from "@/domains/ui";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { SetValueInputViewModel } from "@/biz/set_value_input";

export function SetValueInput(
  props: { store: SingleFieldCore<SetValueInputViewModel> } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [field, $field] = useViewModelStore(props.store);
  const [input, $input] = useViewModelStore(props.store.input);

  return (
    <div
      tabIndex={-1}
      classList={{
        "relative flex items-center w-[88px] h-[36px] px-1 border border-gray-300 rounded-md bg-white": true,
        "border-yellow-500": field().status === "focus",
        "border-red-500": field().status === "error",
      }}
      onClick={(event) => {
        if (props.onClick) {
          // @ts-ignore
          props.onClick(event);
        }
        $field.setStatus("focus");
      }}
    >
      <Show when={input().value !== ""} fallback={<div class="text-gray-300">{input().placeholder}</div>}>
        <div>{input().value}</div>
      </Show>
      <div class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-300">{input().unit}</div>
    </div>
  );
}
