import { Show } from "solid-js";

export function Divider(props: { text?: string; direction?: "horizontal" | "vertical" }) {
  const _direction = props.direction ?? "horizontal";

  return (
    <div
      classList={{
        "relative flex items-center text-w-bg-5 text-sm": true,
        "absolute top-1/2 -translate-y-1/2 w-[1px] h-[32px] bg-gray-300": _direction === "vertical",
        "w-full h-[1px] my-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent": _direction === "horizontal",
      }}
    ></div>
  );
}
