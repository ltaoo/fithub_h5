import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";

import { AffixCore } from "@/domains/ui/affix";
import { sleep } from "@/utils";

export function Affix(props: { store: AffixCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);
  const styles = () => {
    return {
      position: state().fixed ? "fixed" : ("unset" as any),
      top: `${state().top}px`,
    };
  };

  return (
    <div class="affix">
      <div
        class="__a"
        classList={{
          [props.class ?? ""]: true,
        }}
        style={styles()}
        onAnimationEnd={(event) => {
          const $node = event.currentTarget;
          vm.setRect(() => {
            const rect = $node.getBoundingClientRect();
            return {
              top: rect.top,
              height: rect.height,
            };
          });
          const rect = $node.getBoundingClientRect();
          vm.handleMounted(rect);
        }}
      >
        {props.children}
      </div>
      <Show when={state().fixed}>
        <div style={{ height: `${state().height}px` }} />
      </Show>
    </div>
  );
}
