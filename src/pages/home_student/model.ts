import { MultipleSelectionCore } from "@/domains/multiple";
import { InputCore, SelectCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

export function MemberValuesViewModel() {
  const $values_basic = new ObjectFieldCore({
    label: "",
    name: "basic",
    fields: {
      name: new SingleFieldCore({
        label: "姓名",
        name: "name",
        input: new InputCore({
          defaultValue: "",
        }),
      }),
      gender: new SingleFieldCore({
        label: "性别",
        name: "gender",
        input: new SelectCore({
          defaultValue: 1,
          options: [
            {
              label: "男",
              value: 1,
            },
            {
              label: "女",
              value: 2,
            },
            {
              label: "其他",
              value: 3,
            },
          ],
        }),
      }),
      age: new SingleFieldCore({
        label: "年龄",
        name: "age",
        input: new InputCore({
          defaultValue: 18,
        }),
      }),
    },
  });
  const $values_goal = new ObjectFieldCore({
    label: "",
    name: "goal",
    fields: {
      goal: new SingleFieldCore({
        label: "目标",
        name: "goal",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [
            {
              label: "减脂",
              value: "lose_weight",
            },
            {
              label: "增肌",
              value: "gain_muscle",
            },
            {
              label: "增强力量",
              value: "strength",
            },
            {
              label: "提高耐力",
              value: "endurance",
            },
            {
              label: "塑形",
              value: "shape",
            },
            {
              label: "康复",
              value: "rehabilitation",
            },
            {
              label: "竞技",
              value: "competition",
            },
            {
              label: "其他",
              value: "other",
            },
          ],
        }),
      }),
      action_preferences: new SingleFieldCore({
        label: "偏好",
        name: "action_preferences",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [
            {
              label: "力量训练",
              value: "strength_training",
            },
            {
              label: "有氧训练",
              value: "cardio_training",
            },
            {
              label: "普拉提",
              value: "pilates",
            },
            {
              label: "团体课程",
              value: "group_class",
            },
            {
              label: "户外运动",
              value: "outdoor_sports",
            },
            {
              label: "自重训练",
              value: "bodyweight_training",
            },
          ],
        }),
      }),
    },
  });
  const $values_fit = new ObjectFieldCore({
    label: "",
    name: "fitness",
    fields: {
      experience: new SingleFieldCore({
        label: "训练经验",
        name: "experience",
        input: new SelectCore({
          defaultValue: "beginner",
          options: [
            {
              label: "新手(0-6个月)",
              value: "beginner",
            },
            {
              label: "中级(6-12个月)",
              value: "intermediate",
            },
            {
              label: "高级(12-24个月)",
              value: "advanced",
            },
            {
              label: "专家(24个月以上)",
              value: "expert",
            },
          ],
        }),
      }),
      frequency: new SingleFieldCore({
        label: "训练频率(每周)",
        name: "frequency",
        input: new SelectCore({
          defaultValue: "3",
          options: [
            {
              label: "1-2次",
              value: "1-2",
            },
            {
              label: "3-4次",
              value: "3-4",
            },
            {
              label: "5次及以上",
              value: "5+",
            },
          ],
        }),
      }),
    },
  });
  const $values_risk = new ObjectFieldCore({
    label: "",
    name: "risk",
    fields: {
      disease1: new SingleFieldCore({
        label: "心血管疾病",
        name: "disease",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [
            {
              label: "高血压",
              value: "hypertension",
            },
            {
              label: "心脏病",
              value: "heart_disease",
            },
            {
              label: "糖尿病",
              value: "diabetes",
            },
            {
              label: "关节问题",
              value: "joint_problem",
            },
            {
              label: "脊柱问题",
              value: "spine_problem",
            },
            {
              label: "骨质疏松",
              value: "osteoporosis",
            },
            {
              label: "肌肉损伤",
              value: "muscle_injury",
            },
          ],
        }),
      }),
      disease2: new SingleFieldCore({
        label: "呼吸系统疾病",
        name: "disease2",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      disease3: new SingleFieldCore({
        label: "消化系统疾病",
        name: "disease3",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      disease4: new SingleFieldCore({
        label: "内分泌系统疾病",
        name: "disease4",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      disease5: new SingleFieldCore({
        label: "神经系统疾病",
        name: "disease5",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      disease6: new SingleFieldCore({
        label: "免疫系统疾病",
        name: "disease6",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      disease7: new SingleFieldCore({
        label: "关节骨科等疾病",
        name: "disease7",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [],
        }),
      }),
      injury: new SingleFieldCore({
        label: "受伤史",
        name: "injury",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [
            {
              label: "肩关节",
              value: "shoulder",
            },
            {
              label: "膝关节",
              value: "knee",
            },
            {
              label: "腰部",
              value: "back",
            },
          ],
        }),
      }),
      pregnancy: new SingleFieldCore({
        label: "妊娠史",
        name: "pregnancy",
        input: new SelectCore({
          defaultValue: "none",
          options: [
            {
              label: "备孕",
              value: "pregnancy",
            },
            {
              label: "怀孕(1-3个月)",
              value: "pregnant",
            },
            {
              label: "产后(3-6个月)",
              value: "postpartum",
            },
            {
              label: "哺乳(6个月以上)",
              value: "breastfeeding",
            },
          ],
        }),
      }),
    },
  });

  const $values_diet = new ObjectFieldCore({
    label: "",
    name: "diet",
    fields: {
      diet_preferences: new SingleFieldCore({
        label: "饮食偏好",
        name: "diet_preferences",
        input: new MultipleSelectionCore({
          defaultValue: [],
          options: [
            {
              label: "高蛋白",
              value: "high_protein",
            },
            {
              label: "低碳水",
              value: "low_carbohydrate",
            },
            {
              label: "间歇性断食",
              value: "intermittent_fasting",
            },
            {
              label: "均衡饮食",
              value: "balanced_diet",
            },
            {
              label: "多餐制",
              value: "multi_meal",
            },
            {
              label: "无特殊要求",
              value: "no_special_requirements",
            },
          ],
        }),
      }),
    },
  });

  const methods = {
    toBody() {},
  };

  return {
    ui: {
      $basic_values: $values_basic,
      $fitness_values: $values_fit,
      $goal_values: $values_goal,
      $risk_values: $values_risk,
      $diet_values: $values_diet,
    },
    methods,
  };
}
