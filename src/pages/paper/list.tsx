import { For, Show } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { DropdownMenu, ListView } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DropdownMenuCore, MenuItemCore, ScrollViewCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchPaperList, fetchRunningExam, startExam } from "@/biz/paper/services";
import { Result } from "@/domains/result";
import { Sheet } from "@/components/ui/sheet";

function PaperListViewModel(props: ViewComponentProps) {
  const request = {
    paper: {
      list: new ListCore(new RequestCore(fetchPaperList, { client: props.client })),
    },
    exam: {
      start: new RequestCore(startExam, { client: props.client }),
      running: new RequestCore(fetchRunningExam, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    async startExam(v: { id: number }) {
      const r = await request.exam.start.run({ paper_id: v.id });
      if (r.error) {
        return Result.Err(r.error.message);
      }
      return Result.Ok(r.data);
    },
    async fetchRunningExamList() {
      const r = await request.exam.running.run();
      if (r.error) {
        return Result.Err(r.error.message);
      }
      _running_exam = r.data.list[0] ?? null;
      methods.refresh();
      return Result.Ok(r.data);
    },
    async handleStartExam(v: { id: number }) {
      const r = await methods.startExam(v);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      methods.gotoExamView(r.data);
    },
    gotoExamView(v: { id: number }) {
      props.history.push("root.exam", {
        id: String(v.id),
      });
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $dropdown_menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "答题记录",
          onClick() {},
        }),
        new MenuItemCore({
          label: "错题本",
          onClick() {},
        }),
        new MenuItemCore({
          label: "收藏夹",
          onClick() {},
        }),
      ],
    }),
  };
  let _running_exam: { id: number } | null = null;
  let _state = {
    get response() {
      return request.paper.list.response;
    },
    get running_exam() {
      return _running_exam;
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  request.paper.list.onStateChange(() => methods.refresh());

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.paper.list.init();
      methods.fetchRunningExamList();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function PaperListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(PaperListViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center justify-between">
            <div></div>
            <div
              class="p-2 rounded-full bg-w-bg-5"
              onClick={(event) => {
                const { x, y } = event.currentTarget.getBoundingClientRect();
                vm.ui.$dropdown_menu.toggle({ x, y });
              }}
            >
              <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
            </div>
          </div>
        }
      >
        <ListView store={vm.request.paper.list}>
          <For each={state().response.dataSource}>
            {(v) => {
              return (
                <div class="p-4">
                  <div>{v.name}</div>
                  <div>共{v.quiz_count}题</div>
                  <div
                    onClick={() => {
                      vm.methods.handleStartExam(v);
                    }}
                  >
                    开始答题
                  </div>
                </div>
              );
            }}
          </For>
        </ListView>
      </PageView>
      <DropdownMenu store={vm.ui.$dropdown_menu} />
      <Show when={state().running_exam}>
        <div class="z-[100] fixed bottom-0 w-full p-4">
          <div class="p-4 border-2 border-w-bg-5 rounded-lg bg-w-bg-1">
            <div>有未完成的答题</div>
            <div
              onClick={() => {
                vm.methods.gotoExamView(state().running_exam!);
              }}
            >
              继续答题
            </div>
            <div>放弃</div>
          </div>
        </div>
      </Show>
    </>
  );
}
