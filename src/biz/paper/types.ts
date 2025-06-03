import { QuizTypes } from "./constants";

export type PaperQuiz = {
  id: number;
  type: QuizTypes;
  content: string;
  choices: {
    value: number;
    text: string;
  }[];
};

export type PaperQuizAnswer = {
  type: QuizTypes;
  choices: number[];
  content: string;
};
