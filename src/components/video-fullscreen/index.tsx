import { X } from "lucide-solid";

import { Video } from "@/components/ui";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { PlayerCore } from "@/domains/player";

export function VideoFullscreen(props: { store: PlayerCore; onClose?: () => void }) {
  //   props.store.onUrlChange(async ({ url }) => {
  //     props.store.load(url);
  //   });
  //   const { store: player } = props;
  //   player.onCanPlay(() => {
  //     //     console.log("[PAGE]play - player.onCanPlay", player.hasPlayed, currentTime);
  //     //     (async () => {
  //     //       if (app.env.android) {
  //     //         await sleep(1000);
  //     //       }
  //     //       applySettings();
  //     //     })();
  //     if (!player.hasPlayed) {
  //       return;
  //     }
  //     player.play();
  //   });

  return (
    <div class="relative h-w-screen bg-w-bg-0">
      <div class="flex items-center h-full">
        <Video store={props.store} />
      </div>
      <div class="z-[99] absolute right-4 top-4">
        <IconButton
          onClick={() => {
            props.onClose?.();
          }}
        >
          <X class="w-6 h-6 text-w-fg-0" />
        </IconButton>
      </div>
    </div>
  );
}
