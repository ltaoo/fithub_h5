import { WorkoutPlanStepType, WorkoutPlanSetType } from "./constants";

export type WorkoutPlanStepBody = {
  id?: number | string;
  title: string;
  type: WorkoutPlanStepType;
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
  actions: {
    id?: number | string;
    action_id: number | string;
    idx: number;
    set_idx: number;
    weight: string;
    reps: number;
    unit: string;
    rest_duration: number;
    note: string;
  }[];
  note: string;
};

export type WorkoutPlanStepResp = {
  id?: number | string;
  title: string;
  type: WorkoutPlanStepType;
  idx: number;
  set_type: WorkoutPlanSetType;
  set_count: number;
  set_rest_duration: number;
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
    unit: string;
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
  unit: string;
  rest_interval: number;
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
