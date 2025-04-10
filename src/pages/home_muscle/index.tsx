/**
 * 肌肉信息管理
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ScrollView } from "@/components/ui";
import {
  createMuscle,
  deleteMuscle,
  fetchMuscleList,
  fetchMuscleListProcess,
  MuscleProfile,
  updateMuscle,
} from "@/biz/muscle/services";
import { base, Handler } from "@/domains/base";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { ScrollViewCore, SelectCore, DialogCore, ButtonCore, ButtonInListCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { TmpRequestResp, UnpackedRequestPayload, RequestPayload } from "@/domains/request/utils";
import { Unpacked } from "@/types";

import { MuscleValueView } from "./muscle_form";
import { RefCore } from "@/domains/ui/cur";

function HomeMusclePageViewModel(props: ViewComponentProps) {
  let _loading = false;
  let _state = {
    get loading() {
      return _loading;
    },
    get list() {
      return request.muscle.list.response?.list ?? ([] as TheResponseOfRequestCore<typeof request.muscle.list>["list"]);
    },
  };
  const request = {
    muscle: {
      list: new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client }),
      create: new RequestCore(createMuscle, { client: props.client }),
      delete: new RequestCore(deleteMuscle, { client: props.client }),
      update: new RequestCore(updateMuscle, { client: props.client }),
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $values_dialog_btn: new ButtonCore({
      onClick() {
        ui.$muscle_create_dialog.show();
      },
    }),
    $edit_btns: new ButtonInListCore<MuscleProfile>({
      onClick(muscle) {
        console.log("[PAGE]home_muscle/index - onEdit", muscle);
        ui.$values.setValue(muscle);
        ui.$muscle_update_dialog.show();
      },
    }),
    $muscle_ref: new RefCore<MuscleProfile>(),
    $delete_confirm_dialog: new DialogCore({
      async onOk() {
        const v = ui.$muscle_ref.value;
        if (!v) {
          props.app.tip({
            text: ["请选择要删除的肌肉"],
          });
          return;
        }
        ui.$delete_confirm_dialog.okBtn.setLoading(true);
        const r = await request.muscle.delete.run({ id: v.id });
        ui.$delete_confirm_dialog.okBtn.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["删除成功"],
        });
        ui.$delete_confirm_dialog.hide();
        request.muscle.list.modifyResponse((resp) => {
          return {
            ...resp,
            list: resp.list.filter((item) => item.id !== v.id),
          };
        });
      },
    }),
    $delete_btns: new ButtonInListCore<MuscleProfile>({
      onClick(muscle) {
        ui.$muscle_ref.select(muscle);
        ui.$delete_confirm_dialog.show();
      },
    }),
    $muscle_create_dialog: new DialogCore({
      title: "创建",
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
        const { name, zh_name, tags, overview, features } = values;
        const body = {
          name,
          zh_name,
          tags: tags.join(","),
          overview,
          features: JSON.stringify(features),
        };
        ui.$muscle_create_dialog.okBtn.setLoading(true);
        const r2 = await request.muscle.create.run(body);
        ui.$muscle_create_dialog.okBtn.setLoading(false);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        ui.$muscle_create_dialog.hide();
        ui.$values.clear();
        request.muscle.list.run();
      },
    }),
    $muscle_update_dialog: new DialogCore({
      title: "更新",
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
        const { id, name, zh_name, tags, overview, features } = values;
        const body = {
          id,
          name,
          zh_name,
          tags: tags.join(","),
          overview,
          features: JSON.stringify(features),
        };
        ui.$muscle_update_dialog.okBtn.setLoading(true);
        const r2 = await request.muscle.update.run(body);
        ui.$muscle_update_dialog.okBtn.setLoading(false);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["更新成功"],
        });
        ui.$muscle_update_dialog.hide();
        ui.$values.clear();
        request.muscle.list.run();
      },
    }),
    $values: new ObjectFieldCore({
      name: "",
      label: "",
      fields: {
        id: new SingleFieldCore({
          name: "id",
          label: "Id",
          hidden: true,
          input: new InputCore({ defaultValue: 0 }),
        }),
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
        tags: new SingleFieldCore({
          name: "tags",
          label: "标签",
          input: new TagInputCore({
            defaultValue: [],
          }),
        }),
        overview: new SingleFieldCore({
          name: "overview",
          label: "概述",
          input: new InputCore({ defaultValue: "", type: "textarea" }),
        }),
        features: new ArrayFieldCore({
          name: "features",
          label: "功能",
          field: (index: number) => {
            return new ObjectFieldCore({
              name: `feature_${index}`,
              label: "",
              fields: {
                title: new SingleFieldCore({
                  name: "title",
                  label: "标题",
                  input: new InputCore({ defaultValue: "" }),
                }),
                details: new SingleFieldCore({
                  name: "details",
                  label: "详情",
                  input: new InputCore({ defaultValue: "", type: "textarea" }),
                }),
              },
            });
          },
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

  request.muscle.list.onStateChange(() => bus.emit(Events.StateChange, { ..._state }));

  return {
    state: _state,
    methods: _methods,
    ui,
    ready() {
      request.muscle.list.run();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function HomeMusclePage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(HomeMusclePageViewModel, [props]);

  return (
    <>
      <ScrollView store={vm.ui.$view} class="p-4">
        <h1 class="text-2xl font-bold mb-4">肌肉列表</h1>
        <div>
          <Button store={vm.ui.$values_dialog_btn}>创建肌肉</Button>
        </div>
        <div class="flex py-4">
          <div class="grid grid-cols-3 gap-4">
            <For each={state().list}>
              {(muscle) => {
                return (
                  <div class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
                    {/* 标题区域 */}
                    <div class="flex items-center gap-3 mb-4">
                      <h3 class="text-xl font-bold text-gray-800">{muscle.zh_name}</h3>
                      <span class="text-gray-500">({muscle.name})</span>
                    </div>

                    {/* 概述 */}
                    <div class="text-gray-600 mb-4 leading-relaxed">{muscle.overview}</div>

                    {/* 标签区域 */}
                    <div class="flex flex-wrap gap-2 mb-4">
                      <For each={muscle.tags}>
                        {(tag) => {
                          return (
                            <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          );
                        }}
                      </For>
                    </div>

                    {/* 功能特性区域 */}
                    <div class="border-t pt-4">
                      <h4 class="text-lg font-semibold text-gray-700 mb-3">功能特性</h4>
                      <For each={muscle.features}>
                        {(feature) => {
                          return (
                            <div class="mb-3 last:mb-0">
                              <div class="font-medium text-gray-800 mb-1">{feature.title}</div>
                              <div class="text-gray-600 text-sm">{feature.details}</div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                    <div class="flex gap-2">
                      <Button data-id={muscle.id} store={vm.ui.$edit_btns.bind(muscle)}>
                        编辑
                      </Button>
                      <Button data-id={muscle.id} store={vm.ui.$delete_btns.bind(muscle)}>
                        删除
                      </Button>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="w-[840px]"></div>
        </div>
      </ScrollView>
      <Dialog store={vm.ui.$muscle_create_dialog}>
        <div class="w-[720px]">
          <MuscleValueView store={vm.ui.$values} />
        </div>
      </Dialog>
      <Dialog store={vm.ui.$muscle_update_dialog}>
        <div class="w-[720px]">
          <MuscleValueView store={vm.ui.$values} />
        </div>
      </Dialog>
      <Dialog store={vm.ui.$delete_confirm_dialog}>
        <div class="w-[520px]">
          <div>
            <h3>确认删除吗？</h3>
          </div>
        </div>
      </Dialog>
    </>
  );
}
