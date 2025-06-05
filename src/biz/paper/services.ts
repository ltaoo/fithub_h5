import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { ListResponse } from "@/biz/requests/types";
import { request } from "@/biz/requests";
import { parseJSONStr } from "@/utils";

import {
  ExamStatus,
  ExamStatusTextMap,
  QuizAnswerStatus,
  QuizAnswerStatusTextMap,
  QuizChoiceInAnswerStatus,
  QuizTypes,
} from "./constants";
import { PaperQuizAnswer } from "./types";
import { map_choice_value_text } from "./utils";

export function fetchPaperList(body: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      name: string;
      overview: string;
      quiz_count: number;
      tags: string;
    }>
  >("/api/paper/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}

export function fetchPaperProfile(body: { id: number }) {
  return request.post<{
    id: number;
    name: string;
    quizzes: {
      id: number;
      content: string;
      type: QuizTypes;
      choices: {
        text: string;
      }[];
    }[];
  }>("/api/paper/profile", {
    id: body.id,
  });
}

export function startExam(body: { paper_id: number }) {
  return request.post<{ id: number }>("/api/exam/start", {
    paper_id: body.paper_id,
  });
}

export function fetchRunningExam() {
  return request.post<{
    list: { id: number }[];
  }>("/api/exam/running", {});
}
export function fetchExamList(body: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      status: ExamStatus;
      started_at: string;
      paper: {
        name: string;
      };
    }>
  >("/api/exam/list", {
    page_size: body.pageSize,
    page: body.page,
  });
}
export function fetchExamListProcess(r: TmpRequestResp<typeof fetchExamList>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    ...resp,
    list: resp.list.map((v) => {
      return {
        id: v.id,
        name: v.paper.name,
        status: v.status,
        status_text: ExamStatusTextMap[v.status],
        started_at: dayjs(v.started_at).format("YYYY-MM-DD HH:mm"),
      };
    }),
  });
}

export function fetchExamProfile(body: { id: number }) {
  return request.post<{
    exam: {
      id: number;
      status: number;
      cur_quiz_id: number;
      created_at: string;
    };
    paper: {
      id: number;
      name: string;
      duration: number;
    };
    quiz_answers: {
      id: number;
      quiz: {
        id: number;
        type: QuizTypes;
        content: string;
        choices: string;
      };
      answer: string;
    }[];
  }>("/api/exam/profile", {
    id: body.id,
  });
}

export function fetchExamProfileProcess(r: TmpRequestResp<typeof fetchExamProfile>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  const quizzes = resp.quiz_answers.map((answer) => {
    const choices = (() => {
      const r = parseJSONStr<{ value: number; text: string }[]>(answer.quiz.choices);
      if (r.error) {
        return [] as { value: number; text: string }[];
      }
      return r.data;
    })();
    return {
      id: answer.quiz.id,
      type: answer.quiz.type,
      content: answer.quiz.content,
      choices,
    };
  });
  return Result.Ok({
    id: resp.exam.id,
    /** 答题状态 */
    status: resp.exam.status,
    /** 试卷id */
    paper_id: resp.paper.id,
    /** 答题总时长 */
    duration: resp.paper.duration,
    cur_quiz_id: resp.exam.cur_quiz_id,
    /** 试卷名称 */
    name: resp.paper.name,
    /** 答题开始时间 */
    created_at: resp.exam.created_at,
    /** 题目列表 */
    quizzes,
    existing_answers: resp.quiz_answers
      .map((answer, idx) => {
        return {
          [idx]: {
            id: answer.id,
            quiz_id: answer.quiz.id,
            ...(() => {
              const r = parseJSONStr<PaperQuizAnswer>(answer.answer);
              if (r.error) {
                return { type: QuizTypes.Single, choices: [], content: "" };
              }
              return {
                type: r.data.type ?? QuizTypes.Single,
                choices: r.data.choices ?? [],
                content: r.data.content ?? "",
              };
            })(),
          },
        };
      })
      .reduce((a, b) => {
        return {
          ...a,
          ...b,
        };
      }, {}),
  });
}

