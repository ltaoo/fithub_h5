import { JSX } from "solid-js/jsx-runtime";
import { createSignal, For, Show } from "solid-js";
import { Minus } from "lucide-solid";

import { ListContainerCore } from "@/domains/ui/form/list";
import { FormCore, SelectCore } from "@/domains/ui";
import { DatePickerCore } from "@/domains/ui/date-picker";
import { InputCore } from "@/domains/ui/form/input";

import { Input } from "./input";
import { MediaProfileValuesForm } from "./form";
import { Select } from "./select";
import { DatePicker } from "./date-picker";

export function ListContainer(props: { store: ListContainerCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <div>
      <div class="space-y-1">
        <For each={state().list}>
          {(field) => {
            const elm = (() => {
              if (field.$input.shape === "input") {
                return <Input store={field.$input as InputCore<any>} />;
              }
              if (field.$input.shape === "form") {
                return <MediaProfileValuesForm store={field.$input as FormCore<any>} />;
              }
              if (field.$input.shape === "select") {
                return <Select store={field.$input as SelectCore<any>} />;
              }
              if (field.$input.shape === "date-picker") {
                return <DatePicker store={field.$input as DatePickerCore} />;
              }
              if (field.$input.shape === "list") {
                return <ListContainer store={field.$input as ListContainerCore<any>} />;
              }
              return null;
            })();
            return (
              <div class="flex items-center justify-between">
                {elm}
                <Show when={state().canRemove}>
                  <div
                    class="p-1 cursor-pointer hover:bg-slate-100"
                    onClick={() => {
                      store.removeFieldByIndex(field.index);
                    }}
                  >
                    <Minus class="w-4 h-4" />
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
