import { Component, For, Show } from "solid-js";

interface MultipleAvatarProps {
  value: {
    id: number;
    nickname: string;
    avatar_url?: string;
    is_self?: boolean;
  }[];
  max?: number;
}

export function MultipleAvatar(props: MultipleAvatarProps) {
  const { value = [], max = 3 } = props;

  const display_avatars = () => value.slice(0, max);
  const remaining_count = () => Math.max(0, value.length - max);

  return (
    <div class="flex items-center">
      <div class="flex -space-x-4">
        <For each={display_avatars()}>
          {(s, idx) => {
            return (
              <div
                class="relative inline-block h-8 w-8 rounded-full border-2 border-w-fg-3"
                style={{ "z-index": display_avatars().length - idx() }}
              >
                <Show
                  when={!s.is_self}
                  fallback={
                    <div class="flex h-full w-full items-center justify-center rounded-full bg-w-bg-5 text-sm text-w-fg-0 text-[12px]">
                      我
                    </div>
                  }
                >
                  <Show
                    when={s.avatar_url}
                    fallback={
                      <div class="flex h-full w-full items-center justify-center rounded-full bg-w-bg-5 text-sm text-w-fg-0 text-[12px]">
                        {s.nickname.charAt(0)}
                      </div>
                    }
                  >
                    <img src={s.avatar_url} alt={s.nickname} class="h-full w-full rounded-full object-cover" />
                  </Show>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
      {/* {remaining_count() > 0 && <div class="ml-2 text-sm text-w-fg-1">共{value.length}个</div>} */}
    </div>
  );
}
