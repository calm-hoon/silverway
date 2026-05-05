import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/analyze/route";
import type { AnalysisResult } from "@/types";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

// 외부 의존성 전체 mock
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

import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import { getTransitRoute } from "@/lib/odsay";
import { getWeatherRisk } from "@/lib/weather";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";

const mockSaveAnalysisLog = vi.mocked(saveAnalysisLog);
const mockGetTransitRoute = vi.mocked(getTransitRoute);
const mockGetWeatherRisk = vi.mocked(getWeatherRisk);
const mockGenerateClaudeReport = vi.mocked(generateClaudeReport);

const SAVED_ID = "550e8400-e29b-41d4-a716-446655440000";

const VALID_BODY = {
  origin: { name: "대전광역시청", address: "대전 서구 둔산로 100", lat: 36.3504, lng: 127.3845 },
  destination: { name: "충남대학교병원", address: "대전 중구 문화로 282", lat: 36.3166, lng: 127.4156 },
  departureTime: "2026-05-05T10:00:00+09:00",
  ageGroup: "70s",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  mockGetTransitRoute.mockResolvedValue({ ok: false, transit: sampleAnalysis.transit, source: "FALLBACK", reason: "ODSAY_API_KEY_MISSING" });
  mockGetWeatherRisk.mockResolvedValue({ ok: false, weather: sampleAnalysis.weather, source: "FALLBACK", reason: "KMA_KEY_MISSING" });
  mockGenerateClaudeReport.mockResolvedValue({ ok: false, report: sampleAnalysis.report, source: "TEMPLATE" });
  mockSaveAnalysisLog.mockResolvedValue({ ok: true, id: SAVED_ID, result: { ...sampleAnalysis, id: SAVED_ID } as AnalysisResult });
});

describe("POST /api/analyze — 저장 성공", () => {
  it("저장 성공 시 persistence.saved가 true다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { persistence: { saved: boolean } };
    expect(body.persistence.saved).toBe(true);
  });

  it("저장 성공 시 resultId가 실제 DB id(UUID)다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { resultId: string };
    expect(body.resultId).toBe(SAVED_ID);
    // mock-* 형식이 아님
    expect(body.resultId).not.toMatch(/^mock-/);
    expect(body.resultId).not.toBe("test");
  });

  it("저장 성공 시 mode가 ANALYSIS_WITH_STORAGE다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { mode: string };
    expect(body.mode).toBe("ANALYSIS_WITH_STORAGE");
    expect(body.mode).not.toContain("MOCK");
  });

  it("저장 성공 시 meta.storageSource가 SUPABASE다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { meta: { storageSource: string } };
    expect(body.meta.storageSource).toBe("SUPABASE");
  });

  it("저장 성공 시 AnalysisResult의 origin/destination이 포함된다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { data: AnalysisResult };
    expect(body.data.request.origin.name).toBeTruthy();
    expect(body.data.request.destination.name).toBeTruthy();
  });
});

describe("POST /api/analyze — 저장 실패 fallback", () => {
  beforeEach(() => {
    mockSaveAnalysisLog.mockResolvedValue({ ok: false, reason: "SAVE_FAILED", fallback: sampleAnalysis });
  });

  it("저장 실패 시 persistence.saved가 false다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { persistence: { saved: boolean; reason: string } };
    expect(body.persistence.saved).toBe(false);
  });

  it("저장 실패 시 persistence.reason이 SAVE_FAILED다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { persistence: { reason: string } };
    expect(body.persistence.reason).toBe("SAVE_FAILED");
  });

  it("저장 실패 시에도 data는 반환되어 화면이 깨지지 않는다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { data: AnalysisResult; ok: boolean };
    expect(body.ok).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("저장 실패 시 mode가 ANALYSIS_FALLBACK이다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json() as { mode: string };
    expect(body.mode).toBe("ANALYSIS_FALLBACK");
  });
});

describe("보안 — service role key 비노출", () => {
  it("저장 성공 응답에 service role key가 포함되지 않는다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const text = await res.text();
    expect(text).not.toContain("service_role");
    expect(text).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});

describe("금지 표현 검사", () => {
  const FORBIDDEN = ["시연용", "Mock", "MOCK", "더미", "사고 확률", "예측 확률", "probability", "실시간 혼잡도", "반드시 반납", "운전 금지"];

  it("분석 응답에 금지 표현이 포함되지 않는다", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const text = await res.text();
    for (const word of FORBIDDEN) {
      expect(text).not.toContain(word);
    }
  });
});
