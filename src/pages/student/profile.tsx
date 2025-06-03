/**
 * @file 学员详情
 */
import { For, Show } from "solid-js";
import { Edit } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { ScrollView, Skeleton } from "@/components/ui";
import { NavigationBar1 } from "@/components/navigation-bar1";

import { base, Handler } from "@/domains/base";
import { ScrollViewCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { fetchStudentList, fetchStudentProfile, fetchStudentProfileProcess } from "@/biz/student/services";
import { CalendarCore } from "@/domains/ui/calendar";
import { PageView } from "@/components/page-view";

function MemberProfileViewModel(props: ViewComponentProps) {
  const request = {
    student: {
      profile: new RequestCore(fetchStudentProfile, { process: fetchStudentProfileProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
  };
  const ui = {
    $view: new ScrollViewCore({
      async onPullToRefresh() {
        await request.student.profile.reload();
        ui.$view.finishPullToRefresh();
      },
    }),
    $calendar: CalendarCore({
      today: new Date(),
    }),
  };
  let _state = {
    get loading() {
      return request.student.profile.loading;
    },
    get profile() {
      return request.student.profile.response;
    },
    get calendar() {
      return ui.$calendar.state;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.student.profile.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        return;
      }
      request.student.profile.run({ id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeStudentProfilePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MemberProfileViewModel, [props]);
  return (
    <>
      <PageView store={vm}>
        <div class="">
          <Show
            when={state().profile}
            fallback={
              <div class="flex items-center gap-2">
                <div>
                  <Skeleton class="w-[64px] h-[64px] rounded-full"></Skeleton>
                </div>
                <div>
                  <Skeleton class="w-[42px] h-[28px]" />
                </div>
              </div>
            }
          >
            <div class="flex items-center gap-2">
              <div>
                <div class="w-[64px] h-[64px] bg-w-bg-5 rounded-full"></div>
              </div>
              <div class="text-xl">{state().profile?.nickname}</div>
            </div>
          </Show>
        </div>
        <div class="relative space-y-2 mt-4">
          <div class="relative border-2 border-w-bg-5 rounded-lg">
            <div class="extra absolute right-2 top-2">
              <div class="p-2 rounded-full bg-w-bg-5">
                <Edit class="w-4 h-4 text-w-fg-1" />
              </div>
            </div>
            <div class="header p-4 border-b-2 border-w-bg-5">
              <div class="text-w-fg-1">身体信息</div>
            </div>
            <div class="body p-4">
              <div></div>
            </div>
          </div>
          <div class="relative border-2 border-w-bg-5 rounded-lg">
            <div class="header p-4 border-b-2 border-w-bg-5">
              <div class="text-w-fg-1">训练日历</div>
            </div>
            <div class="body p-4">
              <div class="grid grid-cols-7 gap-2">
                <div class="text-center text-sm text-w-fg-2">周一</div>
                <div class="text-center text-sm text-w-fg-2">周二</div>
                <div class="text-center text-sm text-w-fg-2">周三</div>
                <div class="text-center text-sm text-w-fg-2">周四</div>
                <div class="text-center text-sm text-w-fg-2">周五</div>
                <div class="text-center text-sm text-w-fg-2">周六</div>
                <div class="text-center text-sm text-w-fg-2">周日</div>
              </div>
              <For each={state().calendar.weeks}>
                {(week) => {
                  return (
                    <div class="grid grid-cols-7 gap-2">
                      <For each={week.dates}>
                        {(date) => {
                          return (
                            <div
                              classList={{
                                "p-2": true,
                                "opacity-40": date.is_next_month || date.is_prev_month,
                                "bg-w-bg-5": date.is_today,
                              }}
                            >
                              <div class="text-center text-sm text-w-fg-1">{date.text}</div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
          <div class="relative border-2 border-w-bg-5 rounded-lg">
            <div class="header p-4 border-b-2 border-w-bg-5">
              <div class="text-w-fg-1">问卷调查</div>
            </div>
            <div class="body p-4"></div>
          </div>
        </div>
      </PageView>
    </>
  );
}
