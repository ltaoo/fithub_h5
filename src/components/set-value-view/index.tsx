import { getSetValueUnit } from "@/biz/input_set_value";
import { Show } from "solid-js";

export function SetValueView(props: { weight: number; weight_unit: string; reps: number; reps_unit: string }) {
  return (
    <div class="flex items-end">
      <div class="flex items-end">
        <Show
          when={props.weight_unit !== getSetValueUnit("自重")}
          fallback={
            <div>
              <div class="" style={{ "line-height": "16px" }}>
                自重
              </div>
            </div>
          }
        >
          <div class="" style={{ "line-height": "16px" }}>
            {props.weight}
          </div>
          <div class="text-[12px]" style={{ "line-height": "12px" }}>
            {props.weight_unit}
          </div>
        </Show>
      </div>
      <div class="mx-1 text-sm" style={{ "line-height": "12px" }}>
        <div>x</div>
      </div>
      <div class="flex items-end">
        <div class="" style={{ "line-height": "16px" }}>
          {props.reps}
        </div>
        <div class="text-[12px]" style={{ "line-height": "12px" }}>
          {props.reps_unit}
        </div>
      </div>
    </div>
  );
}
