import { createSignal } from "solid-js";
import { CalendarIcon } from "lucide-solid";

import * as PopoverPrimitive from "@/packages/ui/popover";
import { DatePickerCore } from "@/domains/ui/date-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export function DatePicker(props: { store: DatePickerCore }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <PopoverPrimitive.Root store={store.$popover}>
      <PopoverPrimitive.Trigger store={store.$popover}>
        <Button
          variant={"outline"}
          icon={<CalendarIcon class="mr-2 h-4 w-4" />}
          class={cn("flex justify-start w-full text-left font-normal", !state().date && "text-muted-foreground")}
          store={store.$btn}
        >
          {state().date ? state().date : <span>选择日期</span>}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal store={store.$popover}>
        <PopoverPrimitive.Content store={store.$popover}>
          <Calendar class="bg-white" store={store.$calendar} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
