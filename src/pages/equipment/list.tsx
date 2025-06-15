/**
 * @file 器械信息管理
 */
import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ListView, ScrollView, Skeleton } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { ScrollViewCore, SelectCore, DialogCore, ButtonCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { ListCore } from "@/domains/list";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { TmpRequestResp, UnpackedRequestPayload, RequestPayload } from "@/domains/request/utils";
import { createEquipment, fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { Unpacked } from "@/types";

function EquipmentListViewModel(props: ViewComponentProps) {
  const request = {
    equipment: {
      list: new ListCore(
        new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
        {
          pageSize: 20,
        }
      ),
    },
  };
  type TheEquipment = TheItemTypeFromListCore<typeof request.equipment.list>;
  const ui = {
    $view: new ScrollViewCore({
      async onReachBottom() {
        await request.equipment.list.loadMore();
        ui.$view.finishLoadingMore();
      },
    }),
    $dialog_profile: new DialogCore({}),
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    setState(state: Partial<typeof _state>) {
      _state = { ..._state, ...state };
      methods.refresh();
    },
    showDialogEquipmentProfile(equipment: TheEquipment) {
      _cur_equipment = equipment;
      methods.refresh();
      ui.$dialog_profile.show();
    },
    gotoEquipmentManageView() {
      props.history.push("root.equipment_manage");
    },
  };

  let _loading = false;
  let _cur_equipment: TheEquipment | null = null;
  let _state = {
    get loading() {
      return _loading;
    },
    get list() {
      return request.equipment.list.response.dataSource;
    },
    get cur_equipment() {
      return _cur_equipment;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  request.equipment.list.onStateChange(() => bus.emit(Events.StateChange, { ..._state }));

  return {
    request,
    methods,
    ui,
    state: _state,
    ready() {
      request.equipment.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function EquipmentListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(EquipmentListViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        // operations={
        //   <div class="flex items-center justify-between">
        //     <div></div>
        //     <div
        //       class="p-2 rounded-full bg-w-bg-5"
        //       onClick={() => {
        //         vm.methods.gotoEquipmentManageView();
        //       }}
        //     >
        //       <Shapes class="w-6 h-6 text-w-fg-1" />
        //     </div>
        //   </div>
        // }
      >
        <ListView class="" store={vm.request.equipment.list}>
          <div class="grid grid-cols-2 gap-2">
            <For
              each={state().list}
              fallback={
                <div class="p-4 rounded-lg border-2 border-w-fg-3">
                  <Skeleton class="w-[36px] h-[24px]" />
                  <Skeleton class="mt-[2px] w-[48px] h-[16px]" />
                </div>
              }
            >
              {(v) => {
                return (
                  <div
                    class="p-4 rounded-lg border-2 border-w-fg-3"
                    onClick={() => {
                      vm.methods.showDialogEquipmentProfile(v);
                    }}
                  >
                    <div class="">
                      <div class="text-w-fg-0">{v.zh_name}</div>
                      <span class="text-sm text-w-fg-1">({v.name})</span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </ListView>
      </PageView>
      <Sheet store={vm.ui.$dialog_profile} app={props.app}>
        <Show when={state().cur_equipment}>
          <div class="min-h-[240px] p-2">
            <div class="text-lg text-w-fg-0">{state().cur_equipment?.zh_name}</div>
            <div class="mt-2 text-w-fg-1">{state().cur_equipment?.overview}</div>
            <Show when={state().cur_equipment?.medias.pics.length}>
              <div class="overflow-x-auto mt-4 pb-2">
                <div class="flex gap-3 min-w-min">
                  <For each={state().cur_equipment?.medias.pics}>
                    {(img) => {
                      return (
                        <div class="flex-shrink-0 w-[120px] h-[120px] rounded-lg overflow-hidden">
                          <img class="w-full h-full object-cover" src={img} />
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </Sheet>
    </>
  );
}
