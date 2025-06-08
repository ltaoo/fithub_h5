import { Show } from "solid-js";

export function Avatar(props: { nickname: string; avatar_url?: string }) {
  return (
    <div>
      <div class="w-[40px] h-[40px]">
        <Show
          when={props.avatar_url}
          fallback={
            <div class="flex items-center justify-center w-full h-full rounded-full bg-w-bg-5">
              {/* <div class="text-sm text-w-fg-0">{props.nickname[0]}</div> */}
            </div>
          }
        >
          <div
            class="w-full h-full rounded-full"
            style={{
              "background-image": `url('${props.avatar_url}')`,
              "background-size": "cover",
              "background-position": "center",
            }}
          ></div>
        </Show>
      </div>
      <div class="mt-1">
        <div class="w-[40px] truncate text-center text-w-fg-0 text-[12px]">{props.nickname}</div>
      </div>
    </div>
  );
}
