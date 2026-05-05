// SERVER ONLY — KAKAO_REST_API_KEY는 서버에서만 사용. 클라이언트 컴포넌트에서 import 금지.
import type { Place } from "@/types";
import { samplePlaces } from "@/lib/fallback/samplePlaces";
import { normalizeKakaoPlaces } from "./normalizeKakaoPlace";
import type { KakaoPlaceSearchRequest, KakaoPlaceSearchResult } from "./types";

const KAKAO_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const FETCH_TIMEOUT_MS = 5_000;

function fallbackFromSample(query: string, reason: string): KakaoPlaceSearchResult {
  const q = query.toLowerCase().replace(/\s/g, "");
  const matched = samplePlaces.filter((p) =>
    p.name.toLowerCase().replace(/\s/g, "").includes(q) ||
    p.address.toLowerCase().replace(/\s/g, "").includes(q)
  );
  return {
    ok: false,
    places: matched.length > 0 ? matched : samplePlaces.slice(0, 3),
    source: "FALLBACK",
    reason,
  };
}

function buildQuery(input: KakaoPlaceSearchRequest): string {
  const q = input.query.trim();
  // 검색어에 "대전"이 없으면 "대전 " 접두어를 붙여 지역 검색 정확도를 높인다
  if (q && !q.includes("대전")) {
    return `대전 ${q}`;
  }
  return q;
}

export async function searchPlace(input: KakaoPlaceSearchRequest): Promise<KakaoPlaceSearchResult> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return fallbackFromSample(input.query, "KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  }

  const query = buildQuery(input);
  if (!query || query.trim().length < 2) {
    return fallbackFromSample(input.query, "검색어가 너무 짧습니다.");
  }

  const params = new URLSearchParams({
    query,
    size: String(Math.min(input.size ?? 5, 15)),
    ...(input.page ? { page: String(input.page) } : {}),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${KAKAO_SEARCH_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return fallbackFromSample(input.query, `Kakao API HTTP 오류: ${res.status}`);
    }

    const raw: unknown = await res.json();

    // Kakao가 200이지만 에러 body를 반환하는 경우 감지
    if (raw && typeof raw === "object" && "errorType" in raw) {
      const errObj = raw as Record<string, unknown>;
      return fallbackFromSample(input.query, `Kakao API 오류: ${String(errObj["errorType"])} - ${String(errObj["message"] ?? "")}`);
    }

    const places: Place[] = normalizeKakaoPlaces(raw);

    if (places.length === 0) {
      return fallbackFromSample(input.query, "검색 결과가 없습니다.");
    }

    return { ok: true, places, source: "KAKAO_LOCAL" };
  } catch (err: unknown) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Kakao API 타임아웃"
          : err.message
        : "Kakao API 호출 오류";
    return fallbackFromSample(input.query, reason);
  } finally {
    clearTimeout(timer);
  }
}
