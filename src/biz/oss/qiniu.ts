import { createDirectUploadTask, createMultipartUploadV2Task, FileData } from "qiniu-js";
import { HttpProtocol, LogLevel } from "qiniu-js/output/@internal";

import { ViewComponentProps } from "@/store/types";

import { Result } from "@/domains/result";
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { StorageCore } from "@/domains/storage";
import { HttpClientCore } from "@/domains/http_client";
import { request_factory } from "@/domains/request/utils";
import { RequestCore } from "@/domains/request";
import { random_key } from "@/utils";

import { noop, checkFile } from "./utils";

export const request = request_factory({
  hostnames: {},
  process<T>(r: Result<{ code: number | string; msg: string; data: T }>) {
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { code, msg, data } = r.data;
    if (code !== 200) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
});
function fetchQiniuToken() {
  return request.post<{ token: string }>("/api/auth/qiniu_token");
}

export function QiniuOSS(props: { storage: StorageCore<{ token: string }>; client: HttpClientCore; scope?: string }) {
  const $storage = props.storage;
  const $request = new RequestCore(fetchQiniuToken, { client: props.client });
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    compress() {},
    check_file(file: File, opt: { accept: string; size: number }) {
      const tip = checkFile(file, opt);
      if (tip !== null) {
        return Result.Err(tip);
      }
      return Result.Ok(file);
    },
    set_env(v: string) {
      _env = v;
    },
    build_key(opt: { filename: string; scope: string }) {
      const segments = opt.filename.split(".");
      const suffix = segments[segments.length - 1];
      return [_env, opt.scope, random_key(8)].join("/") + "." + suffix;
    },
    /**
     * 上传文件
     */
    async upload_file(file: File) {
      const key = methods.build_key({ scope: _scope, filename: file.name });
      const task = createDirectUploadTask(
        {
          type: "file",
          key,
          data: file,
        },
        {
          // apiServerUrl: props.api_server_url,
          tokenProvider: async () => {
            if (_token) {
              return Promise.resolve(_token);
            }
            const r = await $request.run();
            if (r.error) {
              return Promise.reject(r.error);
            }
            _token = r.data.token;
            $storage.set("token", _token);
            return Promise.resolve(_token);
          },
        }
      );
      // 设置进度回调函数
      task.onProgress((progress, context) => {
        // console.log("更新");
        // console.log(progress);
        // console.log(context);
        // 处理进度回调
        bus.emit(Events.Progress, progress);
      });

      // 设置完成回调函数
      task.onComplete((result, context) => {
        // 处理完成回调
        bus.emit(Events.Success, JSON.parse(result ?? "{}"));
        bus.emit(Events.Completed);
      });
      // 设置错误回调函数
      task.onError((error, context) => {
        // @ts-ignore
        if (error?.httpCode === 401) {
          _token = "";
        }
        // 处理错误回调
        bus.emit(Events.Error, new BizError([error?.message ?? "上传失败"]));
        bus.emit(Events.Completed);
      });
      bus.emit(Events.Start);
      task.start();
      return Result.Ok(null);
    },

    async auth() {},
  };
  const ui = {};

  let _token = $storage.get("token") ?? "";
  let _env = "release";
  let _scope = props.scope ?? "media";
  let _config = {};

  let _state = {};
  enum Events {
    Start,
    // 上传进度更新
    Progress,
    // 上传完成
    Completed,
    Success,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Start]: void;
    [Events.Progress]: {
      /** 上传的文件总大小；单位 byte */
      size: number;
      /** 目前处理的百分比进度；范围 0-1 */
      percent: number;
      /** 具体每个部分的进度信息； */
      details: Record<
        string,
        {
          /** 子任务的处理数据大小；单位 byte */
          size: number;
          /** 目前处理的百分比进度；范围 0-1 */
          percent: number;
          /** 该处理是否复用了缓存； */
          fromCache: boolean;
        }
      >;
    };
    [Events.Success]: { hash: string; key: string };
    [Events.Completed]: void;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    upload: methods.upload_file,
    filename: methods.build_key,
    ready() {},
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
      return bus.on(Events.Start, handler);
    },
    onProgress(handler: Handler<TheTypesOfEvents[Events.Progress]>) {
      return bus.on(Events.Progress, handler);
    },
    onSuccess(handler: Handler<TheTypesOfEvents[Events.Success]>) {
      return bus.on(Events.Success, handler);
    },
    onCompleted(handler: Handler<TheTypesOfEvents[Events.Completed]>) {
      return bus.on(Events.Completed, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
