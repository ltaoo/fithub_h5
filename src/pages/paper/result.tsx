import { For, Show } from "solid-js";
import { Loader2 } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { DialogCore, ScrollViewCore } from "@/domains/ui";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { fetchExamResult, fetchExamResultProcess } from "@/biz/paper/services";
import { QuizAnswerStatus } from "@/biz/paper/constants";
import { Sheet } from "@/components/ui/sheet";

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
      // props.history.back();
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
      <PageView store={vm} home>
        <Show when={state().loading}>
          <div class="flex justify-center">
            <Loader2 class="w-8 h-8 text-w-fg-1 animate-spin" />
          </div>
        </Show>
        <Show when={state().result}>
          <div>
            <div class="text-xl text-center text-w-fg-0">{state().result?.status_text}</div>
            <div class="mt-4 border-2 border-w-bg-5 rounded-lg">
              <div class="p-4 border-b-2 border-w-bg-5">
                <div class="text-w-fg-0">明细</div>
              </div>
              <div class="grid grid-cols-10 gap-2 p-4">
                <For each={state().result?.quizzes}>
                  {(quiz) => {
                    return (
                      <div
                        classList={{
                          "flex items-center justify-center h-[26px]": true,
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
      <Sheet store={vm.ui.$dialog_quiz}>
        <div class="w-screen bg-w-bg-1 p-2">
          <Show when={state().cur_quiz}>
            <div>{state().cur_quiz?.content}</div>
            <div>{state().cur_quiz?.analysis}</div>
          </Show>
        </div>
      </Sheet>
    </>
  );
}
