import { request } from "@/biz/requests";
import { ListResponse } from "@/biz/requests/types";
import { FetchParams } from "@/domains/list/typing";

/** 获取 LLM 厂商 */
export function fetch_llm_providers() {
  return request.post<{
    list: {
      id: string;
      name: string;
      logo_uri: string;
      api_address: string;
      configure: string;
      api_proxy_address: string | null;
      api_key: string | null;
      enabled: number;
      models: {
        id: string;
        name: string;
        enabled: number;
        builtin: number;
      }[];
    }[];
  }>("/api/llm_provider/list", {});
}

export function update_llm_provider(payload: {
  id: string;
  enabled: boolean;
  api_address?: string;
  api_key?: string;
  models: { id: string; enabled: boolean }[];
}) {
  return request.post("/api/llm_provider/update", { payload });
}

export function create_provider_model(payload: { provider_id: string; model_id: string }) {
  return request.post("/api/llm_model/create", { payload });
}

export function delete_provider_model(payload: { provider_id: string; model_id: string }) {
  return request.post("/api/llm_model/delete", { payload });
}

export function update_provider_model(payload: { provider_id: string; model_id: string; enabled: boolean }) {
  return request.post("/api/llm_model/update", { payload });
}

/** 获取 LLM Agent */
export function fetch_llm_agents(payload: FetchParams) {
  return request.post<
    ListResponse<{
      id: string;
      name: string;
      desc: string | null;
      avatar_uri: string | null;
      prompt: string;
      tags: string;
      agent_type: number;
      llm_config: string;
      llm_provider_id: string;
      llm_model_id: string;
      builtin: number;
      config: string;
      created_at: string;
    }>
  >("/api/llm_agent/list", {
    page: payload.page,
    page_size: payload.pageSize,
  });
}
export function find_llm_agent_by_id(payload: { id: string | number }) {
  return request.post<{
    id: string;
    name: string;
    desc: string;
    avatar_uri: string;
    prompt: string;
    llm_config: string;
    llm_provider_id: string;
    llm_model_id: string;
    builtin: number;
    config: string;
    created_at: string;
  }>("/api/llm_agent/find_by_id", {
    id: Number(payload.id),
  });
}
export function find_llm_agent_by_name(payload: { name: string }) {
  return request.post<{
    id: string;
    name: string;
    desc: string;
    avatar_uri: string;
    prompt: string;
    llm_config: string;
    llm_provider_id: string;
    llm_model_id: string;
    builtin: number;
    config: string;
    created_at: string;
  }>("/api/llm_agent/find_by_name", {
    name: payload.name,
  });
}
// export const find_llm_agent_by_id_request =(payload: { id: string }) {
// return ;
export function update_llm_agent(payload: {
  id: string;
  name?: string;
  desc?: string;
  prompt?: string;
  llm?: {
    provider_id: string | null;
    model_id: string | null;
    extra: Record<string, any>;
  };
  config?: Record<string, any>;
}) {
  return request.post("/api/llm_agent/update", { payload });
}

export function create_llm_agent(payload: {
  name: string;
  desc?: string;
  prompt: string;
  llm: {
    provider_id: string | null;
    model_id: string | null;
    extra: Record<string, any>;
  };
}) {
  return request.post("/api/llm_agent/create", { payload });
}

export function delete_llm_agent(payload: { id: string | number }) {
  return request.post("/api/llm_agent/delete", { id: Number(payload.id) });
}
