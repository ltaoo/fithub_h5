import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";

export function Countdown(props: { store: CountdownViewModel; onStart?: () => void; onCompleted?: () => void }) {
  let $a_minutes1: undefined | HTMLDivElement;
  let $a_minutes2: undefined | HTMLDivElement;
  let $a_seconds1: undefined | HTMLDivElement;
  let $a_seconds2: undefined | HTMLDivElement;
  let $a_ms1: undefined | HTMLDivElement;
  let $a_ms2: undefined | HTMLDivElement;

  const [state, vm] = useViewModelStore(props.store);

  props.store.onStateChange((v) => {
    if ($a_minutes1) {
      $a_minutes1.innerText = v.minutes1;
    }
    if ($a_minutes2) {
      $a_minutes2.innerText = v.minutes2;
    }
    if ($a_seconds1) {
      $a_seconds1.innerText = v.seconds1;
    }
    if ($a_seconds2) {
      $a_seconds2.innerText = v.seconds2;
    }
    if ($a_ms1) {
      $a_ms1.innerText = v.ms1;
    }
    if ($a_ms2) {
      $a_ms2.innerText = v.ms2;
    }
  });

  return (
    <div class="flex items-center gap-4">
      <div
        classList={{
          "flex items-center transition-all duration-200": true,
        }}
      >
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_minutes1}
        >
          {state().minutes1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_minutes2}
        >
          {state().minutes2}
        </div>
        <div
          classList={{
            "text-center w-[6px]": true,
            "": state().running,
          }}
        >
          :
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_seconds1}
        >
          {state().seconds1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_seconds2}
        >
          {state().seconds2}
        </div>
        <div
          classList={{
            "text-center w-[6px]": true,
          }}
        >
          .
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_ms1}
        >
          {state().ms1}
        </div>
        <div
          classList={{
            "text-center w-[10px]": true,
          }}
          ref={$a_ms2}
        >
          {state().ms2}
        </div>
      </div>
    </div>
  );
}
