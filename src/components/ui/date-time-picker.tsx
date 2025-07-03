import { createSignal, For, Show } from "solid-js";
import { Calendar, Timer } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Button, Popover, ScrollView } from "@/components/ui";

import { DateTimePickerModel } from "@/biz/time_picker/date_time";

import { Sheet } from "./sheet";

export function DateTimePickerView(props: { store: DateTimePickerModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="flex gap-2">
        <div
          classList={{
            "relative flex items-center justify-between w-[148px] h-[36px] px-2 border-2 border-w-fg-3 rounded-xl":
              true,
            "text-w-fg-0": true,
          }}
          onClick={(event) => {
            vm.ui.$input_date.methods.handleClickInput();
          }}
        >
          {state().full_date_text}
          <Calendar class="w-4 h-4 text-w-fg-0" />
        </div>
        <div
          classList={{
            "relative flex items-center justify-between w-[108px] h-[36px] px-2 border-2 border-w-fg-3 rounded-xl":
              true,
            "text-w-fg-0": true,
          }}
          onClick={(event) => {
            vm.ui.$input_time.methods.handleClickInput();
          }}
        >
          {state().time_text}
          <Timer class="w-4 h-4 text-w-fg-0" />
        </div>
      </div>
      <Sheet store={vm.ui.$input_date.ui.$dialog} app={vm.app}>
        <div class="px-4 py-2 border-b-2 border-w-fg-3">
          <div class="text-w-fg-0 text-xl">{state().tmp_full_date_text}</div>
        </div>
        <div class="grid grid-cols-3 h-[240px]">
          <ScrollView store={vm.ui.$input_date.ui.$view_year} class="h-full p-2 overflow-y-auto scroll--hidden">
            <For each={state().options_year}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "p-2 rounded-md cursor-pointer": true,
                      "bg-w-bg-5": v.selected,
                    }}
                    onClick={() => {
                      vm.ui.$input_date.methods.selectYear(v.value);
                    }}
                  >
                    {v.label}
                  </div>
                );
              }}
            </For>
          </ScrollView>
          <ScrollView
            store={vm.ui.$input_date.ui.$view_month}
            class="h-full p-2 border-l-2 border-w-fg-3 overflow-y-auto scroll--hidden"
          >
            <For each={state().options_month}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "p-2 rounded-md cursor-pointer": true,
                      "bg-w-bg-5": v.selected,
                    }}
                    onClick={() => {
                      vm.ui.$input_date.methods.selectMonth(v.value);
                    }}
                  >
                    {v.label}
                  </div>
                );
              }}
            </For>
          </ScrollView>
          <ScrollView
            store={vm.ui.$input_date.ui.$view_date}
            class="h-full p-2 border-l-2 border-w-fg-3 overflow-y-auto scroll--hidden"
          >
            <For each={state().options_date}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "p-2 rounded-md cursor-pointer": true,
                      "bg-w-bg-5": v.selected,
                    }}
                    onClick={() => {
                      vm.ui.$input_date.methods.selectDate(v.value);
                    }}
                  >
                    {v.label}
                  </div>
                );
              }}
            </For>
          </ScrollView>
        </div>
        <div class="p-2 border-t-2 border-w-fg-3">
          <div class="flex gap-2">
            <Button class="w-[88px]" store={vm.ui.$input_date.ui.$btn_set_today}>
              今天
            </Button>
            <Button class="w-full" store={vm.ui.$input_date.ui.$btn_confirm}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$input_time.ui.$dialog} app={vm.app}>
        <div class="px-4 py-2 border-b-2 border-w-fg-3">
          <div class="text-w-fg-0 text-xl">{state().tmp_full_time_text}</div>
        </div>
        <div class="grid grid-cols-2 h-[240px]">
          <ScrollView store={vm.ui.$input_time.ui.$view_hour} class="h-full p-2 overflow-y-auto scroll--hidden">
            <For each={state().options_hour}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "p-2 rounded-md cursor-pointer": true,
                      "bg-w-bg-5": v.selected,
                    }}
                    onClick={() => {
                      vm.ui.$input_time.methods.selectHour(v.value);
                    }}
                  >
                    {v.label}
                  </div>
                );
              }}
            </For>
          </ScrollView>
          <ScrollView
            store={vm.ui.$input_time.ui.$view_minute}
            class="h-full p-2 border-l-2 border-w-fg-3 overflow-y-auto scroll--hidden"
          >
            <For each={state().options_minute}>
              {(v) => {
                return (
                  <div
                    classList={{
                      "p-2 rounded-md cursor-pointer": true,
                      "bg-w-bg-5": v.selected,
                    }}
                    onClick={() => {
                      vm.ui.$input_time.methods.selectMinute(v.value);
                    }}
                  >
                    {v.label}
                  </div>
                );
              }}
            </For>
          </ScrollView>
        </div>
        <div class="p-2 border-t-2 border-w-fg-3">
          <div class="flex gap-2">
            <Button class="w-[88px]" store={vm.ui.$input_time.ui.$btn_set_today}>
              现在
            </Button>
            <Button class="w-full" store={vm.ui.$input_time.ui.$btn_confirm}>
              确定
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
