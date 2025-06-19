import { Plus } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { PageView } from "@/components/page-view";
import { FieldV2 } from "@/components/fieldv2/field";
import { Button, Input, Textarea } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { FieldArrV2 } from "@/components/fieldv2/arr";
import { VideoURLInput } from "@/components/video-url-input/video-url-input";
import { Flex } from "@/components/flex/flex";
import { IconButton } from "@/components/icon-btn/icon-btn";
import { WorkoutActionSelectView } from "@/components/workout-action-select";
import { Sheet } from "@/components/ui/sheet";
import { WorkoutActionInput } from "@/components/input-workout-action";
import { Switcher } from "@/components/ui/switch";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ScrollViewCore } from "@/domains/ui";

import { ArticleEditorModel } from "./editor";

function ArticleCreateViewModel(props: ViewComponentProps) {
  const $editor = ArticleEditorModel(props);

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickPlus() {
      $editor.methods.handleClickPlus();
    },
  };
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $form: $editor.ui.$form,
    $btn_create: $editor.ui.$btn_create,
    $select_workout_action: $editor.ui.$select_workout_action,
    $ref_workout_action_input: $editor.ui.$ref_workout_action_input,
  };
  let _state = {};
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
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function ArticleCreateView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(ArticleCreateViewModel, [props]);

  return (
    <>
      <PageView
        store={vm}
        operations={
          <div>
            <Button class="w-full" store={vm.ui.$btn_create}>
              创建
            </Button>
          </div>
        }
      >
        <div class="space-y-2">
          <FieldV2 store={vm.ui.$form.fields.title}>
            <Input store={vm.ui.$form.fields.title.input} />
          </FieldV2>
          <FieldV2 store={vm.ui.$form.fields.overview}>
            <Textarea store={vm.ui.$form.fields.overview.input} />
          </FieldV2>
          <FieldV2 store={vm.ui.$form.fields.type}>
            <Select store={vm.ui.$form.fields.type.input} />
          </FieldV2>
          <FieldV2 store={vm.ui.$form.fields.video_url}>
            <VideoURLInput store={vm.ui.$form.fields.video_url.input} />
          </FieldV2>
          <Flex class="justify-between">
            <div class="field__label flex items-center justify-between">
              <div class="field__title ml-2 text-sm text-w-fg-0">视频时间点注解</div>
            </div>
            <IconButton
              onClick={() => {
                vm.methods.handleClickPlus();
              }}
            >
              <Plus class="w-4 h-4 text-w-fg-0" />
            </IconButton>
          </Flex>
          <FieldArrV2
            class="space-y-4"
            hide_label
            store={vm.ui.$form.fields.details.fields.time_points}
            render={(field) => {
              return (
                <div class="space-y-2">
                  <FieldV2 store={field.fields.video_time_text}>
                    <Input store={field.fields.video_time_text.input} />
                  </FieldV2>
                  <FieldV2 store={field.fields.text}>
                    <Textarea store={field.fields.text.input} />
                  </FieldV2>
                  <FieldV2 store={field.fields.workout_action}>
                    <WorkoutActionInput
                      store={field.fields.workout_action.input}
                      onShow={() => {
                        vm.ui.$ref_workout_action_input.select(field);
                      }}
                    />
                  </FieldV2>
                </div>
              );
            }}
          ></FieldArrV2>
          <FieldV2 store={vm.ui.$form.fields.status}>
            <Switcher store={vm.ui.$form.fields.status.input} texts={["公开", "仅自己可见"]} />
          </FieldV2>
        </div>
      </PageView>
      <Sheet ignore_safe_height store={vm.ui.$select_workout_action.ui.$dialog} app={props.app}>
        <WorkoutActionSelectView store={vm.ui.$select_workout_action} app={props.app} />
      </Sheet>
    </>
  );
}
