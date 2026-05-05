// SERVER ONLY — ODSAY_API_KEY는 서버에서만 사용. 클라이언트 컴포넌트에서 import 금지.
import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { normalizeOdsayRoute } from "./normalizeOdsayRoute";
import type { OdsayRouteRequest, OdsayRouteResult } from "./types";

const ODSAY_ENDPOINT = "https://api.odsay.com/v1/api/searchPubTransPathT";
const ODSAY_TIMEOUT_MS = 5000;

function isValidCoord(v: unknown): boolean {
  return typeof v === "number" && isFinite(v) && v !== 0;
}

function makeFallback(reason: string): OdsayRouteResult {
  return { ok: false, transit: sampleRoute, source: "FALLBACK", reason };
}

// ODsay API key의 Base64 특수문자(+, /, =)가 URLSearchParams로 퍼센트 인코딩되면
// 일부 서버에서 복호화 실패가 발생할 수 있으므로, 파라미터를 직접 조합한다.
function buildOdsayUrl(
  originLng: number,
  originLat: number,
  destinationLng: number,
  destinationLat: number,
  apiKey: string
): string {
  const params = [
    `SX=${originLng}`,
    `SY=${originLat}`,
    `EX=${destinationLng}`,
    `EY=${destinationLat}`,
    `apiKey=${encodeURIComponent(apiKey)}`,
  ].join("&");
  return `${ODSAY_ENDPOINT}?${params}`;
}

function extractOdsayError(json: Record<string, unknown>): string | null {
  // ODsay는 top-level error 또는 result.error 구조를 반환할 수 있다
  const topErr = json["error"];
  const resultErr = (json["result"] as Record<string, unknown> | undefined)?.["error"];
  const err = (topErr && typeof topErr === "object" ? topErr : resultErr) as Record<string, unknown> | undefined;
  if (!err) return null;

  const code = err["code"] != null ? String(err["code"]).trim() : "";
  const msg = (err["msg"] ?? err["message"] ?? err["msg"] ?? "") != null
    ? String(err["msg"] ?? err["message"] ?? "").trim()
    : "";

  if (code) return `ODSAY_API_ERROR_CODE_${code}${msg ? ` (${msg})` : ""}`;
  if (msg) return `ODSAY_API_ERROR: ${msg}`;
  return "UNKNOWN_ODSAY_ERROR";
}

export async function getTransitRoute(input: OdsayRouteRequest): Promise<OdsayRouteResult> {
  const { originLat, originLng, destinationLat, destinationLng } = input;

  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    return makeFallback("ODSAY_API_KEY_MISSING");
  }

  if (
    !isValidCoord(originLat) ||
    !isValidCoord(originLng) ||
    !isValidCoord(destinationLat) ||
    !isValidCoord(destinationLng)
  ) {
    return makeFallback("INVALID_COORDINATES");
  }

  const fetchUrl = buildOdsayUrl(originLng, originLat, destinationLng, destinationLat, apiKey);
  // 서버 로그: 좌표 요약 (apiKey 제외)
  const logUrl = `${ODSAY_ENDPOINT}?SX=${originLng}&SY=${originLat}&EX=${destinationLng}&EY=${destinationLat}&apiKey=***MASKED***`;
  console.log("[ODsay] request:", logUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ODSAY_TIMEOUT_MS);

  try {
    let res: Response;
    try {
      res = await fetch(fetchUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const reason = `ODSAY_HTTP_ERROR_STATUS_${res.status}`;
      console.warn("[ODsay] HTTP error:", res.status);
      return makeFallback(reason);
    }

    let json: Record<string, unknown>;
    try {
      json = await res.json() as Record<string, unknown>;
    } catch {
      return makeFallback("ODSAY_PARSE_ERROR");
    }

    // ODsay 오류 응답 감지 (top-level 또는 result.error)
    const errReason = extractOdsayError(json);
    if (errReason) {
      console.warn("[ODsay] API error:", errReason);
      return makeFallback(errReason);
    }

    const normalized = normalizeOdsayRoute(json);
    if (!normalized) {
      return makeFallback("ODSAY_NO_ROUTE_FOUND");
    }

    // AFC 기반 혼잡도를 sampleRoute에서 가져온다 — ODsay는 혼잡도를 제공하지 않음
    return {
      ok: true,
      transit: { ...normalized, congestion: sampleRoute.congestion },
      source: "ODSAY",
    };
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof Error && e.name === "AbortError") {
      return makeFallback("ODSAY_TIMEOUT");
    }
    const reason = e instanceof Error ? `ODSAY_FETCH_FAILED: ${e.message}` : "ODSAY_FETCH_FAILED";
    console.warn("[ODsay] fetch error:", reason);
    return makeFallback(reason);
  }
}
