import { For, Show, JSX } from "solid-js";
import { Plus, XCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Flex } from "@/components/flex/flex";

import { MultipleImageUploadModel } from "@/biz/multiple_image_upload";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";

import { LazyImage } from "./image";
import { AspectRatio } from "./aspect-ratio";

function ImageUploadView(props: { store: ImageUploadCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div
      //       class={props.class}
      classList={{
        "absolute w-full h-full border-2 border-w-fg-3 rounded-lg": true,
      }}
    >
      <Show
        when={state().url}
        fallback={
          <Flex class="z-10 relative w-full h-full" items="center" justify="center">
            <Plus class="w-8 h-8 text-w-fg-0" />
          </Flex>
        }
      >
        <div class="z-10 overflow-hidden absolute inset-0 h-full rounded-lg">
          <LazyImage class="h-full object-contain" store={vm.ui.$img} />
        </div>
      </Show>
      <input
        type="file"
        class="z-20 absolute inset-0 opacity-0 cursor-pointer"
        accept=".png,.jpeg,.jpg"
        onChange={(event) => {
          vm.ui.$zone.handleDrop(Array.from(event.currentTarget.files || []));
        }}
      />
      <Show when={state().url && !state().uploading}>
        <div
          class="z-30 absolute -top-2 -right-2 rounded-full overflow-hidden bg-w-bg-0"
          onClick={(event) => {
            event.stopPropagation();
            vm.clear();
          }}
        >
          <XCircle class="w-6 h-6 text-w-fg-1" />
        </div>
      </Show>
      <Show when={state().uploading}>
        <div class="z-40 absolute w-full px-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Show
            when={state().error}
            fallback={
              <Show when={state().uploading}>
                <div
                  classList={{
                    "overflow-hidden w-full h-[8px] rounded-md": true,
                  }}
                >
                  <div class="h-full bg-green-500" style={{ width: `${state().percent}%` }}></div>
                </div>
              </Show>
            }
          >
            <div class="text-sm text-red-500 text-center">{state().error?.message}</div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export function MultipleImageUploadView(props: { store: MultipleImageUploadModel }) {
  const [state, vm] = useViewModelStore(props.store.ui.$form);

  return (
    <div class="grid grid-cols-4 gap-2">
      <For each={state().fields}>
        {(v) => {
          const field = vm.getFieldWithId(v.id);
          if (field === null) {
            return null;
          }
          return (
            <AspectRatio ratio={1 / 1}>
              <ImageUploadView store={field.field.input} />
            </AspectRatio>
          );
        }}
      </For>
    </div>
  );
}
