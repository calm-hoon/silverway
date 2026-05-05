import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/kakao/search/route";
import type { Place } from "@/types";

const SAMPLE_PLACE: Place = {
  name: "대전광역시청",
  address: "대전 서구 둔산로 100",
  lat: 36.3504,
  lng: 127.3845,
  source: "KAKAO_LOCAL",
};

vi.mock("@/lib/kakao/searchPlace", () => ({
  searchPlace: vi.fn(),
}));

vi.mock("@/lib/fallback/samplePlaces", () => ({
  samplePlaces: [
    { name: "대전광역시청", address: "대전 서구 둔산로 100", lat: 36.3504, lng: 127.3845, source: "SAMPLE" },
  ],
}));

import { searchPlace } from "@/lib/kakao/searchPlace";
const mockSearchPlace = vi.mocked(searchPlace);

function makeGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/kakao/search");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
}

function makePostRequest(body: unknown): Request {
  return new Request("http://localhost/api/kakao/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchPlace.mockResolvedValue({ ok: true, places: [SAMPLE_PLACE], source: "KAKAO_LOCAL" });
});

describe("GET /api/kakao/search — 입력 파싱", () => {
  it("?q= 파라미터로 검색어를 전달하면 searchPlace에 정상 전달된다", async () => {
    await GET(makeGetRequest({ q: "대전광역시청" }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "대전광역시청" }));
  });

  it("?query= 파라미터로 검색어를 전달하면 searchPlace에 정상 전달된다", async () => {
    await GET(makeGetRequest({ query: "충남대학교병원" }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "충남대학교병원" }));
  });

  it("?q= 가 있으면 ?query= 보다 우선한다", async () => {
    await GET(makeGetRequest({ q: "대전역", query: "다른값" }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "대전역" }));
  });

  it("검색어가 비어 있으면 searchPlace를 호출하지 않고 EMPTY_QUERY를 반환한다", async () => {
    const res = await GET(makeGetRequest({}));
    const body = await res.json() as { meta: { reason: string; fallback: boolean } };
    expect(mockSearchPlace).not.toHaveBeenCalled();
    expect(body.meta.reason).toBe("EMPTY_QUERY");
    expect(body.meta.fallback).toBe(true);
  });

  it("Kakao 성공 시 meta.source가 KAKAO_LOCAL이고 fallback false다", async () => {
    const res = await GET(makeGetRequest({ q: "대전광역시청" }));
    const body = await res.json() as { meta: { source: string; fallback: boolean; reason: unknown } };
    expect(body.meta.source).toBe("KAKAO_LOCAL");
    expect(body.meta.fallback).toBe(false);
    expect(body.meta.reason).toBeNull();
  });

  it("Kakao fallback 시 meta.source가 FALLBACK이고 reason이 있다", async () => {
    mockSearchPlace.mockResolvedValue({ ok: false, places: [], source: "FALLBACK", reason: "KAKAO_REST_API_KEY_MISSING" });
    const res = await GET(makeGetRequest({ q: "대전광역시청" }));
    const body = await res.json() as { meta: { source: string; fallback: boolean; reason: string } };
    expect(body.meta.source).toBe("FALLBACK");
    expect(body.meta.fallback).toBe(true);
    expect(body.meta.reason).toBeTruthy();
  });
});

describe("POST /api/kakao/search — 입력 파싱", () => {
  it("body.query로 검색어를 전달하면 searchPlace에 정상 전달된다", async () => {
    await POST(makePostRequest({ query: "대전광역시청", size: 3 }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "대전광역시청" }));
  });

  it("body.q로 검색어를 전달하면 searchPlace에 정상 전달된다", async () => {
    await POST(makePostRequest({ q: "충남대학교병원" }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "충남대학교병원" }));
  });

  it("body.query가 있으면 body.q보다 우선한다", async () => {
    await POST(makePostRequest({ query: "대전역", q: "다른값" }));
    expect(mockSearchPlace).toHaveBeenCalledWith(expect.objectContaining({ query: "대전역" }));
  });

  it("검색어가 비어 있으면 EMPTY_QUERY를 반환한다", async () => {
    const res = await POST(makePostRequest({ query: "" }));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBe("EMPTY_QUERY");
  });

  it("body JSON 파싱 실패 시 KAKAO_API_PARSE_ERROR를 반환한다", async () => {
    const req = new Request("http://localhost/api/kakao/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ broken json }",
    });
    const res = await POST(req);
    const body = await res.json() as { meta: { reason: string; fallback: boolean } };
    expect(body.meta.reason).toBe("KAKAO_API_PARSE_ERROR");
    expect(body.meta.fallback).toBe(true);
  });
});

describe("보안 — API key 비노출", () => {
  it("GET 응답에 API key 관련 문자열이 포함되지 않는다", async () => {
    const res = await GET(makeGetRequest({ q: "대전광역시청" }));
    const text = await res.text();
    expect(text).not.toContain("KakaoAK");
    expect(text).not.toContain("REST_API_KEY");
    expect(text).not.toContain("Authorization");
  });

  it("POST 응답에 API key 관련 문자열이 포함되지 않는다", async () => {
    const res = await POST(makePostRequest({ query: "대전광역시청" }));
    const text = await res.text();
    expect(text).not.toContain("KakaoAK");
    expect(text).not.toContain("REST_API_KEY");
  });
});

describe("Kakao x/y → lng/lat 변환", () => {
  it("Kakao 응답의 x는 lng, y는 lat으로 변환된다", async () => {
    const res = await GET(makeGetRequest({ q: "대전광역시청" }));
    const body = await res.json() as { data: Place[] };
    expect(body.data[0].lng).toBe(127.3845);
    expect(body.data[0].lat).toBe(36.3504);
  });
});

describe("금지 표현 검사", () => {
  const FORBIDDEN = ["시연용", "Mock", "MOCK", "더미", "사고 확률", "예측 확률", "probability", "실시간 혼잡도", "반드시 반납", "운전 금지"];

  it("GET 응답에 금지 표현이 포함되지 않는다", async () => {
    mockSearchPlace.mockResolvedValue({ ok: false, places: [], source: "FALLBACK", reason: "KAKAO_API_EMPTY_RESULT" });
    const res = await GET(makeGetRequest({ q: "대전광역시청" }));
    const text = await res.text();
    for (const word of FORBIDDEN) {
      expect(text).not.toContain(word);
    }
  });
});
