import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/route/route";

vi.mock("@/lib/odsay", () => ({
  getTransitRoute: vi.fn(),
}));

vi.mock("@/lib/fallback/sampleRoute", () => ({
  sampleRoute: {
    available: true,
    route: {
      totalDurationMin: 26,
      transferCount: 0,
      steps: [{ mode: "WALK", durationMin: 5, description: "도보 이동 (5분)" }],
      source: "fallback",
    },
    congestion: {
      level: "MEDIUM",
      label: "보통",
      description: "출발 시간대 기준 과거 패턴 기반 예측형 혼잡도입니다.",
      basis: "HISTORICAL_PATTERN",
    },
  },
}));

import { getTransitRoute } from "@/lib/odsay";
const mockGetTransitRoute = vi.mocked(getTransitRoute);

const ODSAY_SUCCESS_TRANSIT = {
  available: true,
  route: {
    totalDurationMin: 30,
    transferCount: 1,
    steps: [
      { mode: "WALK" as const, durationMin: 5, description: "도보 이동 (5분)" },
      { mode: "SUBWAY" as const, durationMin: 20, description: "시청역 승차 → 충남대역 하차 (대전 1호선)", stationFrom: "시청", stationTo: "충남대", lineName: "대전 1호선" },
      { mode: "WALK" as const, durationMin: 5, description: "도보 이동 (5분)" },
    ],
    source: "ODsay API",
  },
  congestion: {
    level: "MEDIUM" as const,
    label: "보통",
    description: "출발 시간대 기준 과거 패턴 기반 예측형 혼잡도입니다.",
    basis: "HISTORICAL_PATTERN" as const,
  },
};

function makePostRequest(body: unknown): Request {
  return new Request("http://localhost/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  origin: { name: "대전광역시청", lat: 36.3504, lng: 127.3845 },
  destination: { name: "충남대학교병원", lat: 36.3166, lng: 127.4156 },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTransitRoute.mockResolvedValue({ ok: true, transit: ODSAY_SUCCESS_TRANSIT, source: "ODSAY" });
});

describe("GET /api/route", () => {
  it("sample 응답을 반환한다", async () => {
    const res = await GET();
    const body = await res.json() as { mode: string; ok: boolean };
    expect(body.ok).toBe(true);
    expect(body.mode).toBe("SAMPLE");
  });
});

describe("POST /api/route — 좌표 매핑", () => {
  it("origin.lng → SX, origin.lat → SY, destination.lng → EX, destination.lat → EY 순서로 전달된다", async () => {
    await POST(makePostRequest(VALID_BODY));
    expect(mockGetTransitRoute).toHaveBeenCalledWith({
      originLat: 36.3504,
      originLng: 127.3845,
      destinationLat: 36.3166,
      destinationLng: 127.4156,
    });
  });

  it("lat/lng가 반대로 전달되지 않는다", async () => {
    await POST(makePostRequest(VALID_BODY));
    const call = mockGetTransitRoute.mock.calls[0][0];
    // 한국 위도(lat)는 33~38, 경도(lng)는 124~132 범위
    expect(call.originLat).toBeGreaterThan(33);
    expect(call.originLat).toBeLessThan(40);
    expect(call.originLng).toBeGreaterThan(120);
    expect(call.originLng).toBeLessThan(135);
  });
});

describe("POST /api/route — ODsay 성공", () => {
  it("ODsay 성공 시 meta.fallback false, meta.source ODSAY다", async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { source: string; fallback: boolean; reason: unknown } };
    expect(body.meta.fallback).toBe(false);
    expect(body.meta.source).toBe("ODSAY");
    expect(body.meta.reason).toBeNull();
  });

  it("ODsay 성공 시 data가 실제 경로를 포함한다", async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { data: typeof ODSAY_SUCCESS_TRANSIT };
    expect(body.data.route?.totalDurationMin).toBe(30);
  });
});

describe("POST /api/route — fallback", () => {
  it("ODSAY_API_KEY 없으면 FALLBACK reason을 반환한다", async () => {
    mockGetTransitRoute.mockResolvedValue({ ok: false, transit: ODSAY_SUCCESS_TRANSIT, source: "FALLBACK", reason: "ODSAY_API_KEY_MISSING" });
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { reason: string; fallback: boolean } };
    expect(body.meta.fallback).toBe(true);
    expect(body.meta.reason).toBe("ODSAY_API_KEY_MISSING");
  });

  it("HTTP 401 응답이면 ODSAY_HTTP_ERROR_STATUS_401 reason이 반환된다", async () => {
    mockGetTransitRoute.mockResolvedValue({ ok: false, transit: ODSAY_SUCCESS_TRANSIT, source: "FALLBACK", reason: "ODSAY_HTTP_ERROR_STATUS_401" });
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toContain("401");
  });

  it("HTTP 403 응답이면 ODSAY_HTTP_ERROR_STATUS_403 reason이 반환된다", async () => {
    mockGetTransitRoute.mockResolvedValue({ ok: false, transit: ODSAY_SUCCESS_TRANSIT, source: "FALLBACK", reason: "ODSAY_HTTP_ERROR_STATUS_403" });
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toContain("403");
  });

  it("timeout 시 ODSAY_TIMEOUT reason이 반환된다", async () => {
    mockGetTransitRoute.mockResolvedValue({ ok: false, transit: ODSAY_SUCCESS_TRANSIT, source: "FALLBACK", reason: "ODSAY_TIMEOUT" });
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBe("ODSAY_TIMEOUT");
  });

  it("ODsay error code/msg가 비어 있어도 빈 문자열 reason이 되지 않는다", async () => {
    mockGetTransitRoute.mockResolvedValue({ ok: false, transit: ODSAY_SUCCESS_TRANSIT, source: "FALLBACK", reason: "UNKNOWN_ODSAY_ERROR" });
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBeTruthy();
    expect(body.meta.reason).not.toBe("ODsay error code= msg=");
  });

  it("좌표가 없으면 getTransitRoute를 호출하지 않고 INVALID_COORDINATES를 반환한다", async () => {
    const res = await POST(makePostRequest({ origin: {}, destination: {} }));
    const body = await res.json() as { meta: { reason: string } };
    expect(mockGetTransitRoute).not.toHaveBeenCalled();
    expect(body.meta.reason).toBe("INVALID_COORDINATES");
  });

  it("body 파싱 실패 시 ODSAY_API_PARSE_ERROR를 반환한다", async () => {
    const req = new Request("http://localhost/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ broken }",
    });
    const res = await POST(req);
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBe("ODSAY_API_PARSE_ERROR");
  });
});

describe("보안 — API key 비노출", () => {
  it("응답에 apiKey 관련 문자열이 포함되지 않는다", async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const text = await res.text();
    expect(text).not.toContain("apiKey=");
    expect(text).not.toContain("ODSAY_API_KEY");
  });
});

describe("혼잡도 표현 원칙", () => {
  it("혼잡도 설명에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json() as { data: typeof ODSAY_SUCCESS_TRANSIT };
    expect(body.data.congestion?.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("응답에 '실시간 혼잡도' 표현이 포함되지 않는다", async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const text = await res.text();
    expect(text).not.toContain("실시간 혼잡도");
  });
});
