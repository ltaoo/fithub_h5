/**
 * @file 器械信息管理
 */
import { For, Show } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ScrollView, Skeleton } from "@/components/ui";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { ScrollViewCore, SelectCore, DialogCore, ButtonCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { TmpRequestResp, UnpackedRequestPayload, RequestPayload } from "@/domains/request/utils";
import { createEquipment, fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { Unpacked } from "@/types";
import { Shapes } from "lucide-solid";

function EquipmentListViewModel(props: ViewComponentProps) {
  const request = {
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
    },
  };
  type TheEquipment = TheResponseOfRequestCore<typeof request.equipment.list>["list"][number];
  const ui = {
    $view: new ScrollViewCore({}),
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
      return (
        request.equipment.list.response?.list ?? ([] as TheResponseOfRequestCore<typeof request.equipment.list>["list"])
      );
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
    methods,
    ui,
    state: _state,
    ready() {
      request.equipment.list.run();
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
            {(equipment) => {
              return (
                <div
                  class="p-4 rounded-lg border-2 border-w-fg-3"
                  onClick={() => {
                    vm.methods.showDialogEquipmentProfile(equipment);
                  }}
                >
                  <div class="">
                    <div class="text-w-fg-0">{equipment.zh_name}</div>
                    <span class="text-sm text-w-fg-1">({equipment.name})</span>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </PageView>
      <Sheet store={vm.ui.$dialog_profile} app={props.app}>
        <div class="min-h-[240px] p-2">
          <Show when={state().cur_equipment}>
            <div class="text-w-fg-0">{state().cur_equipment?.overview}</div>
          </Show>
        </div>
      </Sheet>
    </>
  );
}
