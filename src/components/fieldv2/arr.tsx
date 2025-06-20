import { JSX } from "solid-js/jsx-runtime";
import { createSignal, For, Show } from "solid-js";
import { ChevronDown, ChevronUp, Plus, Trash } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";

import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

import { FieldV2 } from "./field";

export function FieldArrV2<T extends (v: number) => any>(
  props: {
    store: ArrayFieldCore<T>;
    hide_label?: boolean;
    render: (field: ReturnType<T>) => JSX.Element;
  } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <Show when={!state().hidden}>
      <Show when={!props.hide_label}>
        <Flex class="field justify-between">
          <div class="field__label flex items-center justify-between">
            <div class="field__title ml-2 text-sm text-w-fg-0">{state().label}</div>
          </div>
          <IconButton
            onClick={() => {
              vm.append();
            }}
          >
            <Plus class="w-4 h-4 text-w-fg-0" />
          </IconButton>
        </Flex>
      </Show>
      <div
        classList={{
          [props.class ?? ""]: true,
        }}
      >
        <For each={state().fields}>
          {(field, idx) => {
            const store = props.store.mapFieldWithIndex(idx());
            if (store === null) {
              return null;
            }
            return (
              <div class="flex gap-2">
                <div class="operations w-[32px] space-y-2">
                  <IconButton>
                    <div class="flex items-center justify-center w-4 h-4 text-w-fg-1">{idx() + 1}</div>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      vm.removeByIndex(idx());
                    }}
                  >
                    <Trash class="w-4 h-4 text-w-fg-1" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      vm.insertAfter(field.id);
                    }}
                  >
                    <Plus class="w-4 h-4 text-w-fg-1" />
                  </IconButton>
                  {/* <IconButton
                    onClick={() => {
                      vm.upIdx(idx());
                    }}
                  >
                    <ChevronUp class="w-4 h-4 text-w-fg-1" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      vm.downIdx(idx());
                    }}
                  >
                    <ChevronDown class="w-4 h-4 text-w-fg-1" />
                  </IconButton> */}
                </div>
                <div
                  class=""
                  classList={{
                    "flex-1": true,
                  }}
                >
                  {props.render(store.field)}
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
