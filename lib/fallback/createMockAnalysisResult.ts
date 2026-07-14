// 보조 데이터 기반 분석 결과 생성 — 실제 외부 API/Supabase 없이 동작하는 순수 함수
import type { AnalysisRequest, AnalysisResult, FallbackFlags } from "@/types";
import { sampleAnalysis } from "./sampleAnalysis";
import { sampleRoute } from "./sampleRoute";
import { sampleWeather } from "./sampleWeather";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";
import { buildTimeSlotOptions } from "@/lib/risk/buildTimeSlotOptions";
import { generateTemplateReport } from "@/lib/report/generateTemplateReport";
import { templateRecommendation } from "@/lib/report/generateTimeRecommendation";

export type MockAnalysisResponse = {
  ok: true;
  mode: "ANALYSIS";
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

  // 오프라인 mock 경로에서도 AI 시간대 추천 카드가 항상 보이도록 동기 계산 (외부 API 호출 없음)
  const timeSlotOptions = buildTimeSlotOptions({
    referenceDepartureTime: request.departureTime,
    ageGroup: request.ageGroup,
    accidentAreaRiskScore: 55,
  });

  const report = {
    ...generateTemplateReport({
      originName: request.origin.name,
      destinationName: request.destination.name,
      drivingRisk,
      transit,
      weather,
      departureTime: request.departureTime,
      ageGroup: request.ageGroup,
    }),
    timeRecommendation: templateRecommendation(timeSlotOptions),
  };

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
      "공공데이터 기반 사고 패턴 (보조 데이터)",
      "AFC 과거 패턴 기반 예측형 혼잡도 (보조 데이터)",
      "기상 조건 (보조 데이터)",
    ],
    fallbackFlags,
  };

  return {
    ok: true,
    mode: "ANALYSIS",
    data,
    message: "분석 결과를 반환했습니다.",
    fallbackFlags,
  };
}
