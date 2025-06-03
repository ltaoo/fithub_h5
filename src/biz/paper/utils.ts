import { QuizChoiceValueTextMap } from "./constants";

export function map_choice_value_text(v: number) {
  return QuizChoiceValueTextMap[v] ?? "A";
}
