import { WorkoutActionType } from "./constants";

export interface WorkoutAction {
  id?: number;
  name: string;
  zh_name: string;
  alias: string[];
  type: WorkoutActionType;
  level: number;
  tags1: string[];
  tags2: string[];
  details: string;
  advanced_action_ids: string[];
  regressed_action_ids: string[];
  problems: string[];
}

export type WorkoutActionSteps = {
  startPosition: string;
  start_position: string;
  steps: string[];
};
export type WorkoutActionProblems = {
  title: string;
  reason: string;
  solutions: string[];
};
