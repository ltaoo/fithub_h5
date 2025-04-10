import { createSignal, For, JSX } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import { CalendarCore } from "@/domains/ui/calendar";
import { cn } from "@/utils";

export function Calendar(props: { store: CalendarCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;
  const [state, setState] = createSignal(store.state);

  store.onChange((v) => {
    console.log("hange", v.year.text, v.month.text);
    setState(v);
  });

  return (
    <div class={cn("calendar rdp p-3 rounded-md border shadow", props.class)}>
      <div class="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
        <div class="space-y-4 rdp-caption_start rdp-caption_end">
          <div class="calendar__head flex justify-center pt-1 relative items-center">
            <div aria-live="polite" role="presentation" class="text-sm font-medium">
              {state().year.text} {state().month.text}
            </div>
            <div class="space-x-1 flex items-center">
              <button
                name="previous-month"
                aria-label="Go to previous month"
                class="rdp-button_reset rdp-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
                onClick={() => {
                  store.nextMonth();
                }}
              >
                <ChevronLeft class="lucide lucide-chevron-left h-4 w-4 rdp-nav_icon" />
              </button>
              <button
                name="next-month"
                aria-label="Go to next month"
                class="rdp-button_reset rdp-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
                onClick={() => {
                  store.prevMonth();
                }}
              >
                <ChevronRight class="lucide lucide-chevron-right h-4 w-4 rdp-nav_icon" />
              </button>
            </div>
          </div>
          <table role="grid" class="calendar__table w-full border-collapse space-y-1">
            <thead class="rdp-head">
              <tr class="flex">
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">一</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">二</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">三</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">四</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">五</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">六</th>
                <th class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">天</th>
              </tr>
            </thead>
            <tbody role="rowgroup" class="rdp-tbody">
              <For each={state().weeks}>
                {(week) => {
                  return (
                    <tr class="flex w-full mt-2">
                      <For each={week.dates}>
                        {(date) => {
                          return (
                            <td
                              class={cn(
                                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:rounded-md",
                                state().day.time === date.time ? "text-green-500" : ""
                              )}
                              onClick={() => {
                                store.selectDay(date.value);
                              }}
                            >
                              <button
                                name="day"
                                role="gridcell"
                                type="button"
                                tabindex="-1"
                                class="rdp-button_reset rdp-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 font-normal aria-selected:opacity-100 day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground"
                              >
                                {date.text}
                              </button>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
