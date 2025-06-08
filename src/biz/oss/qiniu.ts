import { createDirectUploadTask, createMultipartUploadV2Task, FileData } from "qiniu-js";
import { HttpProtocol, LogLevel } from "qiniu-js/output/@internal";

import { ViewComponentProps } from "@/store/types";

import { Result } from "@/domains/result";
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { StorageCore } from "@/domains/storage";
import { HttpClientCore } from "@/domains/http_client";
import { connect } from "@/domains/http_client/connect.axios";

import { noop, checkFile } from "./utils";

export function QiniuOSS(props: {
  storage: StorageCore<{ token: string }>;
  client: ViewComponentProps["client"];
  // 上传服务地址，手动指定上传服务地址，示例：up.qiniu.com
  //   upload_hosts?: string[];
  //   log_level?: LogLevel;
  //   protocol?: HttpProtocol;
  //   vars?: Record<string, string>;
}) {
  const $client = new HttpClientCore();
  const $storage = props.storage;
  connect($client);
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
    /**
     * 上传文件
     */
    async upload_file(file: File) {
      // console.log('begin upload');
      const task = createDirectUploadTask(
        {
          type: "file",
          data: file,
        },
        {
          // apiServerUrl: props.api_server_url,
          tokenProvider: async () => {
            if (_token) {
              return Promise.resolve(_token);
            }
            return _token;
          },
        }
      );
      // 设置进度回调函数
      task.onProgress((progress, context) => {
        // 处理进度回调
      });

      // 设置完成回调函数
      task.onComplete((result, context) => {
        // 处理完成回调
      });
      // 设置错误回调函数
      task.onError((error, context) => {
        // 处理错误回调
      });
      task.start();
    },

    async auth() {},
  };
  const ui = {};

  let _token = "";
  let _config = {};

  let _state = {};
  enum Events {
    // 上传进度更新
    Progress,
    // 上传完成
    Completed,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
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
    [Events.Completed]: string;
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
