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
      <div class="flex flex-col gap-4 w-full p-4 bg-white rounded-lg shadow-md">
        <div class="headers flex items-center justify-between px-2">
          <span class="text-3xl font-bold">{state().text}</span>
          <div>
            <div class="flex items-center border rounded-md">
              <For each={state().unitOptions}>
                {(unit) => {
                  return (
                    <div
                      classList={{
                        "text-sm px-4 py-2": true,
                        "bg-gray-200": state().unit === unit.value,
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
        </div>
        <div class="flex items-center justify-between px-2">
          <div class="nums flex-1">
            <div class="space-y-2">
              <div class="flex justify-between gap-2">
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("1");
                  }}
                >
                  1
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("2");
                  }}
                >
                  2
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("3");
                  }}
                >
                  3
                </button>
              </div>
              <div class="flex justify-between gap-2">
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("4");
                  }}
                >
                  4
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("5");
                  }}
                >
                  5
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("6");
                  }}
                >
                  6
                </button>
              </div>
              <div class="flex justify-between gap-2">
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("7");
                  }}
                >
                  7
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("8");
                  }}
                >
                  8
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("9");
                  }}
                >
                  9
                </button>
              </div>
              <div class="flex justify-between gap-2">
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickSub();
                  }}
                >
                  -
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickNumber("0");
                  }}
                >
                  0
                </button>
                <button
                  class="basis-1/3 p-4 text-xl bg-gray-200 text-white rounded-lg"
                  onClick={() => {
                    vm.methods.handleClickDot();
                  }}
                >
                  .
                </button>
              </div>
            </div>
          </div>
          <div class="extra w-[68px] ml-2">
            <div class="space-y-2">
              <div
                class="flex-1 p-4 bg-gray-200 text-white rounded-lg"
                onClick={() => {
                  vm.methods.handleClickDelete();
                }}
              >
                删除
              </div>
              <div class="flex-1 p-4 bg-gray-200 rounded-lg opacity-0">
                <div>上</div>
              </div>
              <div class="flex-1 p-4 bg-gray-200 rounded-lg opacity-0">
                <div>下</div>
              </div>
              <div
                class="flex-1 p-4 bg-gray-200 text-white rounded-lg"
                onClick={() => {
                  vm.methods.handleSubmit();
                }}
              >
                <div class="text-center">收起</div>
              </div>
              {/* <button
                class="px-4 py-2 rounded-lg transition-colors"
                classList={{
                  "bg-blue-500 text-white": state().unit === "kg",
                  "bg-gray-100 hover:bg-gray-200": state().unit !== "kg",
                }}
                onClick={() => {
                  vm.methods.handleClickUnit("kg");
                }}
              >
                kg
              </button>
              <button
                class="px-4 py-2 rounded-lg transition-colors"
                classList={{
                  "bg-blue-500 text-white": state().unit === "lbs",
                  "bg-gray-100 hover:bg-gray-200": state().unit !== "lbs",
                }}
                onClick={() => {
                  vm.methods.handleClickUnit("lbs");
                }}
              >
                lbs
              </button> */}
            </div>
          </div>
        </div>
        <div class="h-[68px]"></div>
      </div>
    </>
  );
}
