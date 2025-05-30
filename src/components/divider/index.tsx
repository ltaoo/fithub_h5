import { Show } from "solid-js";

export function Divider(props: { text?: string; direction?: "horizontal" | "vertical" }) {
  const _direction = props.direction ?? "horizontal";

  return (
    <div
      classList={{
        "relative flex items-center w-full my-4 text-w-bg-5 text-sm": true,
        "w-[2px] h-8 mx-2 my-0 bg-gradient-to-b from-transparent via-w-bg-5 to-transparent": _direction === "vertical",
        "h-[2px] bg-gradient-to-r from-transparent via-w-bg-5 to-transparent": _direction === "horizontal",
      }}
    >
      <Show when={props.text}>
        <div class="absolute left-1/2 -translate-x-1/2">
          <div class="px-4 text-w-fg-1 relative z-10">{props.text}</div>
        </div>
      </Show>
    </div>
  );
}
