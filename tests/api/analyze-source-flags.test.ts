import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/analyze/route";
import type { AnalysisResult } from "@/types";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

vi.mock("@/lib/supabase/analysisLogs", () => ({
  saveAnalysisLog: vi.fn(),
}));
vi.mock("@/lib/odsay", () => ({
  getTransitRoute: vi.fn(),
}));
vi.mock("@/lib/weather", () => ({
  getWeatherRisk: vi.fn(),
}));
vi.mock("@/lib/report/generateClaudeReport", () => ({
  generateClaudeReport: vi.fn(),
}));
vi.mock("@/lib/data/accidentAreas", () => ({
  extractSigungu: vi.fn(),
  getAccidentAreaBySigungu: vi.fn(),
}));
vi.mock("@/lib/data/afcStationLoads", () => ({
  getAfcStationLoads: vi.fn(),
  getAfcHourlyAverage: vi.fn(),
}));

import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import { getTransitRoute } from "@/lib/odsay";
import { getWeatherRisk } from "@/lib/weather";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import { extractSigungu, getAccidentAreaBySigungu } from "@/lib/data/accidentAreas";
import { getAfcStationLoads, getAfcHourlyAverage } from "@/lib/data/afcStationLoads";

const mockSaveAnalysisLog = vi.mocked(saveAnalysisLog);
const mockGetTransitRoute = vi.mocked(getTransitRoute);
const mockGetWeatherRisk = vi.mocked(getWeatherRisk);
const mockGenerateClaudeReport = vi.mocked(generateClaudeReport);
const mockExtractSigungu = vi.mocked(extractSigungu);
const mockGetAccidentAreaBySigungu = vi.mocked(getAccidentAreaBySigungu);
const mockGetAfcStationLoads = vi.mocked(getAfcStationLoads);
const mockGetAfcHourlyAverage = vi.mocked(getAfcHourlyAverage);

const SAVED_ID = "550e8400-e29b-41d4-a716-446655440002";

const VALID_BODY = {
  origin: { name: "대덕구청", address: "대전 대덕구 대전로1033번길 20", lat: 36.3467, lng: 127.4155 },
  destination: { name: "대전역", address: "대전 동구 중앙로 215", lat: 36.3326, lng: 127.4344 },
  departureTime: "2026-05-05T10:00:00+09:00",
  ageGroup: "70s",
};

const ACCIDENT_AREA_SUPABASE = {
  ok: true as const,
  source: "SUPABASE" as const,
  data: {
    sido: "대전광역시",
    sigungu: "대덕구",
    dong: null as null,
    accident_count: 510,
    elderly_driver_count: 510,
    fatal_count: 9,
    severe_count: 97,
    risk_score: 100,
  },
};

const AFC_LOADS = [
  { stationName: "시청역", hour: 10, direction: "UP" as const, onboardCount: 450, serviceDayType: "WEEKDAY" as const },
  { stationName: "시청역", hour: 10, direction: "DOWN" as const, onboardCount: 380, serviceDayType: "WEEKDAY" as const },
];

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  mockExtractSigungu.mockReturnValue(null);
  mockGetAccidentAreaBySigungu.mockResolvedValue({ ok: false, reason: "AREA_NOT_FOUND", source: "FALLBACK" });
  mockGetTransitRoute.mockResolvedValue({
    ok: false,
    transit: sampleAnalysis.transit,
    source: "FALLBACK",
    reason: "ODSAY_API_KEY_MISSING",
  });
  mockGetWeatherRisk.mockResolvedValue({ ok: false, weather: sampleAnalysis.weather, source: "FALLBACK", reason: "KMA_KEY_MISSING" });
  mockGenerateClaudeReport.mockResolvedValue({ ok: false, report: sampleAnalysis.report, source: "TEMPLATE", reason: "TEMPLATE_FALLBACK" });
  mockSaveAnalysisLog.mockResolvedValue({ ok: true, id: SAVED_ID, result: { ...sampleAnalysis, id: SAVED_ID } as AnalysisResult });
  mockGetAfcStationLoads.mockResolvedValue({ ok: false, reason: "AFC_DATA_NOT_FOUND", source: "FALLBACK" });
  mockGetAfcHourlyAverage.mockResolvedValue(null);
});

