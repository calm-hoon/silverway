import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/result/[id]/route";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { AnalysisResult } from "@/types";

vi.mock("@/lib/supabase/analysisLogs", () => ({
  getAnalysisLogById: vi.fn(),
}));

import { getAnalysisLogById } from "@/lib/supabase/analysisLogs";
const mockGetAnalysisLogById = vi.mocked(getAnalysisLogById);

const STORED_ID = "550e8400-e29b-41d4-a716-446655440000";
const STORED_RESULT: AnalysisResult = { ...sampleAnalysis, id: STORED_ID };

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(): Request {
  return new Request("http://localhost/api/result/" + STORED_ID);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAnalysisLogById.mockResolvedValue({ ok: true, result: STORED_RESULT, source: "SUPABASE" });
});

describe("GET /api/result/[id] — 조회 성공", () => {
  it("조회 성공 시 meta.source가 SUPABASE다", async () => {
    const res = await GET(makeRequest(), makeContext(STORED_ID));
    const body = await res.json() as { meta: { source: string; fallback: boolean } };
    expect(body.meta.source).toBe("SUPABASE");
    expect(body.meta.fallback).toBe(false);
  });

  it("조회 성공 시 data.id가 요청한 id와 일치한다", async () => {
    const res = await GET(makeRequest(), makeContext(STORED_ID));
    const body = await res.json() as { data: AnalysisResult };
    expect(body.data.id).toBe(STORED_ID);
  });

  it("조회 성공 시 ok true를 반환한다", async () => {
    const res = await GET(makeRequest(), makeContext(STORED_ID));
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});

describe("GET /api/result/[id] — 조회 실패 fallback", () => {
  beforeEach(() => {
    mockGetAnalysisLogById.mockResolvedValue({ ok: false, reason: "RESULT_NOT_FOUND", fallback: sampleAnalysis, source: "FALLBACK" });
  });

  it("조회 실패 시 meta.source가 FALLBACK이다", async () => {
    const res = await GET(makeRequest(), makeContext("nonexistent-id"));
    const body = await res.json() as { meta: { source: string; fallback: boolean; reason: string } };
    expect(body.meta.source).toBe("FALLBACK");
    expect(body.meta.fallback).toBe(true);
  });

  it("조회 실패 시 meta.reason이 RESULT_NOT_FOUND다", async () => {
    const res = await GET(makeRequest(), makeContext("nonexistent-id"));
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBe("RESULT_NOT_FOUND");
  });

  it("조회 실패 시에도 data가 반환되어 화면이 깨지지 않는다", async () => {
    const res = await GET(makeRequest(), makeContext("nonexistent-id"));
    const body = await res.json() as { ok: boolean; data: AnalysisResult };
    expect(body.ok).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("없는 id 조회 시 500 상태코드가 반환되지 않는다", async () => {
    const res = await GET(makeRequest(), makeContext("nonexistent-id"));
    expect(res.status).not.toBe(500);
  });
});

describe("보안 — service role key 비노출", () => {
  it("응답에 service role key 관련 문자열이 포함되지 않는다", async () => {
    const res = await GET(makeRequest(), makeContext(STORED_ID));
    const text = await res.text();
    expect(text).not.toContain("service_role");
    expect(text).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});

describe("schema 컬럼 매핑 — insert payload 검증", () => {
  it("getAnalysisLogById가 id를 인수로 받아 호출된다", async () => {
    await GET(makeRequest(), makeContext(STORED_ID));
    expect(mockGetAnalysisLogById).toHaveBeenCalledWith(STORED_ID);
  });
});

describe("금지 표현 검사", () => {
  const FORBIDDEN = ["시연용", "Mock", "MOCK", "더미", "사고 확률", "예측 확률", "probability", "실시간 혼잡도", "반드시 반납", "운전 금지"];

  it("응답에 금지 표현이 포함되지 않는다", async () => {
    mockGetAnalysisLogById.mockResolvedValue({ ok: false, reason: "RESULT_NOT_FOUND", fallback: sampleAnalysis, source: "FALLBACK" });
    const res = await GET(makeRequest(), makeContext("any-id"));
    const text = await res.text();
    for (const word of FORBIDDEN) {
      expect(text).not.toContain(word);
    }
  });
});
