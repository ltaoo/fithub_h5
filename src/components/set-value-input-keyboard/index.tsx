/**
 * @file 重量输入组件
 */
import { createSignal, For } from "solid-js";

import { useViewModel, useViewModelStore } from "@/hooks";
import { Input } from "@/components/ui/input";
import * as PopoverPrimitive from "@/packages/ui/popover";
import { SetValueInputViewModel } from "@/biz/set_value_input";
import { base, Handler } from "@/domains/base";
import { InputCore, PopoverCore } from "@/domains/ui";

export function SetValueInputKeyboard(props: { store: SetValueInputViewModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div class="flex flex-col gap-4 w-full p-4">
        <div class="headers flex items-center justify-between px-2">
          <span class="text-3xl font-bold text-w-fg-0">{state().text}</span>
          <div class="overflow-hidden flex items-center border-2 border-w-bg-5 rounded-xl">
            <For each={state().unitOptions}>
              {(unit) => {
                return (
                  <div
                    classList={{
                      "text-sm px-4 py-2 text-w-fg-0": true,
                      "bg-w-bg-5": state().unit === unit.value,
                    }}
                    onClick={() => {
                      vm.setUnit(unit.value);
                    }}
                  >
                    {unit.label}
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("1");
            }}
          >
            1
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("2");
            }}
          >
            2
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("3");
            }}
          >
            3
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-orange-500 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickDelete();
            }}
          >
            删除
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("4");
            }}
          >
            4
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("5");
            }}
          >
            5
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("6");
            }}
          >
            6
          </button>
          <button class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-w-bg-5 text-w-fg-0 rounded-full opacity-0">
            上
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("7");
            }}
          >
            7
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("8");
            }}
          >
            8
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("9");
            }}
          >
            9
          </button>
          <button class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-w-bg-5 text-w-fg-0 rounded-full opacity-0">
            下
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickSub();
            }}
          >
            -
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickNumber("0");
            }}
          >
            0
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleClickDot();
            }}
          >
            .
          </button>
          <button
            class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-orange-500 text-w-fg-0 rounded-full"
            onClick={() => {
              vm.methods.handleSubmit();
            }}
          >
            收起
          </button>
        </div>
      </div>
    </>
  );
}
