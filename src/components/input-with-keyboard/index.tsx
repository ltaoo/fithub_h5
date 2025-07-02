/**
 * @file 带键盘的输入框
 */
import { For, Show } from "solid-js";

import { useViewModelStore } from "@/hooks";
import { Sheet } from "@/components/ui/sheet";

import { InputWithKeyboardModel } from "@/biz/input_with_keyboard";

export function InputWithKeyboardView(props: { store: InputWithKeyboardModel }) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div
        onClick={(event) => {
          const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
          vm.methods.handleClickField({
            x,
            y,
            width,
            height,
          });
        }}
      >
        <Show when={state().value} fallback={<div>{state().placeholder}</div>}>
          <div>{state().value}</div>
        </Show>
      </div>
      <Sheet store={vm.ui.$dialog} app={vm.app}>
        <>
          <div class="flex flex-col gap-4 w-full p-4">
            <div class="headers flex items-center justify-between px-2">
              <div class="text-3xl font-bold text-w-fg-0">{state().value}</div>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("1");
                }}
              >
                1
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("2");
                }}
              >
                2
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("3");
                }}
              >
                3
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-orange-500 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickDelete();
                }}
              >
                删除
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("4");
                }}
              >
                4
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("5");
                }}
              >
                5
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("6");
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
                  vm.ui.$keyboard.methods.handleClickNumber("7");
                }}
              >
                7
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("8");
                }}
              >
                8
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("9");
                }}
              >
                9
              </button>
              <button class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-w-bg-5 text-w-fg-0 rounded-full opacity-0">
                下
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                classList={{
                  "opacity-0": !state().showSubKey,
                }}
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickSub();
                }}
              >
                -
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickNumber("0");
                }}
              >
                0
              </button>
              <button
                class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
                onClick={() => {
                  vm.ui.$keyboard.methods.handleClickDot();
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
      </Sheet>
    </>
  );
}
