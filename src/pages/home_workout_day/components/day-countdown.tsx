import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { CountdownViewModel } from "@/biz/countdown";

export function DayCountdown(props: { store: CountdownViewModel; onStart?: () => void; onCompleted?: () => void }) {
  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;
  let $ms3: undefined | HTMLDivElement;

  const [state, setState] = createSignal(props.store.state);
  if (props.onCompleted) {
    props.store.onComplete(props.onCompleted);
  }

  props.store.onStateChange((v) => {
    // console.log("[COMPONENT]set-countdown - update")
    if ($minutes1) {
      $minutes1.innerText = v.minutes1;
    }
    if ($minutes2) {
      $minutes2.innerText = v.minutes2;
    }
    if ($seconds1) {
      $seconds1.innerText = v.seconds1;
    }
    if ($seconds2) {
      $seconds2.innerText = v.seconds2;
    }
    if ($ms1) {
      $ms1.innerText = v.ms1;
    }
    if ($ms2) {
      $ms2.innerText = v.ms2;
    }
    if ($ms3) {
      $ms3.innerText = v.ms3;
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
          ref={$seconds1}
        >
          {state().seconds1}
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$seconds2}
        >
          {state().seconds2}
        </div>
        <div
          classList={{
            "text-center w-[8px]": true,
          }}
        >
          .
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$ms1}
        >
          {state().ms1}
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$ms2}
        >
          {state().ms2}
        </div>
        <div
          classList={{
            "text-center w-[12px]": true,
          }}
          ref={$ms3}
        >
          {state().ms3}
        </div>
      </div>
    </div>
  );
}
