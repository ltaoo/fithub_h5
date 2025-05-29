import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";

export function DayCountdown(props: { store: CountdownViewModel; onStart?: () => void; onCompleted?: () => void }) {
  let $hours1: undefined | HTMLDivElement;
  let $hours2: undefined | HTMLDivElement;
  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;

  const [state, setState] = createSignal(props.store.state);
  if (props.onCompleted) {
    props.store.onFinished(props.onCompleted);
  }

  props.store.onStateChange((v) => {
    // console.log("[COMPONENT]set-countdown - update")
    if ($hours1) {
      $hours1.innerText = v.hours1;
    }
    if ($hours2) {
      $hours2.innerText = v.hours2;
    }
    if ($minutes1) {
      $minutes1.innerText = v.minutes1;
    }
    if ($minutes2) {
      $minutes2.innerText = v.minutes2;
    }
    // set(props.store.state);
  });

  return (
    <div class="flex items-center justify-between">
      <div
        classList={{
          "flex items-center text-xl transition-all duration-200": true,
          // "text-gray-100": state().finished,
        }}
      >
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$hours1}
        >
          {state().hours1}
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$hours2}
        >
          {state().hours2}
        </div>
        <div
          classList={{
            "text-center w-[8px]": true,
          }}
        >
          :
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$minutes1}
        >
          {state().minutes1}
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$minutes2}
        >
          {state().minutes2}
        </div>
      </div>
    </div>
  );
}
