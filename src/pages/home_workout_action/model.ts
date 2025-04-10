import { ViewComponentProps } from "@/store/types";
import { WorkoutActionType, WorkoutActionTypeOptions } from "@/biz/workout_action/constants";
import { MuscleProfile } from "@/biz/muscle/services";
import { MuscleSelectViewModel } from "@/biz/muscle_select";
import { EquipmentSelectViewModel } from "@/biz/equipment_select";
import { ObjectFieldCore, SingleFieldCore, ArrayFieldCore } from "@/domains/ui/formv2";
import { InputCore } from "@/domains/ui/form/input";
import { TagInputCore } from "@/domains/ui/form/tag-input";
import { SelectCore } from "@/domains/ui";
import { Result } from "@/domains/result";

export function WorkoutActionViewModel(props: Pick<ViewComponentProps, "client" | "app">) {
  let _muscles: MuscleProfile[] = [];

  const $values = new ObjectFieldCore({
    name: "",
    label: "",
    fields: {
      id: new SingleFieldCore({
        name: "id",
        label: "",
        hidden: true,
        input: new InputCore({ defaultValue: 0 }),
      }),
      zh_name: new SingleFieldCore({
        name: "zh_name",
        label: "中文名称",
        input: new InputCore({ defaultValue: "" }),
      }),
      name: new SingleFieldCore({
        name: "name",
        label: "英文名称",
        input: new InputCore({ defaultValue: "" }),
      }),
      alias: new SingleFieldCore({
        name: "alias",
        label: "别名",
        input: new TagInputCore({ defaultValue: [] }),
      }),
      type: new SingleFieldCore({
        name: "type",
        label: "动作类型",
        input: new SelectCore({
          defaultValue: WorkoutActionType.RESISTANCE,
          options: WorkoutActionTypeOptions,
        }),
      }),
      overview: new SingleFieldCore({
        name: "overview",
        label: "动作概述",
        input: new InputCore({ defaultValue: "", type: "textarea" }),
      }),
      level: new SingleFieldCore({
        name: "level",
        label: "动作难度",
        input: new InputCore({
          defaultValue: 1,
          type: "number",
        }),
      }),
      tags1: new SingleFieldCore({
        name: "tags1",
        label: "部位标签",
        input: new TagInputCore({
          defaultValue: [],
        }),
      }),
      tags2: new SingleFieldCore({
        name: "tags2",
        label: "类型标签",
        input: new TagInputCore({
          defaultValue: [],
        }),
      }),
      muscles: new SingleFieldCore({
        name: "muscles",
        label: "肌肉",
        input: MuscleSelectViewModel({
          defaultValue: [],
          client: props.client,
          onLoaded(muscles) {
            _muscles = muscles;
          },
        }),
      }),
      equipments: new SingleFieldCore({
        name: "equipments",
        label: "器械",
        input: EquipmentSelectViewModel({ defaultValue: [], client: props.client }),
      }),
      details: new ObjectFieldCore({
        name: "details",
        label: "动作步骤",
        fields: {
          start_position: new SingleFieldCore({
            name: "start_position",
            label: "起始姿态",
            input: new InputCore({ defaultValue: "", type: "textarea" }),
          }),
          steps: new ArrayFieldCore({
            name: "steps",
            label: "步骤",
            field: (index: number) => {
              return new SingleFieldCore({
                name: `step_${index}`,
                label: "",
                input: new InputCore({ defaultValue: "", type: "textarea" }),
              });
            },
          }),
        },
      }),
      points: new ArrayFieldCore({
        name: "points",
        label: "动作要点",
        field: (index: number) => {
          return new SingleFieldCore({
            name: `point_${index}`,
            label: "",
            input: new InputCore({ defaultValue: "", type: "textarea" }),
          });
        },
      }),
      problems: new ArrayFieldCore({
        name: "problems",
        label: "常见问题",
        field: (index: number) => {
          return new ObjectFieldCore({
            name: `problem_${index}`,
            label: "",
            fields: {
              title: new SingleFieldCore({
                name: "title",
                label: "简要说明",
                input: new InputCore({ defaultValue: "" }),
              }),
              reason: new SingleFieldCore({
                name: "reason",
                label: "详细描述",
                input: new InputCore({ defaultValue: "", type: "textarea" }),
              }),
              solutions: new ArrayFieldCore({
                name: "solutions",
                label: "解决方法",
                field: (index: number) => {
                  return new SingleFieldCore({
                    name: `solutions_${index}`,
                    label: "",
                    input: new InputCore({ defaultValue: "", type: "textarea" }),
                  });
                },
              }),
            },
          });
        },
      }),
    },
  });

  async function toBody() {
    const r = await $values.validate();
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const values = r.data;
    // console.log("[PAGE]home_action_create - Saving action:", values);
    const body = {
      id: values.id,
      name: values.name,
      zh_name: values.zh_name,
      alias: values.alias.join(","),
      overview: values.overview,
      type: values.type || WorkoutActionType.RESISTANCE,
      level: values.level,
      tags1: values.tags1.join(","),
      tags2: values.tags2.join(","),
      details: JSON.stringify(values.details),
      points: JSON.stringify(values.points),
      problems: JSON.stringify(values.problems),
      equipment_ids: values.equipments.map((e) => e.id).join(","),
      muscle_ids: values.muscles.map((m) => m.id).join(","),
      alternative_action_ids: "",
      advanced_action_ids: "",
      regressed_action_ids: "",
    };
    return Result.Ok(body);
  }
  return {
    $values,
    toBody,
    get muscles() {
      return _muscles;
    },
  };
}
