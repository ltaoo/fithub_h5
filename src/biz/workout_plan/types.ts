import { WorkoutPlanStepType, WorkoutPlanSetType } from "./constants";

export type WorkoutPlanStepBody = {
  idx: number;
  type: WorkoutPlanStepType;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  set_weight: string;
  set_note: string;
  actions: {
    idx: number;
    action_id: number | string;
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

export type WorkoutPlanStepResp = {
  id?: number | string;
  title: string;
  type: WorkoutPlanStepType;
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  set_weight: string;
  actions: {
    id?: number | string;
    action_id: number | string;
    action: {
      id: number | string;
      name: string;
      zh_name: string;
    };
    idx: number;
    set_idx: number;
    weight: string;
    reps: number;
    reps_unit: string;
    rest_duration: number;
    note: string;
  }[];
  note: string;
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
