import type { AnalysisResult } from "@/types";
import { sampleAnalysis } from "./sampleAnalysis";
import { createDefaultFallbackFlags } from "./fallbackFlags";

export function createFallbackAnalysis(overrides?: Partial<AnalysisResult>): AnalysisResult {
  // sampleAnalysis를 직접 mutate하지 않고 deep spread로 복제한다
  const base: AnalysisResult = {
    ...sampleAnalysis,
    request: { ...sampleAnalysis.request },
    drivingRisk: {
      ...sampleAnalysis.drivingRisk,
      factors: sampleAnalysis.drivingRisk.factors.map((f) => ({ ...f })),
    },
    transit: {
      ...sampleAnalysis.transit,
      ...(sampleAnalysis.transit.route
        ? { route: { ...sampleAnalysis.transit.route } }
        : {}),
      ...(sampleAnalysis.transit.congestion
        ? { congestion: { ...sampleAnalysis.transit.congestion } }
        : {}),
    },
    weather: { ...sampleAnalysis.weather },
    report: { ...sampleAnalysis.report },
    summary: { ...sampleAnalysis.summary },
    dataSources: [...sampleAnalysis.dataSources],
    fallbackFlags: createDefaultFallbackFlags(),
    createdAt: new Date().toISOString(),
    id: `fallback-${Date.now()}`,
  };

  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    fallbackFlags: {
      ...base.fallbackFlags,
      ...overrides.fallbackFlags,
    },
  };
}
