/**
 * @file 组间歇 倒计时
 */
import { createSignal, Show } from "solid-js";
import { Pause, Play, PlayCircle, StopCircle } from "lucide-solid";

import { useViewModelStore } from "@/hooks";

import { SetCountdownViewModel } from "@/biz/set_countdown";

export function SetCountdownView(props: {
  store: SetCountdownViewModel;
  highlight?: boolean;
  onStart?: () => void;
  onCompleted?: () => void;
}) {
  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;
  let $sub_minutes1: undefined | HTMLDivElement;
  let $sub_minutes2: undefined | HTMLDivElement;
  let $sub_seconds1: undefined | HTMLDivElement;
  let $sub_seconds2: undefined | HTMLDivElement;

  const [state, vm] = useViewModelStore(props.store);
  const [countdown1, setCountdown1State] = createSignal(props.store.ui.$countdown.state);
  const [countdown2, setCountdown2State] = createSignal(props.store.ui.$stopwatch.state);
  // if (props.onCompleted) {
  //   props.store.ui.$countdown1.onComplete(props.onCompleted);
  // }

  props.store.ui.$countdown.onStateChange((v) => {
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
    setCountdown1State(v);
  });
  props.store.ui.$stopwatch.onStateChange((v) => {
    if ($sub_minutes1) {
      $sub_minutes1.innerText = v.minutes1;
    }
    if ($sub_minutes2) {
      $sub_minutes2.innerText = v.minutes2;
    }
    if ($sub_seconds1) {
      $sub_seconds1.innerText = v.seconds1;
    }
    if ($sub_seconds2) {
      $sub_seconds2.innerText = v.seconds2;
    }
    setCountdown2State(v);
  });

  return (
    <div class="set-countdown flex items-center justify-between gap-2">
      <Show when={countdown1().pending}>
        <div
          classList={{
            "p-2 rounded-full": true,
            "bg-w-fg-5 text-w-fg-0": props.highlight,
            "text-w-fg-2": !props.highlight,
          }}
          onClick={() => {
            props.store.start();
          }}
        >
          <Play class="w-6 h-6" />
        </div>
      </Show>
      <Show when={state().running}>
        <div
          classList={{
            "p-2 rounded-full bg-w-fg-5": true,
            "text-w-fg-0": props.highlight,
            "text-w-fg-2": !props.highlight,
          }}
          onClick={() => {
            props.store.pause();
          }}
        >
          <Pause class="w-6 h-6" />
        </div>
      </Show>
      <div
        classList={{
          "flex items-center transition-all duration-200": true,
          "text-4xl text-w-fg-0": state().running,
          "text-w-fg-2 ": !state().running,
        }}
      >
        <div
          classList={{
            "text-center": true,
            "w-[12px]": countdown1().pending,
            "w-[20px]": state().running,
          }}
          ref={$minutes1}
        >
          {countdown1().minutes1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$minutes2}
        >
          {countdown1().minutes2}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[12px]": state().running,
          }}
        >
          :
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$seconds1}
        >
          {countdown1().seconds1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$seconds2}
        >
          {countdown1().seconds2}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[12px]": state().running,
          }}
        >
          .
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$ms1}
        >
          {countdown1().ms1}
        </div>
        <div
          classList={{
            "text-center": true,
            "w-[20px]": state().running,
          }}
          ref={$ms2}
        >
          {countdown1().ms2}
        </div>
      </div>
      <div class="flex items-center gap-2 px-4">
        <Show when={countdown1().completed && countdown2().time !== 0}>
          <div
            classList={{
              "flex items-center": true,
              "text-red-500": props.highlight,
              "text-w-fg-1": !props.highlight,
            }}
          >
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
            >
              +
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_minutes1}
            >
              {countdown2().minutes1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_minutes2}
            >
              {countdown2().minutes2}
            </div>
            <div
              classList={{
                "text-center w-[4px]": true,
              }}
            >
              :
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_seconds1}
            >
              {countdown2().seconds1}
            </div>
            <div
              classList={{
                "text-center w-[10px]": true,
              }}
              ref={$sub_seconds2}
            >
              {countdown2().seconds2}
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
