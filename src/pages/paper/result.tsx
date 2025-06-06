/**
 * @file 答题结果
 */
import { For, Show } from "solid-js";
import { Check, CheckCircle, CircleCheck, CircleX, Loader2, X } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { Sheet } from "@/components/ui/sheet";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { fetchExamResult, fetchExamResultProcess } from "@/biz/paper/services";
import { ExamStatus, QuizAnswerStatus, QuizChoiceInAnswerStatus } from "@/biz/paper/constants";
import { Divider } from "@/components/divider";

function ExamResultViewModel(props: ViewComponentProps) {
  const request = {
    exam: {
      result: new RequestCore(fetchExamResult, { process: fetchExamResultProcess, client: props.client }),
    },
  };
  type TheQuiz = TheResponseOfRequestCore<typeof request.exam.result>["quizzes"][number];
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      if (_can_back) {
        props.history.back();
        return;
      }
      props.history.push("root.home_layout.index");
    },
    showDialogQuiz(quiz: TheQuiz) {
      _cur_quiz = quiz;
      ui.$dialog_quiz.show();
      methods.refresh();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $dialog_quiz: new DialogCore({}),
  };

  let _cur_quiz: TheQuiz | null = null;
  const prev_view = props.history.stacks[props.history.stacks.length - 2];
  let _can_back = prev_view.name === "root.exam_result_list";
  let _state = {
    get loading() {
      return request.exam.result.loading;
    },
    get result() {
      return request.exam.result.response;
    },
    get cur_quiz() {
      return _cur_quiz;
    },
    get can_back() {
      return _can_back;
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

  request.exam.result.onStateChange(() => methods.refresh());

  return {
    methods,
    ui,
    state: _state,
    async ready() {
      const id = Number(props.view.query.id);
      if (Number.isNaN(id)) {
        return;
      }
      const r = await request.exam.result.run({ id });
      if (r.error) {
        return;
      }
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function PaperResultView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ExamResultViewModel, [props]);

  return (
    <>
      <PageView store={vm} home={!state().can_back}>
        <Show when={state().loading}>
          <div class="flex justify-center">
            <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
          </div>
        </Show>
        <Show when={state().result}>
          <div>
            <div class="flex flex-col items-center py-4">
              <Show when={state().result?.pass} fallback={<CircleX class="w-12 h-12 text-red-500" />}>
                <CircleCheck class="w-12 h-12 text-green-500" />
              </Show>
              <div class="mt-2 text-w-fg-0 text-center">{state().result?.status_text}</div>
            </div>
            <Divider />
            <div class="mt-4 border-2 border-w-fg-3 rounded-lg">
              <div class="p-4 border-b-2 border-w-fg-3">
                <div class="text-w-fg-0">题目明细</div>
              </div>
              <div class="grid grid-cols-10 gap-2 p-4">
                <For each={state().result?.quizzes}>
                  {(quiz) => {
                    return (
                      <div
                        classList={{
                          "flex items-center justify-center h-[26px] rounded-md": true,
                          "bg-green-500": quiz.status === QuizAnswerStatus.Correct,
                          "bg-red-500": quiz.status === QuizAnswerStatus.Incorrect,
                          "bg-w-bg-5":
                            quiz.status === QuizAnswerStatus.Skipped || quiz.status === QuizAnswerStatus.Unknown,
                        }}
                        onClick={() => {
                          vm.methods.showDialogQuiz(quiz);
                        }}
                      >
                        <div class="text-sm text-w-fg-0">{quiz.idx}</div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </PageView>
      <Sheet store={vm.ui.$dialog_quiz} app={props.app}>
        <div class="p-2 min-h-[240px]">
          <Show when={state().cur_quiz}>
            <div class="text-w-fg-0">{state().cur_quiz?.content}</div>
            <div class="mt-2 space-y-2">
              <For each={state().cur_quiz?.choices}>
                {(v) => {
                  return (
                    <div
                      class="flex items-center justify-between p-2 border-2 rounded-md text-w-fg-0 text-sm"
                      classList={{
                        "border-green-500": v.is_correct,
                        "border-w-fg-3 ": !v.is_correct,
                      }}
                    >
                      <div class="flex items-center">
                        <div class="w-[24px]">{v.value_text}、</div>
                        <div>{v.text}</div>
                      </div>
                      <Show when={v.select_status === QuizChoiceInAnswerStatus.Correct}>
                        <Check class="w-4 h-4 text-green-500" />
                      </Show>
                      <Show when={v.select_status === QuizChoiceInAnswerStatus.Incorrect}>
                        <X class="w-4 h-4 text-red-500" />
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
            <div class="mt-4">
              <Show
                when={state().cur_quiz?.analysis}
                fallback={<div class="p-2 text-w-fg-1 text-sm text-center">暂无解析</div>}
              >
                <div class="p-2 border-2 border-w-fg-3 rounded-lg text-w-fg-1 text-sm">
                  <pre class="w-full break-all whitespace-pre-wrap">{state().cur_quiz?.analysis}</pre>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Sheet>
    </>
  );
}
