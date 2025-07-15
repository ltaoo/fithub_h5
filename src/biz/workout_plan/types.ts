import { SetValueUnit } from "@/biz/input_set_value";

import { WorkoutPlanStepType, WorkoutPlanSetType } from "./constants";

// 创建时的参数
export type WorkoutPlanStepBody = {
  idx: number;
  type: WorkoutPlanStepType;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  set_weight: string;
  set_note: string;
  actions: {
    action_id: number;
    action: {
      id: number;
      zh_name: string;
    };
    set_idx: number;
    weight: string;
    reps: number;
    reps_unit: string;
    rest_duration: number;
  }[];
};

export type WorkoutPlanBodyDetailsJSON250424 = {
  v: "250424";
  steps: WorkoutPlanBodyStepJSON250424[];
};
/** 可以理解成训练计划中的「动作组」 */
export type WorkoutPlanBodyStepJSON250424 = {
  /** 组类型 */
  set_type: WorkoutPlanSetType;
  /** 组动作 */
  actions: {
    action_id: number;
    /** 动作 */
    action: {
      id: number;
      zh_name: string;
    };
    /** 计数 */
    reps: number;
    /** 技术单位 */
    reps_unit: SetValueUnit;
    /** 负重 */
    weight: string;
    /** 动作间歇 */
    rest_duration: number;
  }[];
  /** 组数 */
  set_count: number;
  /** 组间歇 */
  set_rest_duration: number;
  /** 组负重，一般都用不上 */
  set_weight: string;
  /** 组说明 */
  set_note: string;
};

export type WorkoutPlanBodyStepJSON250607 = {
  title: string;
  type: WorkoutPlanStepType;
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  set_weight: string;
  actions: {
    action_id: number;
    action: {
      id: number;
      name: string;
      zh_name: string;
    };
    idx: number;
    set_idx: number;
    reps: number;
    reps_unit: SetValueUnit;
    weight: string;
    rest_duration: number;
    note: string;
  }[];
  set_note: string;
};

export type WorkoutPlanBodyDetailsJSON250627 = {
  v: "250627";
  steps: WorkoutPlanBodyStepJSON250627[];
};
export type WorkoutPlanBodyStepJSON250627 = {
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: {
    num: string;
    unit: SetValueUnit;
  };
  set_weight: {
    num: string;
    unit: SetValueUnit;
  };
  set_note: string;
  set_tags: string;
  actions: {
    action: {
      id: number;
      zh_name: string;
    };
    reps: {
      num: string;
      unit: SetValueUnit;
    };
    weight: {
      num: string;
      unit: SetValueUnit;
    };
    rest_duration: {
      num: string;
      unit: SetValueUnit;
    };
  }[];
};

/** 在页面中实际用到的，所有 JSON25xxx 版本最终都要转换成这个接口 */
export type WorkoutPlanStepContent = {
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: string;
  set_rest_duration: {
    num: string;
    unit: SetValueUnit;
  };
  set_weight: {
    num: string;
    unit: SetValueUnit;
  };
  set_note: string;
  set_tags: string[];
  actions: {
    action: { id: number; zh_name: string };
    reps: {
      num: string;
      unit: SetValueUnit;
    };
    weight: {
      num: string;
      unit: SetValueUnit;
    };
    rest_duration: {
      num: string;
      unit: SetValueUnit;
    };
  }[];
};

export type WorkoutPlanActionPayload = {
  id?: number | string;
  action: { id: number | string; zh_name: string };
  idx: number;
  weight: string;
  reps: number;
  reps_unit: string;
  rest_duration: number;
  note: string;
};

export type SimpleWorkoutPlanActionPayload = {
  action_name: string;
  reps: number;
  unit: string;
  rest_duration: number;
  note: string;
};
export type WorkoutPlanPreviewPayload = {
  title: string;
  overview: string;
  timeline: {
    text: string;
    steps: {
      tags: string[];
      title: string;
      sets_count: number;
      set_type: WorkoutPlanSetType;
      actions: SimpleWorkoutPlanActionPayload[];
      sets: {
        actions: SimpleWorkoutPlanActionPayload[];
        note: string;
      }[];
      note: string;
    }[];
  }[];
  sets_count: number;
  actions_count: number;
};
