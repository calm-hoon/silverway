import { describe, it, expect } from "vitest";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { sampleWeather } from "@/lib/fallback/sampleWeather";

describe("sampleAnalysis fallback 데이터", () => {
  it("sampleAnalysis.id가 존재한다", () => {
    expect(sampleAnalysis.id).toBeTruthy();
  });

  it("drivingRisk.score가 0~100 범위다", () => {
    expect(sampleAnalysis.drivingRisk.score).toBeGreaterThanOrEqual(0);
    expect(sampleAnalysis.drivingRisk.score).toBeLessThanOrEqual(100);
  });

  it("drivingRisk.description에 '운전 위험 지수' 표현이 포함된다", () => {
    expect(sampleAnalysis.drivingRisk.description).toContain("운전 위험 지수");
  });

  it("transit.congestion.description에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    expect(sampleAnalysis.transit.congestion?.description).toContain(
      "과거 패턴 기반 예측형 혼잡도"
    );
  });

  it("sampleRoute가 정상 import된다", () => {
    expect(sampleRoute).toBeDefined();
    expect(sampleRoute.available).toBe(true);
  });

  it("sampleWeather가 정상 import된다", () => {
    expect(sampleWeather).toBeDefined();
    expect(typeof sampleWeather.condition).toBe("string");
  });

  it("핵심 표현 필드에 금지 표현이 포함되지 않는다", () => {
    // drivingRisk.description은 서비스 원칙에 따른 필수 면책 문구이므로 제외
    const textFields = [
      sampleAnalysis.summary.oneLiner,
      sampleAnalysis.report.summary,
      sampleAnalysis.report.recommendation,
      sampleAnalysis.report.familyMessage,
      ...sampleAnalysis.drivingRisk.factors.map((f) => f.description),
    ].join(" ");

    expect(textFields).not.toContain("사고 확률");
    expect(textFields).not.toContain("예측 확률");
    expect(textFields).not.toContain("probability");
  });
});
