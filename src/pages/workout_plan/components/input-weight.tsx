import { For, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";
import { Dialog } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Select } from "@/components/ui/select";

import { InputCore } from "@/domains/ui";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { SetValueInputViewModel } from "@/biz/input_set_value";
import { WeightInputModel } from "@/biz/input_with_keyboard/input_weight";

export function WeightInputView(
  props: { width?: number; store: SingleFieldCore<WeightInputModel> } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [field, $field] = useViewModelStore(props.store);
  const [input, $input] = useViewModelStore(props.store.input);

  return (
    <>
      <div
        tabIndex={-1}
        class={props.class}
        classList={{
          "set-value-input relative flex items-center gap-2 w-full h-10 px-3 border-2 rounded-xl bg-w-bg-2": true,
          "border-w-fg-3": field().status === "normal",
          "border-yellow-500": field().status === "focus",
          "border-red-500 dark:border-red-800": field().status === "error",
        }}
        // style={{
        //   width: `${props.width ?? 88}px`,
        // }}
        onClick={(event) => {
          const { x, y, width, height } = event.currentTarget.getBoundingClientRect();
          $input.ui.$input.methods.handleClickField({
            x,
            y,
            width,
            height,
          });
        }}
      >
        <Show when={input().value.num !== ""} fallback={<div class="text-w-fg-2">{input().placeholder}</div>}>
          <div class="text-w-fg-0">{input().value.num}</div>
        </Show>
        {/* <div class="absolute right-2 top-1/2 -translate-y-1/2 text-w-fg-0">{input().value.unit}</div> */}
        <div class="text-w-fg-0">{input().value.unit}</div>
      </div>
      <Sheet store={$input.ui.$dialog} app={$input.app}>
        <div class="flex flex-col gap-4 w-full p-4">
          <div class="headers flex items-center justify-between px-2">
            <div class="text-3xl font-bold text-w-fg-0">{input().value.num}</div>
            <Select store={$input.ui.$select}></Select>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("1");
              }}
            >
              1
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("2");
              }}
            >
              2
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("3");
              }}
            >
              3
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-orange-500 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickDelete();
              }}
            >
              删除
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("4");
              }}
            >
              4
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("5");
              }}
            >
              5
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("6");
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
                $input.ui.$keyboard.methods.handleClickNumber("7");
              }}
            >
              7
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("8");
              }}
            >
              8
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("9");
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
                "opacity-0": !input().showSubKey,
              }}
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickSub();
              }}
            >
              -
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickNumber("0");
              }}
            >
              0
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-2xl bg-w-bg-5 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.ui.$keyboard.methods.handleClickDot();
              }}
            >
              .
            </button>
            <button
              class="flex items-center justify-center w-[72px] h-[72px] text-xl bg-orange-500 text-w-fg-0 rounded-full"
              onClick={() => {
                $input.methods.handleSubmit();
              }}
            >
              收起
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
