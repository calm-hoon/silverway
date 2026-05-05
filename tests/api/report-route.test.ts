import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/report/route";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { ReportContent } from "@/types";

vi.mock("@/lib/report/generateClaudeReport", () => ({
  generateClaudeReport: vi.fn(),
}));

import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
const mockGenerateClaudeReport = vi.mocked(generateClaudeReport);

const SAMPLE_REPORT: ReportContent = sampleAnalysis.report;

function makeRequest(body?: unknown): Request {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? { analysis: sampleAnalysis }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGenerateClaudeReport.mockResolvedValue({ ok: true, report: SAMPLE_REPORT, source: "CLAUDE" });
});

describe("POST /api/report — Claude 성공", () => {
  it("성공 시 ok: true를 반환한다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("성공 시 meta.source가 CLAUDE다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { meta: { source: string; fallback: boolean } };
    expect(body.meta.source).toBe("CLAUDE");
    expect(body.meta.fallback).toBe(false);
  });

  it("성공 시 meta.reason이 null이다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { meta: { reason: null } };
    expect(body.meta.reason).toBeNull();
  });

  it("성공 시 data에 title이 포함된다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { data: ReportContent };
    expect(body.data.title).toBeTruthy();
  });
});

describe("POST /api/report — TEMPLATE fallback", () => {
  beforeEach(() => {
    mockGenerateClaudeReport.mockResolvedValue({
      ok: false,
      report: SAMPLE_REPORT,
      source: "TEMPLATE",
      reason: "ANTHROPIC_API_KEY_MISSING",
    });
  });

  it("fallback 시 meta.source가 TEMPLATE이다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { meta: { source: string; fallback: boolean } };
    expect(body.meta.source).toBe("TEMPLATE");
    expect(body.meta.fallback).toBe(true);
  });

  it("fallback 시 meta.reason이 ANTHROPIC_API_KEY_MISSING이다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { meta: { reason: string } };
    expect(body.meta.reason).toBe("ANTHROPIC_API_KEY_MISSING");
  });

  it("fallback 시에도 ok: true이고 data가 반환된다", async () => {
    const res = await POST(makeRequest());
    const body = await res.json() as { ok: boolean; data: ReportContent };
    expect(body.ok).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("fallback 시 500 상태코드가 반환되지 않는다", async () => {
    const res = await POST(makeRequest());
    expect(res.status).not.toBe(500);
  });
});

describe("POST /api/report — 각 reason 코드 전달", () => {
  const REASON_CASES = [
    "ANTHROPIC_API_KEY_MISSING",
    "CLAUDE_TIMEOUT",
    "CLAUDE_EMPTY_RESPONSE",
    "CLAUDE_PARSE_ERROR",
    "CLAUDE_SAFETY_FAILURE",
    "CLAUDE_HTTP_ERROR_STATUS_401",
    "CLAUDE_HTTP_ERROR_STATUS_429",
    "CLAUDE_HTTP_ERROR_STATUS_500",
    "CLAUDE_FETCH_FAILED",
  ] as const;

  for (const reason of REASON_CASES) {
    it(`reason ${reason}이 meta.reason으로 전달된다`, async () => {
      mockGenerateClaudeReport.mockResolvedValue({ ok: false, report: SAMPLE_REPORT, source: "TEMPLATE", reason });
      const res = await POST(makeRequest());
      const body = await res.json() as { meta: { reason: string } };
      expect(body.meta.reason).toBe(reason);
    });
  }
});

describe("보안 — API key 비노출", () => {
  it("응답에 ANTHROPIC_API_KEY 관련 문자열이 포함되지 않는다", async () => {
    const res = await POST(makeRequest());
    const text = await res.text();
    expect(text).not.toContain("ANTHROPIC_API_KEY");
    expect(text).not.toContain("sk-ant-");
  });
});

describe("금지 표현 검사", () => {
  const FORBIDDEN = [
    "시연용", "Mock", "MOCK", "더미",
    "사고 확률", "예측 확률", "probability",
    "실시간 혼잡도", "반드시 반납", "운전 금지",
  ];

  it("fallback 응답에 금지 표현이 포함되지 않는다", async () => {
    mockGenerateClaudeReport.mockResolvedValue({
      ok: false,
      report: SAMPLE_REPORT,
      source: "TEMPLATE",
      reason: "ANTHROPIC_API_KEY_MISSING",
    });
    const res = await POST(makeRequest());
    const text = await res.text();
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });
});
