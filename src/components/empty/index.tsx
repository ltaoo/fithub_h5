import { Bird } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

export function Empty(props: { text: string } & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      classList={{
        ...props.classList,
        "w-full h-[360px] flex items-center justify-center": true,
      }}
      class={props.class}
    >
      <div class="flex flex-col items-center justify-center text-w-fg-1">
        <Bird class="w-24 h-24 text-w-fg-1" />
        <div class="mt-4 flex items-center space-x-2">
          <div class="text-center text-xl">{props.text}</div>
        </div>
      </div>
    </div>
  );
}
