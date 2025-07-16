import { base, Handler } from "@/domains/base";
import { ImageCore } from "@/domains/ui/image";
import { DragZoneCore } from "@/domains/ui/drag-zone";
import { OSS } from "@/biz/oss";
import { readFileAsURL } from "@/utils/browser";
import { BizError } from "@/domains/error";
import { sleep } from "@/utils";

export function ImageUploadCore(props: {
  tip?: string;
  oss: OSS;
  onSelectFile?: () => void;
  onChange?: (v: { key: string }) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };

  const ui = {
    $zone: new DragZoneCore({ tip: props.tip }),
    $img: new ImageCore({}),
  };
  let _url = "";
  let _file: null | File = null;
  let _is_uploading = false;
  let _upload_percent = 0;
  let _error: BizError | null = null;
  let _upload_result: { key: string } = { key: "" };
  const _state = {
    get value() {
      return _upload_result;
    },
    get url() {
      return _url;
    },
    get file() {
      return _file;
    },
    get uploading() {
      return _is_uploading;
    },
    get percent() {
      return _upload_percent * 100;
    },
    get error() {
      return _error;
    },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: { key: string };
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$zone.onChange(async (files) => {
    const file = files[0];
    if (!file) {
      return;
    }
    props.oss.upload(file);
    // @todo readFileAsURL 该怎么来呢?
    const r = await readFileAsURL(file);
    if (r.error) {
      return;
    }
    _file = file;
    _url = r.data;
    ui.$img.setLoaded();
    ui.$img.setURL(_url);
    if (props.onSelectFile) {
      props.onSelectFile();
    }
    // bus.emit(Events.Change, _url);
    bus.emit(Events.StateChange, { ..._state });
  });

  props.oss.onStart(() => {
    _is_uploading = true;
    _upload_percent = 0;
    _upload_result = { key: "" };
    _error = null;
    methods.refresh();
  });
  props.oss.onProgress(({ percent }) => {
    _upload_percent = percent;
    methods.refresh();
  });
  props.oss.onSuccess((r) => {
    _upload_result = r;
    bus.emit(Events.Change, r);
    methods.refresh();
  });
  props.oss.onCompleted(() => {
    _is_uploading = false;
    methods.refresh();
  });
  props.oss.onError((e) => {
    _error = e;
    methods.refresh();
  });
  if (props.onChange) {
    bus.on(Events.Change, props.onChange);
  }

  return {
    shape: "image-upload" as const,
    state: _state,
    get value() {
      return _state.value;
    },
    get defaultValue() {
      return _state.value;
    },
    ui,
    setValue(opt: { key: string }) {
      _url = opt.key;
      bus.emit(Events.Change, { key: opt.key });
    },
    clear() {
      _url = "";
      _is_uploading = false;
      _upload_result = { key: "" };
      _upload_percent = 0;
      _error = null;
      bus.emit(Events.Change, _upload_result);
      bus.emit(Events.StateChange, { ..._state });
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ImageUploadCore = ReturnType<typeof ImageUploadCore>;
