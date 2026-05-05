import { describe, it, expect } from "vitest";
import { createFallbackAnalysis } from "@/lib/fallback/createFallbackAnalysis";
import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { sampleWeather } from "@/lib/fallback/sampleWeather";
import { generateTemplateReport, generateTemplateReportFromAnalysis } from "@/lib/report/generateTemplateReport";
import { mergeFallbackFlags, createDefaultFallbackFlags, hasAnyFallback } from "@/lib/fallback/fallbackFlags";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

// fallback 계약 테스트: 각 fallback helper가 올바른 타입 형태를 반환하고 절대 throw하지 않는다

describe("createFallbackAnalysis 계약", () => {
  it("AnalysisResult 형태를 반환한다", () => {
    const result = createFallbackAnalysis();
    expect(typeof result.id).toBe("string");
    expect(typeof result.createdAt).toBe("string");
    expect(result.drivingRisk).toBeDefined();
    expect(result.transit).toBeDefined();
    expect(result.weather).toBeDefined();
    expect(result.report).toBeDefined();
    expect(result.request).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it("overrides가 없어도 throw하지 않는다", () => {
    expect(() => createFallbackAnalysis()).not.toThrow();
  });

  it("잘못된 overrides 일부에도 throw하지 않는다", () => {
    expect(() => createFallbackAnalysis({ id: "" })).not.toThrow();
    expect(() => createFallbackAnalysis({})).not.toThrow();
  });

  it("결과에 '운전 위험 지수' 표현이 포함된다", () => {
    const result = createFallbackAnalysis();
    expect(JSON.stringify(result)).toContain("운전 위험 지수");
  });

  it("결과에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    const result = createFallbackAnalysis();
    expect(JSON.stringify(result)).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("fallbackFlags가 기본값으로 정의된다", () => {
    const result = createFallbackAnalysis();
    expect(result.fallbackFlags).toBeDefined();
  });
});

describe("sampleRoute fallback 계약", () => {
  it("TransitSummary 형태를 유지한다", () => {
    expect(typeof sampleRoute.available).toBe("boolean");
    expect(sampleRoute.route).toBeDefined();
    expect(Array.isArray(sampleRoute.route!.steps)).toBe(true);
    expect(typeof sampleRoute.route!.totalDurationMin).toBe("number");
  });

  it("혼잡도 정보가 포함된다", () => {
    expect(sampleRoute.congestion).toBeDefined();
    expect(sampleRoute.congestion!.level).toBeDefined();
    expect(sampleRoute.congestion!.label).toBeDefined();
  });

  it("'과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    expect(JSON.stringify(sampleRoute)).toContain("과거 패턴 기반 예측형 혼잡도");
  });
});

describe("sampleWeather fallback 계약", () => {
  it("WeatherRisk 형태를 유지한다", () => {
    expect(typeof sampleWeather.condition).toBe("string");
    expect(typeof sampleWeather.label).toBe("string");
    expect(sampleWeather.riskNote).toBeDefined();
  });

  it("'운전 위험 지수' 표현이 포함된다", () => {
    expect(JSON.stringify(sampleWeather)).toContain("운전 위험 지수");
  });
});

describe("generateTemplateReport fallback 계약", () => {
  it("ReportContent 형태를 반환한다", () => {
    const report = generateTemplateReport({});
    expect(typeof report.title).toBe("string");
    expect(typeof report.familyMessage).toBe("string");
    expect(typeof report.recommendation).toBe("string");
    expect(typeof report.summary).toBe("string");
    expect(report.title.length).toBeGreaterThan(0);
    expect(report.familyMessage.length).toBeGreaterThan(0);
  });

  it("빈 입력에도 throw하지 않는다", () => {
    expect(() => generateTemplateReport({})).not.toThrow();
    expect(() => generateTemplateReport({ drivingRisk: undefined })).not.toThrow();
  });

  it("sampleAnalysis 기반 결과도 throw하지 않는다", () => {
    expect(() => generateTemplateReportFromAnalysis(sampleAnalysis)).not.toThrow();
  });

  it("generatedBy가 TEMPLATE이다", () => {
    const report = generateTemplateReport({});
    expect(report.generatedBy).toBe("TEMPLATE");
  });
});

describe("fallbackFlags 계약", () => {
  it("createDefaultFallbackFlags가 모두 false를 반환한다", () => {
    const flags = createDefaultFallbackFlags();
    expect(Object.values(flags).every((v) => v === false)).toBe(true);
  });

  it("mergeFallbackFlags가 OR 병합된다", () => {
    const merged = mergeFallbackFlags({ route: true }, { weather: false }, { report: true });
    expect(merged.route).toBe(true);
    expect(merged.report).toBe(true);
    expect(merged.weather).toBe(false);
  });

  it("hasAnyFallback이 모두 false면 false를 반환한다", () => {
    expect(hasAnyFallback(createDefaultFallbackFlags())).toBe(false);
  });

  it("hasAnyFallback이 하나라도 true면 true를 반환한다", () => {
    expect(hasAnyFallback({ route: true })).toBe(true);
  });

  it("undefined 입력에도 throw하지 않는다", () => {
    expect(() => mergeFallbackFlags(undefined, undefined)).not.toThrow();
    expect(() => hasAnyFallback(undefined)).not.toThrow();
  });
});
