import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui";

import { members } from "./data";

function MemberListInFakeChatViewModel(props: ViewComponentProps) {
  const methods = {
    handleClick(member: any) {},
  };
  const ui = {
    $view: new ScrollViewCore(),
  };

  let _state = {
    get list() {
      return members;
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
    methods,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MemberListInFakeChatPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MemberListInFakeChatViewModel, [props]);

  return (
    <ScrollView store={vm.ui.$view} class="p-4">
      <For each={state().list}>
        {(member) => {
          return (
            <div
              class="bg-white rounded-lg shadow-md p-4 mb-4 flex items-start space-x-4 hover:shadow-lg transition-shadow"
              onClick={() => {
                vm.methods.handleClick(member);
              }}
            >
              <div class="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} class="w-full h-full object-cover" />
                ) : (
                  <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-lg">{member.name || "未命名会员"}</h3>
                  <span
                    class={`text-sm px-2 py-0.5 rounded ${
                      member.gender === "男" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                    }`}
                  >
                    {member.gender}
                  </span>
                  <span class="text-gray-500 text-sm">{member.age}岁</span>
                </div>
                <div class="text-gray-600 mt-1">{member.role}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  {member.goals.map((goal) => (
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{goal}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </ScrollView>
  );
}
