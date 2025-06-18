/**
 * @file 学员列表 页面
 */
import { For, Show } from "solid-js";
import { Mars, Plus, Search, Venus } from "lucide-solid";

import { ViewComponentProps, PageKeys } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Input, ListView, ScrollView, Skeleton } from "@/components/ui";

import { ButtonCore, DialogCore, DropdownMenuCore, InputCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { base, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import {
  addFriend,
  fetchStudentList,
  fetchStudentListProcess,
  fetchStudentProfile,
  fetchStudentProfileProcess,
  studentToFriend,
} from "@/biz/student/services";
import { HumanGenderType } from "@/biz/student/constants";
import { SingleFieldCore } from "@/domains/ui/formv2";
import { Sheet } from "@/components/ui/sheet";
import { Result } from "@/domains/result";
import { fetchCoachProfile } from "@/biz/coach/service";

function StudentListViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      list: new ListCore(new RequestCore(fetchStudentList, { process: fetchStudentListProcess, client: props.client })),
      profile: new RequestCore(fetchStudentProfile, { process: fetchStudentProfileProcess, client: props.client }),
      to_friend: new RequestCore(studentToFriend, { client: props.client }),
    },
    coach: {
      profile: new RequestCore(fetchCoachProfile, { client: props.client }),
    },
    friend: {
      add: new RequestCore(addFriend, { client: props.client, onFailed() {} }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    search() {
      const v = ui.$input_search.value;
      request.student.list.search({ keyword: v });
    },
    gotoStudentProfileView(v: { id: number }) {
      props.history.push("root.student_profile", {
        id: String(v.id),
      });
    },
    gotoStudentCreateView() {
      props.history.push("root.student_create");
    },
    async addFriend(v: { uid: string }) {
      const r = await request.friend.add.run({ uid: v.uid });
      if (r.error) {
        return Result.Err(r.error);
      }
      return Result.Ok(null);
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.student.list.refresh();
        ui.$view.finishPullToRefresh();
      },
      async onReachBottom() {
        await request.student.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $create_btn: new ButtonCore({
      onClick() {
        props.history.push("root.student_create");
      },
    }),
    $input_search: new InputCore({ defaultValue: "" }),
    $dialog_friend_uid: new DialogCore({}),
    $field_friend_uid: new SingleFieldCore({
      rules: [
        {
          required: true,
        },
      ],
      input: new InputCore({ defaultValue: "", placeholder: "请输入好友 UID" }),
    }),
    $btn_friend_profile: new ButtonCore({
      async onClick() {
        const r = await ui.$field_friend_uid.validate();
        if (r.error) {
          props.app.tip({
            text: r.error.messages,
          });
          return;
        }
        const uid = r.data;
        ui.$btn_friend_profile.setLoading(true);
        const r2 = await request.coach.profile.run({ uid });
        ui.$btn_friend_profile.setLoading(false);
        if (r2.error) {
          return;
        }
        ui.$field_friend_uid.clear();
        ui.$dialog_friend_uid.hide();
        ui.$dialog_friend_confirm.show();
      },
    }),
    $dialog_to_friend: new DialogCore({}),
    $btn_to_friend: new ButtonCore({
      async onClick() {
        const v = request.coach.profile.response;
        if (!v) {
          return;
        }
        ui.$btn_to_friend.setLoading(true);
        const r = await request.student.to_friend.run({ id: v.id });
        ui.$btn_to_friend.setLoading(false);
        if (r.error) {
          return;
        }
        ui.$dialog_to_friend.hide();
        props.app.tip({
          text: ["变更成功"],
        });
      },
    }),
    $btn_friend_add_confirm: new ButtonCore({
      async onClick() {
        const profile = request.coach.profile.response;
        if (!profile) {
          props.app.tip({
            text: ["异常操作"],
          });
          return;
        }
        ui.$btn_friend_add_confirm.setLoading(true);
        const r2 = await methods.addFriend({ uid: profile.uid });
        ui.$btn_friend_add_confirm.setLoading(false);
        if (r2.error) {
          if (r2.error.code === 201) {
            // request.student.profile.run({ id: uid });
            ui.$dialog_friend_uid.hide();
            ui.$dialog_to_friend.show();
            return;
          }
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["新增成功"],
        });
        ui.$dialog_friend_confirm.hide();
        request.student.list.refresh();
      },
    }),
    $dialog_friend_confirm: new DialogCore({}),
    $menu_create: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "新增学员",
          onClick() {
            ui.$menu_create.hide();
            props.history.push("root.student_create");
          },
        }),
        new MenuItemCore({
          label: "添加好友",
          onClick() {
            ui.$menu_create.hide();
            ui.$dialog_friend_uid.show();
          },
        }),
      ],
    }),
  };
  let _state = {
    get response() {
      return request.student.list.response;
    },
    get student_loading() {
      return request.coach.profile.loading;
    },
    get student_error() {
      return request.coach.profile.error;
    },
    get student_profile() {
      return request.coach.profile.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.student.list.onStateChange(() => methods.refresh());
  // request.student.profile.onStateChange(() => methods.refresh());
  request.coach.profile.onStateChange(() => methods.refresh());

  const unlisten = props.history.onRouteChange((v) => {
    if ((v.name as PageKeys) === "root.home_layout.student_list") {
      if (v.reason === "back") {
        request.student.list.refresh();
      }
    }
  });

  return {
    state: _state,
    ui,
    request,
    methods,
    ready() {
      request.student.list.init();
    },
    destroy() {
      bus.destroy();
      unlisten();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function StudentListPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(StudentListViewModel, [props]);

  return (
    <>
      <div class="flex items-center justify-between gap-2 p-2 bg-w-bg-0">
        {/* <div class="text-xl text-w-fg-0"></div> */}
        <Input class="w-full" store={vm.ui.$input_search} />
        <div
          class="p-2 rounded-full bg-w-bg-5"
          onClick={() => {
            vm.methods.search();
          }}
        >
          <Search class="w-6 h-6 text-w-fg-0" />
        </div>
        <div
          class="p-2 rounded-full bg-w-bg-5"
          onClick={(event) => {
            // vm.methods.gotoStudentCreateView();
            const { x, y } = event.currentTarget.getBoundingClientRect();
            vm.ui.$menu_create.toggle({ x, y });
          }}
        >
          <Plus class="w-6 h-6 text-w-fg-0" />
        </div>
      </div>
      <div class="absolute top-[56px] bottom-0 w-full bg-w-bg-0">
        <ScrollView store={vm.ui.$view} class="scroll--hidden">
          <div class="p-2">
            <ListView
              store={vm.request.student.list}
              class="space-y-2"
              skeleton={
                <>
                  <div class="p-4 rounded-lg border-2 border-w-fg-3">
                    <Skeleton class="w-[32px] h-[28px]" />
                  </div>
                </>
              }
            >
              <For each={state().response.dataSource}>
                {(student) => {
                  return (
                    <div
                      class="p-4 rounded-lg border-2 border-w-fg-3"
                      onClick={() => {
                        vm.methods.gotoStudentProfileView(student);
                      }}
                    >
                      <div class="flex items-center gap-2">
                        <div
                          class="rounded-full w-[48px] h-[48px] bg-w-bg-5"
                          style={{
                            "background-image": `url('${student.avatar_url}')`,
                            "background-size": "cover",
                            "background-position": "center",
                          }}
                        ></div>
                        <div class="space-y-1">
                          <div class="text-lg text-w-fg-0">{student.nickname}</div>
                          <div>
                            <Show when={student.gender === HumanGenderType.Female}>
                              <Venus class="w-3 h-3 text-pink-500" />
                            </Show>
                            <Show when={student.gender === HumanGenderType.Male}>
                              <Mars class="w-4 h-4 text-blue-500" />
                            </Show>
                          </div>
                          <div class="text-sm text-w-fg-1">{student.role_text}</div>
                        </div>
                      </div>
                      <div class="flex items-center justify-between">
                        <div></div>
                        <div class="px-4 py-1 border-2 border-w-fg-3 bg-w-bg-5 rounded-full">
                          <div class="text-sm text-w-fg-0">详情</div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </ListView>
          </div>
        </ScrollView>
      </div>
      <Sheet store={vm.ui.$dialog_friend_uid} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">添加好友</div>
            <div>
              <Input store={vm.ui.$field_friend_uid.input} />
            </div>
            <div class="flex items-center justify-between">
              <Button class="w-full" store={vm.ui.$btn_friend_profile}>
                查询
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_to_friend} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">变更为好友</div>
            <div class="flex flex-col items-center">
              <Show
                when={state().student_profile?.avatar_url}
                fallback={<div class="w-[48px] h-[48px] rounded-full bg-w-bg-5">{/* 头像占位 */}</div>}
              >
                <div
                  class="w-[48px] h-[48px] aspect-square rounded-full"
                  style={{
                    "background-image": `url('${state().student_profile?.avatar_url}')`,
                    "background-size": "cover",
                    "background-position": "center",
                  }}
                ></div>
                <div class="flex items-center gap-2">
                  <div class="text-w-fg-0 text-center font-semibold">{state().student_profile?.nickname}</div>
                </div>
              </Show>
              <div class="mt-4 text-center text-w-fg-0">该用户当前为您的学员，是否变更关系为好友</div>
              <div class="text-center text-w-fg-1 text-sm"></div>
            </div>
            <div class="flex items-center justify-between">
              <Button class="w-full" store={vm.ui.$btn_to_friend}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_friend_confirm} app={props.app}>
        <div class="p-2">
          <div class="space-y-4">
            <div class="text-xl text-center text-w-fg-0">添加好友</div>
            <div class="flex flex-col items-center">
              <Show
                when={state().student_profile?.avatar_url}
                fallback={<div class="w-[48px] h-[48px] rounded-full bg-w-bg-5">{/* 头像占位 */}</div>}
              >
                <div
                  class="w-[48px] h-[48px] aspect-square rounded-full"
                  style={{
                    "background-image": `url('${state().student_profile?.avatar_url}')`,
                    "background-size": "cover",
                    "background-position": "center",
                  }}
                ></div>
                <div class="flex items-center gap-2">
                  <div class="text-w-fg-0 text-center font-semibold">{state().student_profile?.nickname}</div>
                </div>
              </Show>
            </div>
            <div class="flex items-center justify-between">
              <Button class="w-full" store={vm.ui.$btn_friend_add_confirm}>
                添加
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$menu_create}></DropdownMenu>
    </>
  );
}
