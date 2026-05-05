// SERVER ONLY — ODSAY_API_KEY를 읽습니다. 클라이언트 컴포넌트에서 import 금지.
import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { normalizeOdsayRoute } from "./normalizeOdsayRoute";
import type { OdsayRouteRequest, OdsayRouteResult } from "./types";

const ODSAY_TIMEOUT_MS = 5000;

function isValidCoord(v: unknown): boolean {
  return typeof v === "number" && isFinite(v);
}

function makeFallback(reason: string): OdsayRouteResult {
  return { ok: false, transit: sampleRoute, source: "FALLBACK", reason };
}

export async function getTransitRoute(input: OdsayRouteRequest): Promise<OdsayRouteResult> {
  const { originLat, originLng, destinationLat, destinationLng } = input;

  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    return makeFallback("ODSAY_API_KEY missing");
  }

  if (
    !isValidCoord(originLat) ||
    !isValidCoord(originLng) ||
    !isValidCoord(destinationLat) ||
    !isValidCoord(destinationLng)
  ) {
    return makeFallback("invalid coordinates");
  }

  const url = new URL("https://api.odsay.com/v1/api/searchPubTransPathT");
  url.searchParams.set("SX", String(originLng));
  url.searchParams.set("SY", String(originLat));
  url.searchParams.set("EX", String(destinationLng));
  url.searchParams.set("EY", String(destinationLat));
  url.searchParams.set("apiKey", apiKey);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ODSAY_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url.toString(), { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return makeFallback(`HTTP ${res.status}`);
    }

    const json = await res.json() as Record<string, unknown>;

    if (json["error"]) {
      const err = json["error"] as Record<string, unknown>;
      const code = String(err["code"] ?? "");
      const msg = String(err["msg"] ?? err["message"] ?? "");
      return makeFallback(`ODsay error code=${code} msg=${msg}`);
    }

    const normalized = normalizeOdsayRoute(json);
    if (!normalized) {
      return makeFallback("no route found");
    }

    // AFC 기반 혼잡도를 sampleRoute에서 가져온다 — ODsay는 혼잡도를 제공하지 않음
    return {
      ok: true,
      transit: { ...normalized, congestion: sampleRoute.congestion },
      source: "ODSAY",
    };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return makeFallback(reason);
  }
}
