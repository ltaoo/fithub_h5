import { JSX, createSignal, onMount } from "solid-js";
import { Loader2 } from "lucide-solid";

import { useViewModelStore } from "@/hooks";
import { Input as InputPrimitive } from "@/packages/ui/input";

import { InputCore } from "@/domains/ui/form/input";
import { connect } from "@/domains/ui/form/input/connect.web";
import { cn } from "@/utils";

const Input = (props: { store: InputCore<any>; prefix?: JSX.Element; class?: string }) => {
  // const { store, prefix } = props;

  const [state, vm] = useViewModelStore(props.store);
  // let ref: HTMLInputElement;
  // const [state, setState] = createSignal(store.state);

  // onMount(() => {
  //   const $input = ref;
  //   if (!$input) {
  //     return;
  //   }
  //   connect(store, $input);
  //   store.setMounted();
  // });
  // store.onStateChange((nextState) => {
  //   setState(nextState);
  // });

  // React.useEffect(() => {
  //   return () => {
  //     console.log("Input unmounted");
  //   };
  // }, []);
  // console.log("[]Input");
  return (
    <div
      class="relative w-full"
      onClick={(event) => {
        const { x, y } = event;
        vm.handleClick({ x, y });
      }}
    >
      <div class="absolute left-3 top-[50%] translate-y-[-50%] text-slate-400 ">
        {(() => {
          if (!props.prefix) {
            return null;
          }
          if (state().loading) {
            return <Loader2 class="w-4 h-4 animate-spin" />;
          }
          return props.prefix;
        })()}
      </div>
      <InputPrimitive
        class={cn(
          "flex items-center h-10 w-full rounded-xl leading-none border-2 border-w-fg-3 py-2 px-3 text-w-fg-0 bg-transparent",
          "focus:outline-none focus:ring-w-bg-3",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-w-fg-2",
          props.prefix ? "pl-8" : "",
          props.class
        )}
        style={{
          "vertical-align": "bottom",
        }}
        store={vm}
      />
    </div>
  );
};
Input.displayName = "Input";

export { Input };
