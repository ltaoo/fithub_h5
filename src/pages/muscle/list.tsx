/**
 * 肌肉信息管理
 */
import { For } from "solid-js";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ScrollView } from "@/components/ui";
import { BodyMusclePreview } from "@/components/body-muscle-preview";
import { NavigationBar1 } from "@/components/navigation-bar1";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { RefCore } from "@/domains/ui/cur";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { ScrollViewCore, SelectCore, DialogCore, ButtonCore, ButtonInListCore } from "@/domains/ui";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { ListCore } from "@/domains/list";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import {
  createMuscle,
  deleteMuscle,
  fetchMuscleList,
  fetchMuscleListProcess,
  MuscleProfile,
  updateMuscle,
} from "@/biz/muscle/services";
import { Unpacked } from "@/types";

import { MuscleValueView } from "./muscle_form";

function MuscleListViewModel(props: ViewComponentProps) {
  const request = {
    muscle: {
      list: new ListCore(new RequestCore(fetchMuscleList, { process: fetchMuscleListProcess, client: props.client })),
      create: new RequestCore(createMuscle, { client: props.client }),
      delete: new RequestCore(deleteMuscle, { client: props.client }),
      update: new RequestCore(updateMuscle, { client: props.client }),
    },
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
      bus.emit(Events.StateChange, { ..._state });
    },
    showMuscleProfile(muscle: TheItemTypeFromListCore<typeof request.muscle.list>) {
      ui.$ref_muscle.select(muscle);
      _muscle = muscle;
      ui.$dialog_muscle_profile.show();
      methods.refresh();
    },
    validate() {},
    handleSubmit() {},
  };

  const ui = {
    $view: new ScrollViewCore({}),
    $btn_show_values_dialog: new ButtonCore({
      onClick() {
        ui.$dialog_muscle_create.show();
      },
    }),
    $btn_edit: new ButtonCore({
      onClick() {
        const muscle = ui.$ref_muscle.value;
        if (!muscle) {
          return;
        }
        console.log("[PAGE]home_muscle/index - onEdit", muscle);
        ui.$values.setValue(muscle);
        ui.$dialog_muscle_edit.show();
      },
    }),
    $btn_delete: new ButtonCore({
      onClick() {
        const muscle = ui.$ref_muscle.value;
        if (!muscle) {
          return;
        }
        ui.$ref_muscle.select(muscle);
        ui.$dialog_muscle_delete_confirm.show();
      },
    }),
    $ref_muscle: new RefCore<MuscleProfile>(),
    $dialog_muscle_delete_confirm: new DialogCore({
      async onOk() {
        const v = ui.$ref_muscle.value;
        if (!v) {
          props.app.tip({
            text: ["请选择要删除的肌肉"],
          });
          return;
        }
        ui.$dialog_muscle_delete_confirm.okBtn.setLoading(true);
        const r = await request.muscle.delete.run({ id: v.id });
        ui.$dialog_muscle_delete_confirm.okBtn.setLoading(false);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["删除成功"],
        });
        ui.$dialog_muscle_delete_confirm.hide();
        request.muscle.list.deleteItem((m) => {
          return m.id === v.id;
        });
      },
    }),
    $dialog_muscle_profile: new DialogCore({}),
    $dialog_muscle_create: new DialogCore({
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
        ui.$dialog_muscle_create.okBtn.setLoading(true);
        const r2 = await request.muscle.create.run(body);
        ui.$dialog_muscle_create.okBtn.setLoading(false);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        ui.$dialog_muscle_create.hide();
        ui.$values.clear();
        request.muscle.list.init();
      },
    }),
    $dialog_muscle_edit: new DialogCore({
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
        ui.$dialog_muscle_edit.okBtn.setLoading(true);
        const r2 = await request.muscle.update.run(body);
        ui.$dialog_muscle_edit.okBtn.setLoading(false);
        if (r2.error) {
          props.app.tip({
            text: [r2.error.message],
          });
          return;
        }
        props.app.tip({
          text: ["更新成功"],
        });
        ui.$dialog_muscle_edit.hide();
        ui.$values.clear();
        request.muscle.list.init();
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
  let _loading = false;
  let _muscle: TheItemTypeFromListCore<typeof request.muscle.list> | null = null;
  let _state = {
    get loading() {
      return _loading;
    },
    get response() {
      return request.muscle.list.response;
    },
    get muscle() {
      return _muscle;
    },
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
    methods,
    ui,
    state: _state,
    ready() {
      request.muscle.list.init();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function MuscleListView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(MuscleListViewModel, [props]);

  return (
    <>
      <div class="z-0 fixed top-0 left-0 w-full">
        <NavigationBar1 title="肌肉" history={props.history} />
      </div>
      <div class="absolute top-[58px] bottom-0 left-0 w-full">
        <ScrollView store={vm.ui.$view}>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-2">
              <For each={state().response.dataSource}>
                {(muscle) => {
                  return (
                    <div
                      class="bg-white rounded-lg border p-4"
                      onClick={() => {
                        vm.methods.showMuscleProfile(muscle);
                      }}
                    >
                      <div class="">
                        <h3 class="text-xl text-gray-800">{muscle.zh_name}</h3>
                        <span class="text-gray-500">{muscle.name}</span>
                      </div>

                      {/* 概述 */}
                      {/* <div class="text-gray-600 mb-4 leading-relaxed">{muscle.overview}</div> */}

                      {/* 标签区域 */}
                      {/* <div class="flex flex-wrap gap-2 mb-4">
                      <For each={muscle.tags}>
                        {(tag) => {
                          return (
                            <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          );
                        }}
                      </For>
                    </div> */}

                      {/* 功能特性区域 */}
                      {/* <div class="border-t pt-4">
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
                    </div> */}
                      {/* <div class="flex gap-2">
                      <Button data-id={muscle.id} store={vm.ui.$btns_edit.bind(muscle)}>
                        编辑
                      </Button>
                      <Button data-id={muscle.id} store={vm.ui.$btns_delete.bind(muscle)}>
                        删除
                      </Button>
                    </div> */}
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </ScrollView>
      </div>
      <Sheet store={vm.ui.$dialog_muscle_profile}>
        <div class="overflow-y-auto w-screen max-h-screen bg-white p-4">
          <div class="">
            <h3 class="text-xl text-gray-800">{state().muscle?.zh_name}</h3>
            <span class="text-gray-500">{state().muscle?.name}</span>
          </div>
          <div class="text-gray-600 mb-4 leading-relaxed">{state().muscle?.overview}</div>
          {/* <BodyMusclePreview highlighted={[]} /> */}
          <div class="border-t pt-4">
            <h4 class="text-lg font-semibold text-gray-700 mb-3">功能特性</h4>
            <For each={state().muscle?.features}>
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
            <Button store={vm.ui.$btn_edit}>编辑</Button>
            <Button store={vm.ui.$btn_delete}>删除</Button>
          </div>
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_muscle_create}>
        <div class="w-[720px]">
          <MuscleValueView store={vm.ui.$values} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_muscle_edit}>
        <div class="w-[720px]">
          <MuscleValueView store={vm.ui.$values} />
        </div>
      </Sheet>
      <Sheet store={vm.ui.$dialog_muscle_delete_confirm}>
        <div class="w-[520px]">
          <div>
            <h3>确认删除吗？</h3>
          </div>
        </div>
      </Sheet>
    </>
  );
}
