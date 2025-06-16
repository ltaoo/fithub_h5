import { JSX, createSignal, onMount } from "solid-js";
import { Loader2 } from "lucide-solid";

import { InputCore } from "@/domains/ui/form/input";
import { cn } from "@/utils";

export function TagInput(props: { store: InputCore<any>; prefix?: JSX.Element; class?: string }) {
  const { store, prefix } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((nextState) => {
    setState(nextState);
  });

  return (
    <div
      class="relative w-full"
      onClick={(event) => {
        const { x, y } = event;
        store.handleClick({ x, y });
      }}
    >
      <div class="absolute left-3 top-[50%] translate-y-[-50%] text-slate-400 ">
        {(() => {
          if (!prefix) {
            return null;
          }
          if (state().loading) {
            return <Loader2 class="w-4 h-4 animate-spin" />;
          }
          return prefix;
        })()}
      </div>
      <div
        class={cn(
          "flex items-center h-10 w-full rounded-xl leading-none border-2 border-w-fg-3 py-2 px-3 text-w-fg-0 bg-transparent",
          "focus:outline-none focus:ring-w-bg-3",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-w-fg-2",
          prefix ? "pl-8" : "",
          props.class
        )}
        style={{
          "vertical-align": "bottom",
        }}
      />
    </div>
  );
}
