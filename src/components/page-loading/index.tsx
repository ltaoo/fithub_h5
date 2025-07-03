import { JSX } from "solid-js/jsx-runtime";
import { LoaderCircle } from "lucide-solid";

export function PageLoading(props: { text: string } & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      classList={{
        ...props.classList,
        "w-full h-[360px] flex items-center justify-center": true,
      }}
      class={props.class}
    >
      <div class="flex flex-col items-center justify-center text-w-fg-1">
        <LoaderCircle class="w-12 h-12 text-w-fg-1 animate-spin" />
        <div class="mt-4 flex items-center space-x-2">
          <div class="text-center">{props.text}</div>
        </div>
      </div>
    </div>
  );
}
