import { FetchParams } from "@/domains/list/typing";
import { ListResponse } from "@/biz/requests/types";
import { request } from "@/biz/requests";

import { ExamStatus, ExamStatusTextMap, QuizAnswerStatus, QuizAnswerStatusTextMap, QuizTypes } from "./constants";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { parseJSONStr } from "@/utils";
import { PaperQuizAnswer } from "./types";
import dayjs from "dayjs";

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
    return Result.Err(r.error.message);
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
    return Result.Err(r.error.message);
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
      return {
        idx: idx + 1,
        status: answer.status,
        status_text: QuizAnswerStatusTextMap[answer.status],
        answer: (() => {
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
        quiz_id: answer.quiz.id,
        content: answer.quiz.content,
        type: answer.quiz.type,
        analysis: answer.quiz.analysis,
      };
    }),
  });
}
