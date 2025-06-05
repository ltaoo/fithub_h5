import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";

import { InputCore } from "@/domains/ui";

export function InputTextView(props: { store: InputCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return <div>{state().value}</div>;
}
