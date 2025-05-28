import { InputCore, SelectCore } from "@/domains/ui";
import { SingleFieldCore, ObjectFieldCore } from "@/domains/ui/formv2";

/**
 * @file 次数输入，包含 单位
 */
export function SetRepsInput(props: {
  store: ObjectFieldCore<{
    reps: SingleFieldCore<InputCore<string>>;
    reps_unit: SingleFieldCore<SelectCore<string>>;
  }>;
}) {
  return (
    <div>
      <div>Hello</div>
    </div>
  );
}
