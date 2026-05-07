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
  let raw = topErr ?? resultErr;
  if (raw === undefined || raw === null) return null;

  // ODsay가 배열로 감싼 경우: {"error": [{...}]} → 첫 요소를 사용
  if (Array.isArray(raw)) raw = raw[0];
  if (!raw || typeof raw !== "object") return null;

  const err = raw as Record<string, unknown>;

  // 여러 필드명 패턴 지원: code/errorCode, msg/message/errorMessage/description
  const code = String(err["code"] ?? err["errorCode"] ?? err["error_code"] ?? "").trim();
  const msg = String(err["msg"] ?? err["message"] ?? err["errorMessage"] ?? err["description"] ?? "").trim();

  if (code) return `ODSAY_API_ERROR_CODE_${code}${msg ? ` (${msg})` : ""}`;
  if (msg) return `ODSAY_API_ERROR: ${msg}`;
  // err 객체 자체가 있지만 인식 가능한 필드 없음 — raw 구조를 reason에 포함
  const rawKeys = Object.keys(err).join(",");
  return rawKeys ? `UNKNOWN_ODSAY_ERROR (fields: ${rawKeys})` : "UNKNOWN_ODSAY_ERROR";
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
      res = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          "Referer": "https://silverway.codegenie.co.kr/",
          "User-Agent": "Mozilla/5.0",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      let errBody = "";
      try { errBody = (await res.text()).slice(0, 200); } catch { /* ignore */ }
      const reason = `ODSAY_HTTP_ERROR_STATUS_${res.status}`;
      console.warn("[ODsay] HTTP error:", res.status, errBody ? `| ${errBody}` : "");
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
