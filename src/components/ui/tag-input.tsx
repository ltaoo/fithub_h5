import { createSignal, For, JSX, Show } from "solid-js";
import { Funnel, Tags, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModelStore } from "@/hooks";
import { TopSheet } from "@/components/top-sheet";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { DialogCore } from "@/domains/ui";

export function TagSelectInput(props: {
  options: { value: string; text: string }[];
  app: ViewComponentProps["app"];
  onChange?: (v: string[]) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    select(v: string) {
      if (_value.includes(v)) {
        _value = _value.filter((vv) => vv !== v);
      } else {
        _value = [v];
      }
      bus.emit(Events.Change, _value);
      methods.refresh();
    },
  };
  const ui = {
    $dialog: new DialogCore({}),
  };

  let _value: string[] = [];
  let _options = props.options ?? [];
  let _state = {
    get value() {
      return _value;
    },
    get options() {
      return _options.map((v) => {
        return {
          ...v,
          selected: _value.includes(v.value),
        };
      });
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _value;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  if (props.onChange) {
    bus.on(Events.Change, props.onChange);
  }

  return {
    methods,
    ui,
    state: _state,
    app: props.app,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type TagSelectInput = ReturnType<typeof TagSelectInput>;

export function TagInput(props: { store: TagSelectInput } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return (
    <>
      <div
        // classList={{
        //   "overflow-hidden flex items-center h-10 w-[68px] rounded-xl truncate border-2 border-w-fg-3 py-2 px-3 text-w-fg-0 bg-transparent":
        //     true,
        //   "focus:outline-none focus:ring-w-bg-3": true,
        //   "disabled:cursor-not-allowed disabled:opacity-50": true,
        //   "placeholder:text-w-fg-2": true,
        //   [props.class ?? ""]: true,
        // }}
        // style={{
        //   "vertical-align": "bottom",
        // }}
        class="p-2 rounded-full bg-w-bg-5"
        onClick={(event) => {
          const { x, y } = event;
          vm.ui.$dialog.show();
        }}
      >
        {/* <For each={state().value} fallback={<div class="text-w-fg-2">请选择标签</div>}>
          {(text, index) => {
            return (
              <div class="">
                {text}
                <Show when={index() !== state().value.length - 1}>、</Show>
              </div>
            );
          }}
        </For> */}
        <Tags
          class="w-6 h-6 text-w-fg-0"
          classList={{
            "text-w-green": state().value.length !== 0,
          }}
        />
      </div>
      <TopSheet top={56} store={vm.ui.$dialog} app={vm.app}>
        <div class="flex flex-wrap gap-2 bg-w-bg-0 p-4">
          <For each={state().options}>
            {(opt) => {
              return (
                <div
                  classList={{
                    "px-4 py-1 border-2 rounded-full text-sm text-w-fg-1": true,
                    "border-w-fg-3": !opt.selected,
                    "border-w-fg-2 bg-w-bg-5 text-w-fg-0": opt.selected,
                  }}
                  onClick={() => {
                    vm.methods.select(opt.value);
                  }}
                >
                  <div>{opt.text}</div>
                </div>
              );
            }}
          </For>
        </div>
      </TopSheet>
    </>
  );
}
