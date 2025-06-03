/**
 * @file 健身动作列表
 */
import { For } from "solid-js";
import { MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, DropdownMenu, Input, ListView, ScrollView, Textarea } from "@/components/ui";
import { Select } from "@/components/ui/select";

import { base, Handler } from "@/domains/base";
import {
  ButtonCore,
  DialogCore,
  DropdownMenuCore,
  InputCore,
  MenuItemCore,
  ScrollViewCore,
  SelectCore,
} from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { ListCore } from "@/domains/list";
import { WorkoutActionType, WorkoutActionTypeOptions } from "@/biz/workout_action/constants";
import { fetchWorkoutActionList, fetchWorkoutActionListProcess } from "@/biz/workout_action/services";
import { PageView } from "@/components/page-view";
import { WorkoutActionMultipleSelectViewModel } from "@/biz/workout_action_multiple_select";
import { WorkoutActionSelectDialogViewModel } from "@/biz/workout_action_select_dialog";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { Sheet } from "@/components/ui/sheet";
import { createReport } from "@/biz/report/services";

function WorkoutActionListViewModel(props: ViewComponentProps) {
  const request = {
    workout_action: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionList, { process: fetchWorkoutActionListProcess, client: props.client }),
        {
          pageSize: 24,
        }
      ),
    },
    report: {
      create: new RequestCore(createReport, { client: props.client }),
    },
  };
  type TheWorkoutAction = TheItemTypeFromListCore<typeof request.workout_action.list>;
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickWorkoutAction(action: TheWorkoutAction) {},
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $select: WorkoutActionSelectDialogViewModel({
      defaultValue: [],
      list: request.workout_action.list,
      client: props.client,
    }),
    $dropdown_menu: new DropdownMenuCore({
      items: [
        new MenuItemCore({
          label: "问题反馈",
          onClick() {
            ui.$dropdown_menu.hide();
            ui.$dialog_report.show();
          },
        }),
        new MenuItemCore({
          label: "我的反馈",
          onClick() {
            ui.$dropdown_menu.hide();
            props.history.push("root.report_list");
          },
        }),
      ],
    }),
    $dialog_report: new DialogCore({}),
    $input_report: new InputCore({ defaultValue: "" }),
    $btn_report_submit: new ButtonCore({
      async onClick() {
        const v = ui.$input_report.value;
        if (!v) {
          props.app.tip({
            text: ["请输入反馈内容"],
          });
          return;
        }
        ui.$btn_report_submit.setLoading(true);
        const r = await request.report.create.run({
          content: v,
        });
        ui.$btn_report_submit.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        ui.$input_report.clear();
        props.app.tip({
          text: ["反馈成功"],
        });
        ui.$dialog_report.hide();
      },
    }),
  };

  let _state = {
    get response() {
      return ui.$select.request.action.list.response;
    },
    get tags() {
      return ui.$select.state.tags;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$select.onStateChange(() => methods.refresh());

  return {
    state: _state,
    ui,
    request,
    methods,
    ready() {
      ui.$select.request.action.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function WorkoutActionListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(WorkoutActionListViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        no_padding
        no_extra_bottom
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
              <MoreHorizontal class="w-6 h-6 text-w-fg-1" />
            </div>
          </div>
        }
      >
        <div class="flex flex-col h-full bg-w-bg-0 border-t-2 border-w-bg-5">
          <div class="flex gap-2 p-2">
            <div class="w-[240px]">
              <Select store={vm.ui.$select.ui.$input_type_select} />
            </div>
            <Input store={vm.ui.$select.ui.$input_keyword} />
            <Button store={vm.ui.$select.ui.$btn_search_submit} size="sm">
              搜索
            </Button>
          </div>
          <div class="flex-1 flex h-0 border-t-2 border-w-bg-5">
            <div class="scroll--hidden w-[90px] h-full pt-2 px-2 overflow-y-auto border-r-2 border-w-bg-5">
              <For each={state().tags}>
                {(tag) => {
                  return (
                    <div
                      classList={{
                        "py-2 rounded-md text-center border-2 border-w-bg-0 ": true,
                        "text-w-fg-0": tag.selected,
                        "text-w-fg-2": !tag.selected,
                      }}
                      onClick={() => {
                        vm.ui.$select.methods.handleClickTag(tag);
                      }}
                    >
                      <div class="text-center text-sm">{tag.text}</div>
                    </div>
                  );
                }}
              </For>
            </div>
            <ScrollView store={vm.ui.$select.ui.$view} class="flex-1 h-full overflow-y-auto">
              <ListView store={vm.request.workout_action.list}>
                <div class="actions grid grid-cols-3 gap-2 p-2">
                  <For each={state().response.dataSource}>
                    {(action) => {
                      return (
                        <div
                          classList={{
                            "relative p-2 flex justify-between border-2 border-w-bg-5 rounded-md text-w-fg-1": true,
                          }}
                          onClick={() => {
                            vm.methods.handleClickWorkoutAction(action);
                          }}
                        >
                          <div class="absolute inset-0 p-2">
                            <div class="overflow-hidden  truncate line-clamp-2 break-all whitespace-pre-wrap">
                              <div class="text-sm">{action.zh_name}</div>
                            </div>
                          </div>
                          <div class="w-full" style="padding-bottom: 100%"></div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </ListView>
            </ScrollView>
          </div>
        </div>
      </PageView>
      <Sheet store={vm.ui.$dialog_report}>
        <div class="w-screen bg-w-bg-1 p-2">
          <div class="text-xl text-center text-w-fg-0">问题反馈</div>
          <div class="mt-4">
            <Textarea store={vm.ui.$input_report} />
          </div>
          <div class="mt-2">
            <Button class="w-full" store={vm.ui.$btn_report_submit}>
              提交
            </Button>
          </div>
        </div>
      </Sheet>
      <DropdownMenu store={vm.ui.$dropdown_menu} />
    </>
  );
}
