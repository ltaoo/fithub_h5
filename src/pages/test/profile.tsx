import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";
import { Button, Input } from "@/components/ui";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { createWorkoutDay } from "@/biz/workout_day/services";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { FieldObjV2 } from "@/components/fieldv2/obj";
import { FieldV2 } from "@/components/fieldv2/field";
import { FieldArrV2 } from "@/components/fieldv2/arr";
import { Select } from "@/components/ui/select";
import { InputWithKeyboardView, InputWithKeyboardViewModel } from "@/components/input-with-keyboard";

function FeaturePlaygroundViewModel(props: ViewComponentProps) {
  const request = {
    workout_day: {
      create: new RequestCore(createWorkoutDay, { _name: "create_workout_day", client: props.client, onFailed() {} }),
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
    $view: new ScrollViewCore(),
    $history: props.history,
    $btn: new ButtonCore({
      async onClick() {
        ui.$values.fields.persons.fields[0].field.setValue({
          name: "update_value",
        });
      },
    }),
    $input: InputWithKeyboardViewModel({ app: props.app }),
    $values: new ObjectFieldCore({
      name: "",
      label: "表单",
      fields: {
        persons: new ArrayFieldCore({
          name: "",
          label: "参与成员",
          field() {
            return new ObjectFieldCore({
              name: "",
              label: "",
              fields: {
                name: new SingleFieldCore({
                  name: "",
                  label: "名称",
                  input: new InputCore({ defaultValue: "" }),
                }),
                age: new SingleFieldCore({
                  name: "",
                  label: "年龄",
                  input: new InputCore({ defaultValue: 18, type: "number" }),
                }),
                gender: new SingleFieldCore({
                  name: "",
                  label: "性别",
                  input: new SelectCore({
                    defaultValue: 1,
                    options: [
                      {
                        value: 1,
                        label: "男",
                      },
                      {
                        value: 2,
                        label: "女",
                      },
                    ],
                  }),
                }),
              },
            });
          },
        }),
      },
    }),
  };

  let _state = {};
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$values.onChange((values) => {
    console.log("the object value changed", values);
  });

  return {
    methods,
    ui,
    state: _state,
    ready() {
      const field = ui.$values.fields.persons.append();
      field.setValue({
        name: "李涛",
        age: 30,
        gender: 1,
      });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function FeaturePlaygroundView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(FeaturePlaygroundViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <Button store={vm.ui.$btn}>测试</Button>
        {/* <FieldObjV2 store={vm.ui.$values}>
          <FieldArrV2
            store={vm.ui.$values.fields.persons}
            render={(field) => {
              return (
                <div>
                  <FieldObjV2 store={field}>
                    <div>
                      <FieldV2 store={field.fields.name}>
                        <Input store={field.fields.name.input} />
                      </FieldV2>
                      <FieldV2 store={field.fields.age}>
                        <Input store={field.fields.age.input} />
                      </FieldV2>
                      <FieldV2 store={field.fields.gender}>
                        <Select store={field.fields.gender.input}></Select>
                      </FieldV2>
                    </div>
                  </FieldObjV2>
                </div>
              );
            }}
          ></FieldArrV2>
        </FieldObjV2> */}
        <InputWithKeyboardView store={vm.ui.$input} />
      </PageView>
    </>
  );
}
