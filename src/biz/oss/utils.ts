/**
 * @file 工具方法
 */

export function noop() {}
/**
 * 字节转 MB
 * @param {number} byte - 字节数
 */
function byteTransformer(byte: number) {
  const kbCount = byte / 1024;
  const mbCount = kbCount / 1024;

  return [mbCount, kbCount];
}
/**
 * 检查字节是否超出限制
 * @param byte - 字节数
 * @param limit - MB
 */
export function checkIsExceedLimit(byte: number, limit?: number) {
  if (limit === undefined) {
    return false;
  }
  const [mb] = byteTransformer(byte);

  if (mb < limit) {
    return false;
  }
  return true;
}

/**
 * 进度值格式化
 * @param percent - 进度，小于 1 的两位小数
 * @returns {number} 0-100 的正整数
 */
export function formatPercent(percent: number) {
  return parseInt((percent * 10000) as any, 10) / 100;
}

/**
 * 获取文件后缀
 */
export function getFileSuffix(name: string) {
  const fileSuffix = name.split(".").pop() as string;
  return fileSuffix;
}

export function checkFileTypeMatchAccept(name: string, accept?: string) {
  if (accept === undefined) {
    return true;
  }
  // 检查文件类型
  const suffix = getFileSuffix(name);
  // const mimeTypes = accept.split(',').filter(Boolean);
  // mimeTypes.every((mimeType) => {

  // });
  return true;
}

export function checkFile(file: File, options: { size?: number; accept?: string }) {
  const { size: sizeLimit, accept } = options;

  const { size: fileSize, name } = file;

  if (checkIsExceedLimit(fileSize, sizeLimit!)) {
    return "文件大小超出限制";
  }
  if (!checkFileTypeMatchAccept(name, accept)) {
    return "文件格式错误";
  }
  return null;
}

export const uid = (() => {
  let id = 0;
  return () => {
    id += 1;
    return `rc-${Date.now()}-${id}`;
  };
})();
/**
 * base64 转二进制 File 类型
 * @param dataURL
 * @param filename
 */
export function dataURLToFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const result = new File([u8arr], filename, { type: mime });
  // @ts-ignore
  result.uid = uid();
  return result as File;
}

/**
 * 获取变量类型
 */
function type(variable: any) {
  return Object.prototype.toString.call(variable).split(" ")[1].slice(0, -1).toLowerCase();
}

/**
 * 将函数转成 promise 接口
 */
export function promisify<T>(fn: Function) {
  return (...params: any[]): Promise<T> => {
    return new Promise((resolve, scopeReject) => {
      const args = [
        ...params,
        (err: Error, data: T) => {
          if (err) {
            scopeReject(err);
            return;
          }
          resolve(data);
        },
      ];
      fn(...args);
    });
  };
}

/**
 * 兼容处理各种错误，统一转成 Error 类型
 */
export function normalizeError(error: any) {
  if (typeof error === "string") {
    return new Error(error);
  }
  if (type(error) === "error") {
    return error;
  }
  const isCOSError = type(error) === "object" && typeof error.error === "string";
  if (isCOSError) {
    return new Error(error.error);
  }
  const isRequestError = error.code !== undefined;
  if (isRequestError) {
    return {
      message: error.msg,
      code: error.code,
      data: error.data,
    };
  }
  return error;
}

/**
 * 获取本地文件可访问的 blob 地址
 * @param file
 */
export function readURLFromFile(file: File): Promise<string> {
  // console.log('[COMPONENT]LocalImageReader - readURL', file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      // @ts-ignore
      resolve(e.target.result);
    };
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}
