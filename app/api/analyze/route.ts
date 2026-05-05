import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import { getTransitRoute } from "@/lib/odsay";
import { getWeatherRisk } from "@/lib/weather";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import type { AnalysisRequest, AnalysisResult } from "@/types";

export function GET() {
  return Response.json({
    ok: true,
    message: "POST 요청으로 분석을 시작하세요.",
    usage: {
      method: "POST",
      contentType: "application/json",
      body: {
        origin: { name: "string", address: "string", lat: "number", lng: "number" },
        destination: { name: "string", address: "string", lat: "number", lng: "number" },
        departureTime: "ISO 8601 string",
        ageGroup: "60s | 70s | 80s",
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    let body: Partial<AnalysisRequest> = {};
    try {
      body = await request.json();
    } catch {
      // body 파싱 실패 시 빈 객체로 진행 — fallback 값이 적용됨
    }

    const originLat = body.origin?.lat ?? sampleAnalysis.request.origin.lat;
    const originLng = body.origin?.lng ?? sampleAnalysis.request.origin.lng;

    // ODsay 대중교통 경로 조회 + 기상청 날씨 조회 — 병렬 실행
    const [transitResult, weatherResult] = await Promise.all([
      getTransitRoute({
        originLat,
        originLng,
        destinationLat: body.destination?.lat ?? sampleAnalysis.request.destination.lat,
        destinationLng: body.destination?.lng ?? sampleAnalysis.request.destination.lng,
      }),
      getWeatherRisk({ lat: originLat, lng: originLng }),
    ]);

    // 날씨 riskScore를 반영해 운전 위험 지수를 재산정
    const drivingRisk = calculateDrivingRisk({
      ageGroup: body.ageGroup ?? sampleAnalysis.request.ageGroup,
      departureTime: body.departureTime ?? sampleAnalysis.request.departureTime,
      accidentArea: { riskScore: 55 },
      weatherRiskScore: weatherResult.weather.riskScore,
    });

    const mock = createMockAnalysisResult(body);

    const analysisData: AnalysisResult = {
      ...mock.data,
      drivingRisk,
      weather: weatherResult.weather,
      transit: transitResult.transit,
      fallbackFlags: {
        analysis: true,
        route: !transitResult.ok,
        weather: !weatherResult.ok,
        report: true,
      },
    };

    // Claude 리포트 생성 — 실패 시 generateTemplateReport fallback 사용
    const reportResult = await generateClaudeReport({ analysis: analysisData });
    analysisData.report = reportResult.report;
    if (analysisData.fallbackFlags) {
      analysisData.fallbackFlags.report = !reportResult.ok;
    }

    const saveResult = await saveAnalysisLog(analysisData);

    if (saveResult.ok) {
      return Response.json({
        ok: true,
        mode: "MOCK_WITH_STORAGE",
        data: saveResult.result,
        resultId: saveResult.id,
        message: "Mock 분석 결과를 반환했습니다.",
        meta: {
          stored: true,
          storageSource: "SUPABASE",
          routeSource: transitResult.source,
          weatherSource: weatherResult.source,
          reportSource: reportResult.source,
        },
        fallbackFlags: analysisData.fallbackFlags,
      });
    }

    return Response.json({
      ok: true,
      mode: "MOCK_WITH_STORAGE_FALLBACK",
      data: analysisData,
      resultId: analysisData.id,
      message: "저장 연결이 없어 Mock 결과를 반환했습니다.",
      meta: {
        stored: false,
        storageSource: "FALLBACK",
        routeSource: transitResult.source,
        weatherSource: weatherResult.source,
        reportSource: reportResult.source,
        reason: saveResult.reason,
      },
      fallbackFlags: analysisData.fallbackFlags,
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "MOCK_WITH_STORAGE_FALLBACK",
      data: sampleAnalysis,
      resultId: "test",
      message: "오류가 발생해 기본 분석 결과를 반환했습니다.",
      meta: { stored: false, storageSource: "FALLBACK", routeSource: "FALLBACK", weatherSource: "FALLBACK", reportSource: "FALLBACK" },
      fallbackFlags: { analysis: true, route: true, weather: true, report: true },
    });
  }
}
