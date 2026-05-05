import type { FallbackFlags } from "@/types";

export type ApiMeta = {
  source?: string;
  fallback?: boolean;
  reason?: string;
  requestedId?: string;
  stored?: boolean;
  storageSource?: string;
  routeSource?: string;
  weatherSource?: string;
  reportSource?: string;
};

export type SilverWayApiResponse<T> = {
  ok: boolean;
  mode: string;
  data: T;
  message: string;
  meta?: ApiMeta;
  fallbackFlags?: FallbackFlags;
};

export function createSuccessResponse<T>(params: {
  mode: string;
  data: T;
  message?: string;
  meta?: ApiMeta;
  fallbackFlags?: FallbackFlags;
  resultId?: string;
}): Response {
  const body: Record<string, unknown> = {
    ok: true,
    mode: params.mode,
    data: params.data,
    message: params.message ?? "요청이 완료되었습니다.",
  };
  if (params.meta) body.meta = params.meta;
  if (params.fallbackFlags) body.fallbackFlags = params.fallbackFlags;
  if (params.resultId !== undefined) body.resultId = params.resultId;
  return Response.json(body);
}

export function createFallbackResponse<T>(params: {
  mode: string;
  data: T;
  message?: string;
  reason?: string;
  meta?: ApiMeta;
  fallbackFlags?: FallbackFlags;
  resultId?: string;
}): Response {
  const body: Record<string, unknown> = {
    ok: true,
    mode: params.mode,
    data: params.data,
    message: params.message ?? "일부 외부 데이터를 불러오지 못해 예시 데이터를 함께 사용했습니다.",
    meta: {
      ...params.meta,
      fallback: true,
      ...(params.reason ? { reason: params.reason } : {}),
    },
  };
  if (params.fallbackFlags) body.fallbackFlags = params.fallbackFlags;
  if (params.resultId !== undefined) body.resultId = params.resultId;
  return Response.json(body);
}
