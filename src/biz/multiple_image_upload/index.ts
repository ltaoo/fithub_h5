import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";

import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { ArrayFieldCore, SingleFieldCore } from "@/domains/ui/formv2";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";
import { QiniuOSS } from "@/biz/oss/qiniu";
import { HttpClientCore } from "@/domains/http_client";
import { sleep } from "@/utils";
import { StorageCore } from "@/domains/storage";

export function MultipleImageUploadModel(props: { storage: StorageCore<{ token: string }>; client: HttpClientCore }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    mapFieldWithIdx(idx: number) {
      //       console.log("[BIZ]multiple_image_upload - mapFieldWithIdx", idx);
      return ui.$form.fields[idx].field;
    },
  };
  const ui = {
    $form: new ArrayFieldCore({
      field(idx) {
        return new SingleFieldCore({
          input: ImageUploadCore({
            oss: QiniuOSS({ storage: props.storage, client: props.client, scope: "workout_day" }),
            onSelectFile() {
              //       console.log("[BIZ]multiple_image_upload - $form onChange", v, idx);
              ui.$form.append();
              methods.refresh();
            },
          }),
        });
      },
    }),
  };

  let _state = {
    get value() {
      return ui.$form.value.filter(Boolean);
    },
  };
  enum Events {
    Change,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _state.value;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$form.append();

  return {
    shape: "input" as const,
    methods,
    ui,
    state: _state,
    get value() {
      return _state.value;
    },
    get defaultValue() {
      return _state.value;
    },
    setValue(v: string[]) {
      ui.$form.setValue(v);
    },
    ready() {},
    destroy() {
      bus.destroy();
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export type MultipleImageUploadModel = ReturnType<typeof MultipleImageUploadModel>;
