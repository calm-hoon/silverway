import { describe, it, expect } from "vitest";
import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";

describe("createMockAnalysisResult", () => {
  it("정상 입력에 대해 ok: true 형태의 분석 결과를 반환한다", () => {
    const result = createMockAnalysisResult({
      origin: { name: "대전광역시청", address: "대전 서구 둔산로 100", lat: 36.3504, lng: 127.3845 },
      destination: { name: "충남대학교병원", address: "대전 중구 문화로 282", lat: 36.3166, lng: 127.4156 },
      departureTime: "2026-05-04T09:00:00+09:00",
      ageGroup: "70s",
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("MOCK");
    expect(result.data).toBeDefined();
  });

  it("입력값이 비어 있어도 throw하지 않는다", () => {
    expect(() => createMockAnalysisResult()).not.toThrow();
    expect(() => createMockAnalysisResult({})).not.toThrow();
  });

  it("data.drivingRisk.description에 '운전 위험 지수' 표현이 포함된다", () => {
    const result = createMockAnalysisResult();
    expect(result.data.drivingRisk.description).toContain("운전 위험 지수");
  });

  it("data.transit.congestion.description에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    const result = createMockAnalysisResult();
    expect(result.data.transit.congestion?.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("report.familyMessage가 비어 있지 않다", () => {
    const result = createMockAnalysisResult();
    expect(result.data.report.familyMessage.trim().length).toBeGreaterThan(0);
  });

  it("fallbackFlags가 존재한다", () => {
    const result = createMockAnalysisResult();
    expect(result.fallbackFlags).toBeDefined();
    expect(result.data.fallbackFlags).toBeDefined();
  });

  it("핵심 표현 필드에 금지 표현이 포함되지 않는다", () => {
    // drivingRisk.description은 서비스 원칙에 따른 필수 면책 문구이므로 제외
    const result = createMockAnalysisResult({ ageGroup: "80s" });
    const textFields = [
      result.data.summary.oneLiner,
      result.data.report.summary,
      result.data.report.recommendation,
      result.data.report.familyMessage,
      result.data.report.body ?? "",
      result.message,
      ...result.data.drivingRisk.factors.map((f) => f.description),
    ].join(" ");

    expect(textFields).not.toContain("사고 확률");
    expect(textFields).not.toContain("예측 확률");
    expect(textFields).not.toContain("probability");
    expect(textFields).not.toContain("실시간 혼잡도");
    expect(textFields).not.toContain("운전 금지");
    expect(textFields).not.toContain("반드시 반납");
  });
});
