import { JSX } from "solid-js/jsx-runtime";

export function IconButton(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} class="p-2 rounded-full bg-w-bg-5 text-w-fg-0 cursor-pointer">
      {props.children}
    </div>
  );
}
