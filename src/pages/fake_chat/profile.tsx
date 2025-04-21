import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui";

import { members, messages } from "./data";

function ChatProfileInFakeChatViewModel(props: ViewComponentProps) {
  const ui = {
    $view: new ScrollViewCore(),
  };

  let _state = {
    get messages(): {
      role: string;
      isMe?: boolean;
      content: string;
      details?: { title: string; content: string[] };
    }[] {
      const id = props.view.query.id;
      if (!id) {
        return [];
      }
      const r = messages.find((msg) => msg.id === Number(id));
      if (!r) {
        return [];
      }
      return r.chats;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ChatProfileInFakeChatPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ChatProfileInFakeChatViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="p-4">
      <For each={state().messages}>
        {(msg) => {
          if (msg.details) {
            return (
              <div class="flex flex-col gap-2 p-4 rounded-2xl bg-gray-100 mb-2">
                <div class="text-base">{msg.details.title}</div>
                <For each={msg.details.content}>
                  {(text) => (
                    <div class="text-sm">
                      <span class="text-gray-500">{text}</span>
                    </div>
                  )}
                </For>
              </div>
            );
          }
          return (
            <div
              class="flex w-full mb-4"
              classList={{
                "justify-end": msg.isMe,
                "justify-start": !msg.isMe,
              }}
            >
              <div
                class="max-w-[80%] rounded-2xl px-4 py-2 break-words"
                classList={{
                  "bg-blue-500 text-white rounded-tr-none": msg.isMe,
                  "bg-gray-100 text-gray-800 rounded-tl-none": !msg.isMe,
                }}
              >
                <div class="text-base">{msg.content}</div>
              </div>
            </div>
          );
        }}
      </For>
    </ScrollView>
  );
}
