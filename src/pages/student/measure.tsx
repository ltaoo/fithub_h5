/**
 * @file 用户体测
 */
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";
import { InputCore, SelectCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore, ArrayFieldCore } from "@/domains/ui/formv2";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";

function BodyMeasurementViewModel(props: ViewComponentProps) {
  const ui = {
    $inbody_values: new ObjectFieldCore({
      label: "",
      name: "",
      fields: {
        height: new SingleFieldCore({
          label: "身高",
          name: "height",
          input: new InputCore({
            defaultValue: "180",
          }),
        }),
        weight: new SingleFieldCore({
          label: "体重",
          name: "weight",
          input: new InputCore({
            defaultValue: "70",
          }),
        }),
        body_type: new SingleFieldCore({
          label: "体型",
          name: "body_type",
          input: new SelectCore({
            defaultValue: "normal",
            options: [
              {
                label: "偏瘦",
                value: "thin",
              },
              {
                label: "中等体型",
                value: "normal",
              },
              {
                label: "偏胖",
                value: "fat",
              },
              {
                label: "肌肉型",
                value: "muscle",
              },
              {
                label: "匀称型",
                value: "balance",
              },
            ],
          }),
        }),
        body_fat: new SingleFieldCore({
          label: "体脂率",
          name: "body_fat",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        heart_rate: new SingleFieldCore({
          label: "静息心率",
          name: "heart_rate",
          input: new InputCore({
            defaultValue: "70",
          }),
        }),
        fat_weight: new SingleFieldCore({
          label: "脂肪重量",
          name: "fat_weight",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        muscle_weight: new SingleFieldCore({
          label: "骨骼肌重量",
          name: "muscle_weight",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
      },
    }),
    $values: new ObjectFieldCore({
      label: "",
      name: "维度测量",
      fields: {
        chest: new SingleFieldCore({
          label: "胸围",
          name: "chest",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        waist: new SingleFieldCore({
          label: "腰围",
          name: "waist",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        hip: new SingleFieldCore({
          label: "臀围",
          name: "hip",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        thigh: new SingleFieldCore({
          label: "大腿围",
          name: "thigh",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        calf: new SingleFieldCore({
          label: "小腿围",
          name: "calf",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        arm: new SingleFieldCore({
          label: "上臂围",
          name: "arm",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
        forearm: new SingleFieldCore({
          label: "前臂围",
          name: "forearm",
          input: new InputCore({
            defaultValue: "10",
          }),
        }),
      },
    }),
    $pictures: new ObjectFieldCore({
      label: "",
      name: "图片",
      fields: {
        // chest: new ArrayFieldCore({
        //   label: "胸围",
        //   name: "chest",
        //   field: () => {
        //     return new SingleFieldCore({
        //       label: "图片",
        //       name: "picture",
        //       input: ImageUploadCore({}),
        //     });
        //   },
        // }),
      },
    }),
  };

  let _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function BodyMeasurementPage(props: ViewComponentProps) {
  const [state, vm] = useViewModel(BodyMeasurementViewModel, [props]);

  return <div></div>;
}
