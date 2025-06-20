import { ViewComponentProps } from "@/store/types";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ButtonCore, CheckboxCore, InputCore, ScrollViewCore, SelectCore } from "@/domains/ui";
import { ArrayFieldCore, ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { CoachArticleType, CoachArticleTypeOptions } from "@/biz/coach/constants";
import { WorkoutActionSelectViewModel } from "@/biz/workout_action_select";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { fetchWorkoutActionList, fetchWorkoutActionListProcess } from "@/biz/workout_action/services";
import { VideoURLInputModel } from "@/biz/input_video_url/input_video_url";
import { WorkoutActionInputModel } from "@/biz/input_workout_action/input_workout_action";
import { Result } from "@/domains/result";
import { createArticle, fetchArticleProfile, fetchArticleProfileProcess, updateArticle } from "@/biz/coach/service";
import { RefCore } from "@/domains/ui/cur";
import { hour_text_to_seconds, seconds_to_hour_text, toFixed } from "@/utils";

export function ArticleEditorModel(props: ViewComponentProps) {
  const request = {
    workout_action: {
      list: new ListCore(
        new RequestCore(fetchWorkoutActionList, { process: fetchWorkoutActionListProcess, client: props.client })
      ),
    },
    content: {
      create: new RequestCore(createArticle, { client: props.client }),
      update: new RequestCore(updateArticle, { client: props.client }),
      profile: new RequestCore(fetchArticleProfile, { process: fetchArticleProfileProcess, client: props.client }),
    },
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    back() {
      props.history.back();
    },
    handleClickPlus() {
      const $video = ui.$form.fields.video_url.input.ui.$video;
      const field = ui.$form.fields.details.fields.time_points.append();
      field.setValue({
        text: "",
        video_time_text: seconds_to_hour_text($video.currentTime),
        video_time: toFixed($video.currentTime, 0),
        workout_action: [],
      });
    },
    async toBody() {
      const r = await ui.$form.validate();
      if (r.error) {
        return Result.Err(r.error);
      }
      const v = r.data;
      console.log("[PAGE]article/create - before body = ", v);
      const body = {
        title: v.title,
        overview: v.overview,
        type: v.type ?? CoachArticleType.Video,
        video_url: v.video_url,
        status: v.status ? 1 : 2,
        time_points: v.details.time_points.map((v) => {
          return {
            id: v.id,
            time: hour_text_to_seconds(v.video_time_text),
            text: v.text,
            workout_action_id: v.workout_action.length ? Number(v.workout_action[0].id) : 0,
          };
        }),
      };
      return Result.Ok(body);
    },
    async fetch(body: { id: number }) {
      const r = await request.content.profile.run({ id: body.id });
      if (r.error) {
        return;
      }
      const v = r.data;
      ui.$form.setValue({
        id: v.id,
        title: v.title,
        overview: v.overview.join("\n"),
        type: v.type,
        video_url: v.video_url,
        details: {
          time_points: v.time_points.map((p) => {
            return {
              id: p.id,
              workout_action: p.workout_action ? [p.workout_action] : [],
              video_time: p.time,
              video_time_text: p.time_text,
              text: p.text.join("\n"),
            };
          }),
        },
      });
      ui.$form.refresh();
    },
  };

  const $select_workout_action = WorkoutActionSelectViewModel({
    list: request.workout_action.list,
    multiple: false,
    app: props.app,
    client: props.client,
    onOk(actions) {
      if (actions.length === 0) {
        return;
      }
      const field = ui.$ref_workout_action_input.value;
      if (!field) {
        props.app.tip({
          text: ["异常操作"],
        });
        return;
      }
      const act = actions[0];
      field.setValue({
        ...field.value,
        workout_action: [act],
      });
      ui.$select_workout_action.ui.$dialog.hide();
      $form.refresh();
    },
  });
  const $form = new ObjectFieldCore({
    fields: {
      id: new SingleFieldCore({
        input: new InputCore({ defaultValue: 0, type: "number" }),
      }),
      title: new SingleFieldCore({
        label: "标题",
        rules: [
          {
            required: true,
            minLength: 5,
            maxLength: 50,
          },
        ],
        input: new InputCore({ defaultValue: "" }),
      }),
      overview: new SingleFieldCore({
        label: "概要",
        rules: [
          {
            maxLength: 500,
          },
        ],
        input: new InputCore({ defaultValue: "" }),
      }),
      type: new SingleFieldCore({
        label: "类型",
        input: new SelectCore({
          defaultValue: CoachArticleType.Video,
          options: CoachArticleTypeOptions,
        }),
      }),
      video_url: new SingleFieldCore({
        label: "视频链接",
        rules: [
          {
            maxLength: 100,
          },
        ],
        input: VideoURLInputModel({
          app: props.app,
          onError(e) {
            props.app.tip({
              text: e.messages,
            });
          },
        }),
      }),
      details: new ObjectFieldCore({
        fields: {
          time_points: new ArrayFieldCore({
            label: "视频时间点详细",
            field(count) {
              return new ObjectFieldCore({
                fields: {
                  id: new SingleFieldCore({
                    input: new InputCore({ defaultValue: 0, type: "number" }),
                  }),
                  workout_action: new SingleFieldCore({
                    label: "动作",
                    rules: [],
                    input: WorkoutActionInputModel({
                      $select: $select_workout_action,
                      onError(e) {
                        props.app.tip({
                          text: e.messages,
                        });
                      },
                    }),
                  }),
                  text: new SingleFieldCore({
                    label: "说明",
                    rules: [
                      {
                        maxLength: 500,
                      },
                    ],
                    input: new InputCore({ defaultValue: "" }),
                  }),
                  video_time: new SingleFieldCore({
                    hidden: true,
                    input: new InputCore({ defaultValue: 0, type: "number" }),
                  }),
                  video_time_text: new SingleFieldCore({
                    label: "时间点",
                    rules: [
                      {
                        required: true,
                        custom(v) {
                          if (!(v as string).match(/[0-9]{1,}:[0-9]{1,}$/)) {
                            return Result.Err("时间点格式错误");
                          }
                          return Result.Ok(null);
                        },
                      },
                    ],
                    input: new InputCore({ defaultValue: "" }),
                  }),
                },
              });
            },
          }),
        },
      }),
      status: new SingleFieldCore({
        label: "是否公开",
        input: new CheckboxCore(),
      }),
    },
  });
  const ui = {
    $view: new ScrollViewCore({}),
    $history: props.history,
    $select_workout_action,
    $form,
    $btn_create: new ButtonCore({
      async onClick() {
        const r = await methods.toBody();
        if (r.error) {
          props.app.tip({
            text: r.error.messages,
          });
          return;
        }
        const body = r.data;
        ui.$btn_create.setLoading(true);
        const r2 = await request.content.create.run(body);
        ui.$btn_create.setLoading(false);
        if (r2.error) {
          return;
        }
        props.app.tip({
          text: ["创建成功"],
        });
        props.history.replace("root.content_profile", {
          id: String(r2.data.id),
        });
      },
    }),
    $btn_update: new ButtonCore({
      async onClick() {
        const id = request.content.profile.response?.id ?? null;
        if (id === null) {
          props.app.tip({
            text: ["异常操作"],
          });
          return;
        }
        const r = await methods.toBody();
        if (r.error) {
          props.app.tip({
            text: r.error.messages,
          });
          return;
        }
        const body = r.data;
        ui.$btn_create.setLoading(true);
        const r2 = await request.content.update.run({
          ...body,
          id,
        });
        ui.$btn_create.setLoading(false);
        if (r2.error) {
          return;
        }
        props.app.tip({
          text: ["编辑成功"],
        });
        props.history.back();
      },
    }),
    $ref_workout_action_input: new RefCore<(typeof $form.fields.details.fields.time_points.fields)[number]["field"]>(),
  };
  let _state = {
    get profile() {
      return request.content.profile.response;
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

  request.content.profile.onStateChange(() => methods.refresh());

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
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}
