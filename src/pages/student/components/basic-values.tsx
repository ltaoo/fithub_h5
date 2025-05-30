import { For, Match, Switch } from "solid-js";

import { SingleFieldCore } from "@/domains/ui/formv2";
import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select";

import { MemberValuesViewModel } from "../model";
import { HeightDragSelectView } from "@/components/height-drag-select";

export function MemberBasicValues(props: { store: ReturnType<typeof MemberValuesViewModel>["ui"]["$basic_values"] }) {
  return (
    <div>
      <div class="space-y-4">
        <For each={props.store.state.fields}>
          {(field) => {
            if (field.hidden) {
              return null;
            }
            const $inner = props.store.mapFieldWithName(field.name);
            if (!$inner) {
              return null;
            }
            return (
              <div>
                <div class="text-w-fg-1">{field.label}</div>
                {(() => {
                  if ($inner.symbol === "SingleFieldCore") {
                    const field = $inner.state;
                    if (field.input.shape === "input") {
                      return <Input class="w-full" store={$inner.input} />;
                    }
                    if (field.input.shape === "select") {
                      return <Select class="w-full" store={$inner.input} />;
                    }
                    if (field.input.shape === "drag-select") {
                      return <HeightDragSelectView store={$inner.input} />;
                    }
                  }
                  return null;
                })()}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
