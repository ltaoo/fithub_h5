/**
 * 肌肉信息管理
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ScrollView } from "@/components/ui";
import { createEquipment, fetchEquipmentList, fetchEquipmentListProcess } from "@/biz/equipment/services";
import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { ScrollViewCore, SelectCore, DialogCore, ButtonCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { TmpRequestResp, UnpackedRequestPayload, RequestPayload } from "@/domains/request/utils";
import { Unpacked } from "@/types";

import { EquipmentValueView } from "./equipment_form";

function HomeEquipmentPageViewModel(props: ViewComponentProps) {
  let _loading = false;
  let _state = {
    get loading() {
      return _loading;
    },
    get list() {
      return (
        request.equipment.list.response?.list ?? ([] as TheResponseOfRequestCore<typeof request.equipment.list>["list"])
      );
    },
  };
  const request = {
    equipment: {
      list: new RequestCore(fetchEquipmentList, { process: fetchEquipmentListProcess, client: props.client }),
      create: new RequestCore(createEquipment, { client: props.client }),
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $values_dialog_btn: new ButtonCore({
      onClick() {
        ui.$values_dialog.show();
      },
    }),
    $values_dialog: new DialogCore({
      async onOk() {
        const r = await ui.$values.validate();
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        const values = r.data;
        console.log("[PAGE]home_muscle/index - onOk", values);
        const { name, zh_name, overview } = values;
        const body = {
          name,
          zh_name,
          overview,
          media: "{}",
        };
        const r2 = await request.equipment.create.run(body);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        request.equipment.list.run();
      },
    }),
    $values: new ObjectFieldCore({
      name: "",
      label: "",
      fields: {
        name: new SingleFieldCore({
          name: "name",
          label: "英文名称",
          input: new InputCore({ defaultValue: "" }),
        }),
        zh_name: new SingleFieldCore({
          name: "zh_name",
          label: "中文名称",
          input: new InputCore({ defaultValue: "" }),
        }),
        overview: new SingleFieldCore({
          name: "overview",
          label: "概述",
          input: new InputCore({ defaultValue: "", type: "textarea" }),
        }),
      },
    }),
  };

  const _methods = {
    setState(state: Partial<typeof _state>) {
      _state = { ..._state, ...state };
      bus.emit(Events.StateChange, { ..._state });
    },
    validate() {},
    handleSubmit() {},
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
    state: _state,
    methods: _methods,
    ui,
    ready() {
      request.equipment.list.run();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeEquipmentPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeEquipmentPageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <h1 class="text-2xl font-bold mb-4">器械列表</h1>
        <div>
          <Button store={vm.ui.$values_dialog_btn}>创建器械</Button>
        </div>
        <div class="space-y-4 py-4">
          <For each={state().list}>
            {(item) => {
              return (
                <div class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
                  {/* 标题区域 */}
                  <div class="flex items-center gap-3 mb-4">
                    <h3 class="text-xl font-bold text-gray-800">{item.zh_name}</h3>
                    <span class="text-gray-500">({item.name})</span>
                  </div>

                  {/* 概述 */}
                  <div class="text-gray-600 mb-4 leading-relaxed">{item.overview}</div>
                </div>
              );
            }}
          </For>
        </div>
      </ScrollView>
      <Dialog store={vm.ui.$values_dialog}>
        <div class="w-[720px]">
          <EquipmentValueView store={vm.ui.$values} />
        </div>
      </Dialog>
    </>
  );
}
