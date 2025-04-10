import { createSignal, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { DragZoneCore } from "@/domains/ui/drag-zone";
import { readFileAsArrayBuffer, readFileAsURL } from "@/utils/browser";
import { ImageCore } from "@/domains/ui";
import { ImageUploadCore } from "@/domains/ui/form/image-upload/index";
import { cn } from "@/utils";

import { DragZone } from "./drag-zone";
import { LazyImage } from "./image";
import { AspectRatio } from "./aspect-ratio";

export function ImageUpload(props: { store: ImageUploadCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <div class={cn(props.class, "relative")}>
      <Show when={state().url}>
        <div class="absolute inset-0 h-full">
          <LazyImage class="h-full object-cover" store={store.ui.img} />
        </div>
      </Show>
      <DragZone store={store.ui.zone}></DragZone>
    </div>
  );
}
