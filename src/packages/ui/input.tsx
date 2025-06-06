/**
 * @file 输入框
 */
import { createSignal, JSX, onMount } from "solid-js";
import { effect } from "solid-js/web";

import { InputCore } from "@/domains/ui/form/input";
import { connect } from "@/domains/ui/form/input/connect.web";
import { ValueInputInterface } from "@/domains/ui/form/types";
import { cn } from "@/utils";

const Input = (props: { store: InputCore<any> } & JSX.HTMLAttributes<HTMLInputElement>) => {
  const { store } = props;

  let ref: HTMLInputElement | undefined;
  const [state, setState] = createSignal(store.state);
  // const [v, setV] = createSignal();

  store.onStateChange((v) => {
    setState(v);
  });
  onMount(() => {
    const $input = ref;
    if (!$input) {
      return;
    }
    connect(store, $input);
    store.setMounted();
  });

  const value = () => {
    const { type, value } = state();
    if (type === "file") {
      return "";
    }
    return value;
  };
  const placeholder = () => state().placeholder;
  const disabled = () => state().disabled;
  const type = () => state().type;

  return (
    <input
      ref={ref}
      class={cn(props.class)}
      style={props.style}
      multiple
      value={value()}
      placeholder={placeholder()}
      disabled={disabled()}
      type={type()}
      onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
        // console.log("[COMPONENT]ui/input onInput", event.currentTarget.value);
        store.handleChange(event);
      }}
      // onChange={(event) => {
      //   console.log("[COMPONENT]ui/input onChange");
      //   store.handleChange(event);
      // }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          store.handleEnter();
        }
      }}
      onBlur={() => {
        store.handleBlur();
      }}
    />
  );
};

export { Input };
