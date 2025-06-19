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

export type WorkoutPlanStepJSON250607 = {
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
    weight: string;
    reps: number;
    reps_unit: SetValueUnit;
    rest_duration: number;
    note: string;
  }[];
  set_note: string;
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
