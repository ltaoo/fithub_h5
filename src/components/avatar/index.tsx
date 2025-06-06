import { Show } from "solid-js";

export function Avatar(props: { nickname: string; avatar_url?: string }) {
  return (
    <div>
      <div class="w-[48px] h-[48px] rounded-full bg-w-bg-5">
        <Show
          when={props.avatar_url}
          fallback={
            <div class="flex items-center justify-center w-full h-full">
              <div class="text-w-fg-0">{props.nickname[0]}</div>
            </div>
          }
        >
          <img class="w-full h-full object-contain" src={props.avatar_url} />
        </Show>
      </div>
    </div>
  );
}