export function updateQuizAnswer(body: {
  id: number;
  exam_id: number;
  quiz_id: number;
  answer: {
    quiz_id: number;
    quiz_type: QuizTypes;
    content: string;
    choices: number[];
  };
}) {
  return request.post("/api/exam/answer", {
    id: body.id,
    exam_id: body.exam_id,
    quiz_id: body.quiz_id,
    content: JSON.stringify(body.answer),
  });
}

/**
 * 提交后端检查当前答题状态
 * 主要是已答题的状态
 */
export function prepareSubmitExam(body: { paper_result_id: number }) {
  return request.post("/api/exam/prepare_submit", {
    paper_result_id: body.paper_result_id,
  });
}

export function giveUpExam(body: { id: number }) {
  return request.post("/api/exam/give_up", {
    id: body.id,
  });
}

export function completeExam(body: { id: number }) {
  return request.post("/api/exam/complete", {
    id: body.id,
  });
}

export function fetchExamResult(body: { id: number }) {
  return request.post<{
    exam: {
      id: number;
      status: ExamStatus;
      pass: number;
      cur_quiz_id: number;
      created_at: string;
      started_at: string;
      completed_at: string;
    };
    paper: {
      id: number;
      name: string;
      duration: number;
    };
    quiz_answers: {
      id: number;
      status: QuizAnswerStatus;
      quiz: {
        id: number;
        answer: string;
        type: QuizTypes;
        content: string;
        analysis: string;
        choices: string;
      };
      answer: string;
    }[];
  }>("/api/exam/result", {
    id: body.id,
  });
}

export function fetchExamResultProcess(r: TmpRequestResp<typeof fetchExamResult>) {
  if (r.error) {
    return Result.Err(r.error);
  }
  const resp = r.data;
  return Result.Ok({
    id: resp.exam.id,
    status: resp.exam.status,
    status_text: (() => {
      if ([ExamStatus.Completed].includes(resp.exam.status)) {
        if (resp.exam.pass === 1) {
          return "通过";
        }
        return "失败";
      }
      return ExamStatusTextMap[resp.exam.status];
    })(),
    pass: resp.exam.pass === 1,
    started_at: dayjs(resp.exam.started_at),
    quizzes: resp.quiz_answers.map((answer, idx) => {
      const quiz_choices = (() => {
        const r = parseJSONStr<{ value: number; text: string }[]>(answer.quiz.choices);
        if (r.error) {
          return [] as { value: number; text: string }[];
        }
        return r.data;
      })();
      // 用户选择的答案
      const user_answer = (() => {
        const r = parseJSONStr<PaperQuizAnswer>(answer.answer);
        if (r.error) {
          return { type: QuizTypes.Single, choices: [], content: "" };
        }
        return {
          type: r.data.type ?? QuizTypes.Single,
          choices: r.data.choices ?? [],
          content: r.data.content ?? "",
        };
      })();
      // 正确答案
      const quiz_answer = (() => {
        const r = parseJSONStr<{ value: number[]; content: "" }>(answer.quiz.answer);
        if (r.error) {
          return { value: [] as number[], content: "" };
        }
        return {
          value: r.data.value ?? [],
          content: r.data.content ?? "",
        };
      })();
      return {
        idx: idx + 1,
        status: answer.status,
        status_text: QuizAnswerStatusTextMap[answer.status],
        choices: quiz_choices.map((choice) => {
          const selected = user_answer.choices.includes(choice.value);
          const is_correct_quiz_answer = quiz_answer.value.includes(choice.value);
          return {
            value: choice.value,
            value_text: map_choice_value_text(choice.value),
            text: choice.text,
            select_status: (() => {
              // 选项的状态，如果没选，但是是多选中应该要选的，算什么状态？
              // 选了就好说，要么对要么错
              if (!selected) {
                return QuizChoiceInAnswerStatus.Normal;
              }
              if (is_correct_quiz_answer) {
                return QuizChoiceInAnswerStatus.Correct;
              }
              return QuizChoiceInAnswerStatus.Incorrect;
            })(),
            is_correct: is_correct_quiz_answer,
          };
        }),
        answer: user_answer,
        quiz_id: answer.quiz.id,
        content: answer.quiz.content,
        type: answer.quiz.type,
        analysis: answer.quiz.analysis,
      };
    }),
  });
}
