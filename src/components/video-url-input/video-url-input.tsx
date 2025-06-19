import { Show } from "solid-js";

import { useViewModelStore } from "@/hooks";

import { Flex } from "@/components/flex/flex";
import { Input } from "@/components/ui/input";
import { Button, Video } from "@/components/ui";

import { VideoURLInputModel } from "@/biz/input_video_url/input_video_url";

export function VideoURLInput(props: { store: VideoURLInputModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <div>
      <Flex class="gap-2">
        <Input store={vm.ui.$input}></Input>
        <Button store={vm.ui.$btn_preview} size="sm">
          预览
        </Button>
      </Flex>
      <Show when={state().preview}>
        <div class="mt-2">
          <Video store={vm.ui.$video}></Video>
        </div>
      </Show>
    </div>
  );
}
