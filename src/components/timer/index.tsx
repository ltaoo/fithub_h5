import { ViewComponentProps } from "@/store/types";
import { CountdownViewModel } from "@/biz/countdown";

export function TimerView(props: { store: CountdownViewModel }) {
  let $minutes1: undefined | HTMLDivElement;
  let $minutes2: undefined | HTMLDivElement;
  let $seconds1: undefined | HTMLDivElement;
  let $seconds2: undefined | HTMLDivElement;
  let $ms1: undefined | HTMLDivElement;
  let $ms2: undefined | HTMLDivElement;
  let $ms3: undefined | HTMLDivElement;

  props.store.onStateChange((v) => {
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
  });

  return (
    <div>
      <div class="flex items-center text-4xl">
        <div class="w-[20px] text-center" ref={$minutes1}>
          0
        </div>
        <div class="w-[20px] text-center" ref={$minutes2}>
          0
        </div>
        <div class="w-[16px] text-center">:</div>
        <div class="w-[20px] text-center" ref={$seconds1}>
          0
        </div>
        <div class="w-[20px] text-center" ref={$seconds2}>
          0
        </div>
        <div class="w-[12px] text-center">.</div>
        <div class="w-[20px] text-center" ref={$ms1}>
          0
        </div>
        <div class="w-[20px] text-center" ref={$ms2}>
          0
        </div>
        <div class="w-[20px] text-center" ref={$ms3}>
          0
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="bg-gray-100 p-2 rounded-md"
          onClick={() => {
            props.store.finish();
          }}
        >
          终止
        </div>
        {/* <div
          class="bg-gray-100 p-2 rounded-md"
          onClick={() => {
            props.store.start();
          }}
        >
          开始
        </div>
        <div
          class="bg-gray-100 p-2 rounded-md"
          onClick={() => {
            props.store.stop();
          }}
        >
          暂停
        </div>
        <div
          class="bg-gray-100 p-2 rounded-md"
          onClick={() => {
            props.store.reset();
          }}
        >
          重置
        </div> */}
      </div>
    </div>
  );
}
