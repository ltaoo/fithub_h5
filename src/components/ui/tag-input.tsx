import { createSignal, For } from "solid-js";
import { X } from "lucide-solid";

import { TagInputCore } from "@/domains/ui/form/tag-input";

export function TagInput(props: { store: TagInputCore }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 items-center">
        <For each={state().value}>
          {(tag, index) => {
            return (
              <div class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <span>{tag}</span>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    store.removeTag(tag);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          }}
        </For>
        <input
          type="text"
          value={state().inputValue}
          class="flex-grow outline-none min-w-20"
          placeholder={"输入标签并按回车添加..."}
          onInput={(e) => {
            store.input(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              store.addTag();
            }
          }}
        />
      </div>
    </div>
  );
}
