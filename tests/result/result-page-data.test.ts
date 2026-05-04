import { describe, it, expect } from "vitest";
import { createMockResultById } from "@/lib/fallback/createMockResultById";

// 금지 표현 — drivingRisk.description(필수 면책 문구)은 별도 처리
const FORBIDDEN = [
  "사고 확률",
  "예측 확률",
  "probability",
  "실시간 혼잡도",
  "운전 금지",
  "반드시 반납",
];

function collectCheckableText(analysis: ReturnType<typeof createMockResultById>): string {
  // drivingRisk.description은 "실제 사고 확률이 아니라…"로 시작하는 필수 면책 문구이므로 제외
  return [
    analysis.summary.oneLiner,
    analysis.report.title,
    analysis.report.summary,
    analysis.report.recommendation,
    analysis.report.familyMessage,
    analysis.transit.congestion?.description ?? "",
    ...analysis.drivingRisk.factors.map((f) => f.description),
    ...(analysis.report.cautions ?? []),
  ].join(" ");
}

describe("createMockResultById", () => {
  it("returns AnalysisResult with the given id", () => {
    const result = createMockResultById("test-123");
    expect(result.id).toBe("test-123");
    expect(result.drivingRisk).toBeDefined();
    expect(result.transit).toBeDefined();
    expect(result.weather).toBeDefined();
    expect(result.report).toBeDefined();
  });

  it("does not throw for empty string id", () => {
    expect(() => createMockResultById("")).not.toThrow();
  });

  it("does not throw for undefined id", () => {
    expect(() => createMockResultById(undefined)).not.toThrow();
  });

  it("does not throw for unusual ids", () => {
    expect(() => createMockResultById("!@#$%^&*()")).not.toThrow();
    expect(() => createMockResultById("a".repeat(500))).not.toThrow();
    expect(() => createMockResultById("   ")).not.toThrow();
  });

  it("falls back to sampleAnalysis id when given empty id", () => {
    const result = createMockResultById("");
    expect(result.id).toBeTruthy();
    expect(result.id.length).toBeGreaterThan(0);
  });

  it("drivingRisk description contains '운전 위험 지수'", () => {
    const result = createMockResultById("abc");
    expect(result.drivingRisk.description).toContain("운전 위험 지수");
  });

  it("congestion description contains '과거 패턴 기반 예측형 혼잡도'", () => {
    const result = createMockResultById("abc");
    expect(result.transit.congestion?.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("no forbidden expressions in key text fields", () => {
    const result = createMockResultById("check-forbidden");
    const text = collectCheckableText(result);
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });

  it("sets all fallback flags to true", () => {
    const result = createMockResultById("any-id");
    expect(result.fallbackFlags?.analysis).toBe(true);
    expect(result.fallbackFlags?.route).toBe(true);
    expect(result.fallbackFlags?.weather).toBe(true);
    expect(result.fallbackFlags?.report).toBe(true);
  });

  it("report familyMessage does not contain license surrender coercion", () => {
    const result = createMockResultById("coercion-check");
    const msg = result.report.familyMessage;
    expect(msg).not.toContain("반납하세요");
    expect(msg).not.toContain("운전하지 마");
    expect(msg).not.toContain("운전 금지");
  });
});