describe("meta.accidentAreaSource — TAAS 데이터 소스 표시", () => {
  it("TAAS DB 매칭 성공 시 accidentAreaSource=SUPABASE, fallbackFlags.analysis=false", async () => {
    mockExtractSigungu.mockReturnValue("대덕구");
    mockGetAccidentAreaBySigungu.mockResolvedValue(ACCIDENT_AREA_SUPABASE);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { accidentAreaSource: string }; fallbackFlags: { analysis: boolean } };

    expect(body.meta.accidentAreaSource).toBe("SUPABASE");
    expect(body.fallbackFlags.analysis).toBe(false);
  });

  it("TAAS DB에 해당 구 없을 시 accidentAreaSource=NOT_FOUND, fallbackFlags.analysis=true", async () => {
    mockExtractSigungu.mockReturnValue("없는구");
    mockGetAccidentAreaBySigungu.mockResolvedValue({ ok: false, reason: "AREA_NOT_FOUND", source: "FALLBACK" });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { accidentAreaSource: string }; fallbackFlags: { analysis: boolean } };

    expect(body.meta.accidentAreaSource).toBe("NOT_FOUND");
    expect(body.fallbackFlags.analysis).toBe(true);
  });

  it("TAAS DB 조회 실패 시 accidentAreaSource=DB_QUERY_FAILED", async () => {
    mockExtractSigungu.mockReturnValue("대덕구");
    mockGetAccidentAreaBySigungu.mockResolvedValue({ ok: false, reason: "DB_QUERY_FAILED", source: "FALLBACK" });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { accidentAreaSource: string } };

    expect(body.meta.accidentAreaSource).toBe("DB_QUERY_FAILED");
  });

  it("sigungu 추출 불가 시 accidentAreaSource=FALLBACK", async () => {
    mockExtractSigungu.mockReturnValue(null);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { accidentAreaSource: string } };

    expect(body.meta.accidentAreaSource).toBe("FALLBACK");
  });

  it("TAAS 매칭 성공 시 dataSources에 'TAAS 사고분석 지역별 데이터' 포함", async () => {
    mockExtractSigungu.mockReturnValue("대덕구");
    mockGetAccidentAreaBySigungu.mockResolvedValue(ACCIDENT_AREA_SUPABASE);
    mockSaveAnalysisLog.mockResolvedValue({ ok: false, reason: "SAVE_FAILED", fallback: sampleAnalysis });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { data: AnalysisResult };

    expect(body.data.dataSources).toContain("TAAS 사고분석 지역별 데이터");
  });
});

describe("meta.afcCongestionSource — AFC 혼잡도 소스 표시", () => {
  it("AFC DB 매칭 성공 시 afcCongestionSource=SUPABASE", async () => {
    // sampleAnalysis.transit에는 stationFrom: '시청역'인 SUBWAY step이 있음
    mockGetAfcStationLoads.mockResolvedValue({ ok: true, loads: AFC_LOADS, source: "SUPABASE" });
    mockGetAfcHourlyAverage.mockResolvedValue(400);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { afcCongestionSource: string } };

    expect(body.meta.afcCongestionSource).toBe("SUPABASE");
  });

  it("AFC 역 매칭 없을 시 afcCongestionSource=NO_STATION_MATCH", async () => {
    mockGetAfcStationLoads.mockResolvedValue({ ok: true, loads: [], source: "SUPABASE" });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { afcCongestionSource: string } };

    expect(body.meta.afcCongestionSource).toBe("NO_STATION_MATCH");
  });

  it("AFC DB 조회 실패 시 afcCongestionSource=DB_QUERY_FAILED", async () => {
    mockGetAfcStationLoads.mockResolvedValue({ ok: false, reason: "DB_QUERY_FAILED", source: "FALLBACK" });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { afcCongestionSource: string } };

    expect(body.meta.afcCongestionSource).toBe("DB_QUERY_FAILED");
  });
});

describe("summary.oneLiner — 운전 위험 지수 점수 반영", () => {
  it("oneLiner에 drivingRisk.score와 동일한 점수가 포함된다", async () => {
    mockSaveAnalysisLog.mockResolvedValue({ ok: false, reason: "SAVE_FAILED", fallback: sampleAnalysis });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { data: AnalysisResult };

    const score = body.data.drivingRisk.score;
    expect(body.data.summary.oneLiner).toContain(`${score}점`);
  });
});
