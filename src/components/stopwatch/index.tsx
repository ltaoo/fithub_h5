import { createSignal, Show } from "solid-js";

import { useViewModelStore } from "@/hooks";

import { StopWatchViewModel } from "@/biz/stopwatch";

export function StopwatchView(props: { store: StopWatchViewModel }) {
  //   const [state, vm] = useViewModelStore(props.store);
  const [state, setState] = createSignal(props.store.state);
  const [running, setRunning] = createSignal(props.store.state.running);

  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;

  props.store.onStateChange((v) => {
    //     setState({
    //       running: v.running,
    //     });
    setRunning(v.running);
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
  });

  const num_width = 42;
  const char_width = 24;

  return (
    <div>
      <div
        classList={{
          "time-text flex items-center text-w-fg-0 transition-all duration-200": true,
          "text-7xl": true,
        }}
      >
        <div
          ref={$minutes1}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().minutes1}
        </div>
        <div
          ref={$minutes2}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().minutes2}
        </div>
        <div
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${char_width}px`,
          }}
        >
          :
        </div>
        <div
          ref={$seconds1}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().seconds1}
        </div>
        <div
          ref={$seconds2}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().seconds2}
        </div>
        <div
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${char_width}px`,
          }}
        >
          .
        </div>
        <div
          ref={$ms1}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().ms1}
        </div>
        <div
          ref={$ms2}
          classList={{
            "text-center": true,
          }}
          style={{
            width: `${num_width}px`,
          }}
        >
          {state().ms2}
        </div>
      </div>
      <div class="flex items-center justify-between p-4">
        <div
          class="flex items-center justify-center w-16 h-16 rounded-full bg-w-bg-5 text-w-fg-0"
          onClick={() => {
            if (running()) {
              return;
            }
            props.store.reset();
          }}
        >
          <Show when={running()} fallback={<div>复位</div>}>
            <div></div>
          </Show>
        </div>
        <div
          class="flex items-center justify-center w-16 h-16 rounded-full bg-w-bg-5 text-w-fg-0"
          onClick={() => {
            props.store.toggle();
          }}
        >
          <Show when={running()} fallback={<div>开始</div>}>
            <div>暂停</div>
          </Show>
        </div>
      </div>
    </div>
  );
}
