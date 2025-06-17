import { BizError } from "@/domains/error";
import { ListCore } from "@/domains/list";
import { request_factory } from "@/domains/request/utils";
import { Result } from "@/domains/result";

export const request = request_factory({
  hostnames: {},
  process<T>(r: Result<{ code: number | string; msg: string; data: T }>) {
    // console.log("[common]", r);
    if (r.error) {
      return Result.Err(r.error);
    }
    const { code, msg, data } = r.data;
    if (code !== 200) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
});

ListCore.commonProcessor = <T>(
  originalResponse: any
): {
  dataSource: T[];
  page: number;
  pageSize: number;
  total: number;
  empty: boolean;
  noMore: boolean;
  error: BizError | null;
} => {
  if (originalResponse === null) {
    return {
      dataSource: [],
      page: 1,
      pageSize: 20,
      total: 0,
      noMore: false,
      empty: false,
      error: null,
    };
  }
  try {
    const data = originalResponse.data || originalResponse;
    const { list, page, page_size, total, noMore, no_more, has_more, next_marker } = data;
    const result = {
      dataSource: list,
      page,
      pageSize: page_size,
      total,
      empty: false,
      noMore: false,
      error: null,
      next_marker,
    };
    if (total <= page_size * page) {
      result.noMore = true;
    }
    if (no_more !== undefined) {
      result.noMore = no_more;
    }
    if (has_more !== undefined) {
      result.noMore = !has_more;
    }
    if (noMore !== undefined) {
      result.noMore = noMore;
    }
    if (next_marker === null) {
      result.noMore = true;
    }
    if (list.length === 0 && page === 1) {
      result.empty = true;
    }
    if (list.length === 0) {
      result.noMore = true;
    }
    // console.log("[STORE]ListCore.commonProcessor", data, result);
    return result;
  } catch (error) {
    return {
      dataSource: [],
      page: 1,
      pageSize: 20,
      total: 0,
      noMore: false,
      empty: false,
      error: new BizError([`${(error as Error).message}`]),
      // next_marker: "",
    };
  }
};
