// Mock 분석 결과 생성 — 실제 외부 API/Supabase 없이 동작하는 순수 함수
import type { AnalysisRequest, AnalysisResult, FallbackFlags } from "@/types";
import { sampleAnalysis } from "./sampleAnalysis";
import { sampleRoute } from "./sampleRoute";
import { sampleWeather } from "./sampleWeather";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";
import { generateTemplateReport } from "@/lib/report/generateTemplateReport";

export type MockAnalysisResponse = {
  ok: true;
  mode: "MOCK";
  data: AnalysisResult;
  message: string;
  fallbackFlags: FallbackFlags;
};

export function createMockAnalysisResult(partial?: Partial<AnalysisRequest>): MockAnalysisResponse {
  const fallbackFlags: FallbackFlags = { analysis: true, route: true, weather: true, report: true };

  const request: AnalysisRequest = {
    origin: partial?.origin ?? sampleAnalysis.request.origin,
    destination: partial?.destination ?? sampleAnalysis.request.destination,
    departureTime: partial?.departureTime ?? sampleAnalysis.request.departureTime,
    ageGroup: partial?.ageGroup ?? sampleAnalysis.request.ageGroup,
  };

  const drivingRisk = calculateDrivingRisk({
    ageGroup: request.ageGroup,
    departureTime: request.departureTime,
    accidentArea: { riskScore: 55 },
  });

  const transit = sampleRoute;
  const weather = sampleWeather;

  const report = generateTemplateReport({
    originName: request.origin.name,
    destinationName: request.destination.name,
    drivingRisk,
    transit,
    weather,
    departureTime: request.departureTime,
    ageGroup: request.ageGroup,
  });

  const data: AnalysisResult = {
    id: `mock-${Date.now()}`,
    createdAt: new Date().toISOString(),
    request,
    summary: {
      recommendDriving: drivingRisk.level === "LOW",
      oneLiner: report.summary,
    },
    drivingRisk,
    transit,
    weather,
    report,
    dataSources: [
      "공공데이터 기반 사고 패턴 (Mock)",
      "AFC 과거 패턴 기반 예측형 혼잡도 (Mock)",
      "기상 조건 (Mock)",
    ],
    fallbackFlags,
  };

  return {
    ok: true,
    mode: "MOCK",
    data,
    message: "Mock 분석 결과를 반환했습니다.",
    fallbackFlags,
  };
}
