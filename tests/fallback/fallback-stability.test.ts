import { describe, it, expect } from "vitest";
import { createFallbackAnalysis } from "@/lib/fallback/createFallbackAnalysis";
import { mergeFallbackFlags, hasAnyFallback, createDefaultFallbackFlags } from "@/lib/fallback/fallbackFlags";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "실시간 혼잡도", "운전 금지", "반드시 반납"];

describe("createFallbackAnalysis", () => {
  it("AnalysisResult를 반환한다", () => {
    const result = createFallbackAnalysis();
    expect(result).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.drivingRisk).toBeDefined();
    expect(result.transit).toBeDefined();
    expect(result.weather).toBeDefined();
    expect(result.report).toBeDefined();
  });

  it("원본 sampleAnalysis를 mutate하지 않는다", () => {
    const originalId = sampleAnalysis.id;
    const originalFactors = sampleAnalysis.drivingRisk.factors.length;
    createFallbackAnalysis({ id: "override-id" });
    expect(sampleAnalysis.id).toBe(originalId);
    expect(sampleAnalysis.drivingRisk.factors.length).toBe(originalFactors);
  });

  it("overrides가 반영된다", () => {
    const result = createFallbackAnalysis({ id: "custom-id" });
    expect(result.id).toBe("custom-id");
  });

  it("fallbackFlags가 기본값으로 포함된다", () => {
    const result = createFallbackAnalysis();
    expect(result.fallbackFlags).toBeDefined();
  });

  it('결과 문자열에 "운전 위험 지수" 표현이 포함된다', () => {
    const result = createFallbackAnalysis();
    const text = JSON.stringify(result);
    expect(text).toContain("운전 위험 지수");
  });

  it('"과거 패턴 기반 예측형 혼잡도" 표현이 포함된다', () => {
    const result = createFallbackAnalysis();
    const text = JSON.stringify(result);
    expect(text).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("금지 표현이 포함되지 않는다", () => {
    const result = createFallbackAnalysis();
    const text = JSON.stringify(result);
    for (const word of FORBIDDEN) {
      expect(text.toLowerCase(), `금지 표현 "${word}" 발견`).not.toContain(word.toLowerCase());
    }
  });
});

describe("mergeFallbackFlags", () => {
  it("여러 플래그가 OR 병합된다", () => {
    const merged = mergeFallbackFlags(
      { route: true },
      { weather: false },
      { report: true }
    );
    expect(merged.route).toBe(true);
    expect(merged.weather).toBe(false);
    expect(merged.report).toBe(true);
  });

  it("undefined 입력을 무시한다", () => {
    const merged = mergeFallbackFlags(undefined, { route: true }, undefined);
    expect(merged.route).toBe(true);
  });

  it("빈 입력이면 기본값 false를 반환한다", () => {
    const merged = mergeFallbackFlags();
    expect(Object.values(merged).every((v) => v === false)).toBe(true);
  });
});

describe("hasAnyFallback", () => {
  it("모든 false면 false를 반환한다", () => {
    expect(hasAnyFallback(createDefaultFallbackFlags())).toBe(false);
  });

  it("하나라도 true면 true를 반환한다", () => {
    expect(hasAnyFallback({ route: true })).toBe(true);
    expect(hasAnyFallback({ weather: false, report: true })).toBe(true);
  });

  it("undefined이면 false를 반환한다", () => {
    expect(hasAnyFallback(undefined)).toBe(false);
  });
});
