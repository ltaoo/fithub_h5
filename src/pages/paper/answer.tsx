/**
 * @file 试卷答题页面
 */
import { For, Show } from "solid-js";
import { Check, ChevronDown, Clock, Loader2, MoreHorizontal } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Button } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { QuizTypes, QuizTypeTextMap } from "@/biz/paper/constants";
import { RequestCore } from "@/domains/request";
import {
  completeExam,
  fetchExamProfile,
  fetchExamProfileProcess,
  giveUpExam,
  updateQuizAnswer,
} from "@/biz/paper/services";
import { PaperQuiz, PaperQuizAnswer } from "@/biz/paper/types";
import { Result } from "@/domains/result";
import { map_choice_value_text } from "@/biz/paper/utils";
import { toNumber } from "@/utils/primitive";

function ExamAnswerViewModel(props: ViewComponentProps) {
  const request = {
    exam: {
      profile: new RequestCore(fetchExamProfile, { process: fetchExamProfileProcess, client: props.client }),
      complete: new RequestCore(completeExam, { client: props.client }),
      answer_quiz: new RequestCore(updateQuizAnswer, { client: props.client }),
      give_up: new RequestCore(giveUpExam, { client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    /** 根据顺序跳转到指定题目 */
    directToQuiz(v: { idx: number }) {
      const index = v.idx - 1;
      if (index < 0) {
        return;
      }
      if (_cur_quiz_idx === index) {
        return;
      }
      _cur_choices_value = [];
      _cur_quiz_idx = index;
      methods.updateCurChoices();
      ui.$dialog_overview.hide();
      methods.refresh();
    },
    updateCurChoices() {
      // 看看该题是否之前答过，如果答过就使用之前的答案
      if (_existing_answers[_cur_quiz_idx]) {
        _cur_choices_value = [..._existing_answers[_cur_quiz_idx].choices];
      }
      // 切换 上一题 按钮的是否可用状态
      if (_cur_quiz_idx === 0) {
        ui.$btn_prev_quiz.disable();
      } else {
        ui.$btn_prev_quiz.enable();
      }
    },
    selectChoice(choice: { idx: number; value: number }) {
      const cur_quiz = _quizzes[_cur_quiz_idx];
      if (!cur_quiz) {
        return;
      }
      if (cur_quiz.type === QuizTypes.Multiple) {
        if (_cur_choices_value.includes(choice.value)) {
          _cur_choices_value = _cur_choices_value.filter((v) => v !== choice.value);
        } else {
          _cur_choices_value.push(choice.value);
        }
      }
      if (cur_quiz.type === QuizTypes.Single) {
        _cur_choices_value = [choice.value];
      }
      console.log("[BIZ]quiz - selectChoice - save the choices of cur quiz", cur_quiz, _cur_quiz_idx);
      // 保存当前选择的答案
      _existing_answers[_cur_quiz_idx] = {
        quiz_id: cur_quiz.id,
        type: cur_quiz.type,
        choices: [..._cur_choices_value],
        content: "",
      };
      request.exam.answer_quiz.run({
        id: cur_quiz.id,
        exam_id: Number(props.view.query.id),
        quiz_id: cur_quiz.id,
        answer: {
          quiz_id: cur_quiz.id,
          quiz_type: cur_quiz.type,
          choices: (() => {
            const value: number[] = [];
            for (let i = 0; i < _cur_choices_value.length; i += 1) {
              const choice_v = _cur_choices_value[i];
              const choice = cur_quiz.choices.find((c) => c.value === choice_v);
              if (choice) {
                value.push(choice.value);
              }
            }
            return value;
          })(),
          content: "",
        },
      });
      methods.refresh();
    },
    prevQuiz() {
      if (_cur_quiz_idx === 0) {
        return;
      }
      _cur_choices_value = [];
      _cur_quiz_idx -= 1;
      console.log("[BIZ]quiz - prevQuiz - check prev quiz", _existing_answers, _cur_quiz_idx);
      methods.updateCurChoices();
      //       // 看看该题是否之前答过，如果答过就使用之前的答案
      //       if (_quiz_choices[_cur_quiz_idx]) {
      //         _cur_choices_idx = [..._quiz_choices[_cur_quiz_idx].choices];
      //       }
      //       // 切换 上一题 按钮的是否可用状态
      //       if (_cur_quiz_idx === 0) {
      //         ui.$btn_prev_quiz.disable();
      //       }
      methods.refresh();
    },
    nextQuiz() {
      if (_cur_quiz_idx === _quizzes.length - 1) {
        methods.showDialogPaperOverview();
        return;
      }
      _cur_choices_value = [];
      _cur_quiz_idx += 1;
      methods.updateCurChoices();
      //       // 看看该题是否之前答过，如果答过就使用之前的答案
      //       if (_quiz_choices[_cur_quiz_idx]) {
      //         _cur_choices_idx = [..._quiz_choices[_cur_quiz_idx].choices];
      //       }
      //       // 切换 上一题 按钮的是否可用状态
      //       if (_cur_quiz_idx !== 0) {
      //         ui.$btn_prev_quiz.enable();
      //       }
      methods.refresh();
    },
    showDialogPaperOverview() {
      ui.$dialog_overview.show();
    },
    async submit() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        const tip = "参数错误";
        return Result.Err(tip);
      }
      ui.$btn_submit.setLoading(true);
      const r = await request.exam.complete.run({ id });
      ui.$btn_submit.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      ui.$dialog_overview.hide();
      props.history.push("root.exam_result", props.view.query);
    },
    async giveUp() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        const tip = "参数错误";
        return Result.Err(tip);
      }
      ui.$btn_give_up.setLoading(true);
      const r = await request.exam.give_up.run({ id });
      ui.$btn_give_up.setLoading(false);
      if (r.error) {
        return Result.Err(r.error.message);
      }
      ui.$dialog_overview.hide();
      props.history.push("root.exam_result", props.view.query);
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $btn_prev_quiz: new ButtonCore({
      disabled: true,
      onClick() {
        methods.prevQuiz();
      },
    }),
    $btn_next_quiz: new ButtonCore({
      onClick() {
        methods.nextQuiz();
      },
    }),
    $btn_give_up: new ButtonCore({
      onClick() {
        methods.giveUp();
      },
    }),
    $btn_submit: new ButtonCore({
      onClick() {
        methods.submit();
      },
    }),
    $dialog_overview: new DialogCore({}),
  };
  const _paper = {
    name: "健身教练基础",
  };

  let _quizzes: PaperQuiz[] = [];
  let _cur_quiz_idx = 0;
  // 当前题目的选项
  let _cur_choices_value: number[] = [];
  // 已填写的答案
  let _existing_answers: Record<number, { quiz_id: number } & PaperQuizAnswer> = {};
  let _state = {
    get quizzes() {
      return _quizzes.map((quiz, idx) => {
        return {
          ...quiz,
          idx: idx + 1,
          selected: !!_existing_answers[idx],
        };
      });
    },
    get quiz() {
      const quiz = _quizzes[_cur_quiz_idx];
      if (!quiz) {
        return null;
      }

      return {
        ...quiz,
        type_text: QuizTypeTextMap[quiz.type],
        idx: _cur_quiz_idx + 1,
        choices: quiz.choices.map((choice, idx) => {
          return {
            ...choice,
            idx,
            value_text: map_choice_value_text(choice.value),
            selected: _cur_choices_value.includes(choice.value),
          };
        }),
      };
    },
    get is_first_quiz() {
      return _cur_quiz_idx === 0;
    },
    get is_last_quiz() {
      return _cur_quiz_idx === _quizzes.length - 1;
    },
    get overview() {
      const all_completed = Object.keys(_existing_answers).length === _quizzes.length;
      return {
        can_submit: (() => {
          if (all_completed) {
            return 1;
          }
          return 0;
        })(),
        text: (() => {
          if (all_completed) {
            return "所有题目均已作答";
          }
          return "有遗漏未作答的题目";
        })(),
      };
    },
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const id = toNumber(props.view.query.id);
      if (id === null) {
        return;
      }
      const r = await request.exam.profile.run({ id });
      if (r.error) {
        return;
      }
      _quizzes = r.data.quizzes;
      _cur_quiz_idx = 0;
      if (r.data.cur_quiz_id) {
        _cur_quiz_idx = _quizzes.findIndex((v) => v.id === r.data.cur_quiz_id);
      }
      if (_cur_quiz_idx !== 0) {
        ui.$btn_prev_quiz.enable();
      }
      _existing_answers = r.data.existing_answers;
      const quiz = _quizzes[_cur_quiz_idx];
      const first = _existing_answers[_cur_quiz_idx];
      if (first) {
        _cur_choices_value = first.choices;
      }
      //       console.log("[PAGE]paper/answer - after profile.run", _quizzes, _existing_answers, _cur_choices_idx);
      console.log("[PAGE]paper/answer - after profile.run", quiz, first, _existing_answers, _cur_choices_value);
      methods.refresh();
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ExamAnswerView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ExamAnswerViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div class="flex items-center gap-2">
            <Button class="w-full" store={vm.ui.$btn_prev_quiz}>
              上一题
            </Button>
            <Button class="w-full" store={vm.ui.$btn_next_quiz}>
              {state().is_last_quiz ? "提交" : "下一题"}
            </Button>
          </div>
        }
      >
        <div class="flex items-center justify-between">
          <div></div>
          <div
            class="p-2 rounded-full bg-w-bg-5"
            onClick={() => {
              vm.ui.$dialog_overview.show();
            }}
          >
            <MoreHorizontal class="w-6 h-6 text-w-fg-0" />
          </div>
        </div>
        <Show
          when={state().quiz}
          fallback={
            <div class="flex justify-center">
              <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
            </div>
          }
        >
          <div>
            <div class="mt-2 flex">
              <div class="text-xl text-w-fg-0">{state().quiz?.idx}、</div>
              <div class="text-xl text-w-fg-0">{state().quiz?.content}</div>
            </div>
            <div class="mt-4 flex">
              <div class="border-2 border-w-fg-3 px-2 rounded-full text-w-fg-1 text-sm">{state().quiz?.type_text}</div>
            </div>
            <div class="mt-4 space-y-2">
              <For each={state().quiz?.choices}>
                {(choice) => {
                  return (
                    <div
                      classList={{
                        "flex p-4 border-2 border-w-fg-3 rounded-lg": true,
                        "border-w-fg-2 bg-w-bg-5": choice.selected,
                      }}
                      onClick={() => {
                        vm.methods.selectChoice(choice);
                      }}
                    >
                      <div class="w-[24px]">{choice.value_text}.</div>
                      <div class="text-w-fg-0">{choice.text}</div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>
      </PageView>
      <Sheet store={vm.ui.$dialog_overview} app={props.app}>
        <div class="h-[480px]">
          <div class="flex flex-col h-full">
            <div class="flex-1 p-2">
              <div class="flex items-center gap-2 p-4 border-2 border-w-fg-3 rounded-lg">
                <Show
                  when={state().overview.can_submit}
                  fallback={
                    <div>
                      <Clock class="w-8 h-8 text-w-fg-0" />
                    </div>
                  }
                >
                  <Check class="w-8 h-8 text-w-fg-0" />
                </Show>
                <div class="text-w-fg-0">{state().overview.text}</div>
              </div>
              <div class="mt-4">
                <div class="grid grid-cols-10 gap-2 mt-2">
                  <For each={state().quizzes}>
                    {(quiz) => {
                      return (
                        <div>
                          <div
                            classList={{
                              "flex items-center justify-center h-[30px] border-2 border-w-fg-3 rounded-md bg-w-bg-5 text-w-fg-0":
                                true,
                              // "bg-green-500 dark:bg-green-800": quiz.selected,
                            }}
                            onClick={() => {
                              vm.methods.directToQuiz({ idx: quiz.idx });
                            }}
                          >
                            <div class="text-center text-sm">{quiz.idx}</div>
                          </div>
                          <Show when={quiz.selected}>
                            <div class="flex justify-center">
                              <Check class="w-4 h-4 text-w-fg-1" />
                            </div>
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
            <div class="h-[56px] p-2">
              <div class="flex items-center gap-2">
                <div
                  class="w-[40px] p-2 rounded-full bg-w-bg-5"
                  onClick={() => {
                    vm.ui.$dialog_overview.hide();
                  }}
                >
                  <ChevronDown class="w-6 h-6 text-w-fg-1" />
                </div>
                <div class="flex-1 flex items-center gap-2">
                  <Button class="w-full" store={vm.ui.$btn_give_up}>
                    放弃
                  </Button>
                  <Button class="w-full" store={vm.ui.$btn_submit}>
                    交卷
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
