import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import { getTransitRoute } from "@/lib/odsay";
import { getWeatherRisk } from "@/lib/weather";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";
import { calculateCongestion } from "@/lib/risk/calculateCongestion";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import { extractSigungu, getAccidentAreaBySigungu } from "@/lib/data/accidentAreas";
import { getAfcStationLoads, getAfcHourlyAverage } from "@/lib/data/afcStationLoads";
import type { AnalysisRequest, AnalysisResult, TransitStep } from "@/types";

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
    const originAddress = body.origin?.address ?? "";
    const destAddress = body.destination?.address ?? "";
    const departureTime = body.departureTime ?? sampleAnalysis.request.departureTime;

    // sigungu 추출 — 출발지 우선, 없으면 목적지
    const sigungu = extractSigungu(originAddress) ?? extractSigungu(destAddress);

    // ODsay 경로 조회 + 날씨 조회 + TAAS 사고지역 조회 — 병렬 실행
    const [transitResult, weatherResult, accidentAreaResult] = await Promise.all([
      getTransitRoute({
        originLat,
        originLng,
        destinationLat: body.destination?.lat ?? sampleAnalysis.request.destination.lat,
        destinationLng: body.destination?.lng ?? sampleAnalysis.request.destination.lng,
      }),
      getWeatherRisk({ lat: originLat, lng: originLng }),
      sigungu ? getAccidentAreaBySigungu(sigungu) : Promise.resolve({ ok: false as const, reason: "SIGUNGU_NOT_FOUND", source: "FALLBACK" as const }),
    ]);

    // 첫 번째 지하철 step에서 역명·방향·시간대 추출 (AFC 혼잡도 조회용)
    const subwayStep = transitResult.transit?.route?.steps.find(
      (s: TransitStep) => s.mode === "SUBWAY" && s.stationFrom
    );
    const afcStationName = subwayStep?.stationFrom ?? null;
    const departureHour = (() => {
      try { return new Date(departureTime).getHours(); } catch { return null; }
    })();

    // AFC 혼잡도 조회 (역명·시간 있을 때만)
    let congestion = null;
    if (afcStationName && departureHour !== null) {
      const [afcResult, avgResult] = await Promise.all([
        getAfcStationLoads({ stationName: afcStationName, hour: departureHour }),
        getAfcHourlyAverage(departureHour),
      ]);

      if (afcResult.ok && afcResult.loads.length > 0) {
        // 전체 평균이 DB에서 없을 땐 조회된 데이터 기준 평균 사용
        const overallAvg = avgResult ?? (afcResult.loads.reduce((s, l) => s + l.onboardCount, 0) / afcResult.loads.length);
        const paddedLoads = afcResult.loads.map((l) => ({ ...l, onboardCount: l.onboardCount }));
        // calculateCongestion에 전체 평균을 반영하기 위해 더미 rows를 채움 — 실제 평균을 역산해 주입
        const syntheticBaseCount = Math.round(overallAvg);
        const baseLoads = Array.from({ length: 10 }, () => ({
          stationName: "__base__",
          hour: departureHour,
          direction: "UP" as const,
          onboardCount: syntheticBaseCount,
          serviceDayType: "WEEKDAY" as const,
        }));
        congestion = calculateCongestion({
          stationName: afcStationName,
          hour: departureHour,
          stationLoads: [...paddedLoads, ...baseLoads],
        });
      }
    }

    // TAAS 실제 데이터 또는 fallback으로 운전 위험 지수 산정
    const drivingRisk = calculateDrivingRisk({
      ageGroup: body.ageGroup ?? sampleAnalysis.request.ageGroup,
      departureTime,
      accidentArea: accidentAreaResult.ok ? {
        ...accidentAreaResult.data,
        dong: accidentAreaResult.data.dong ?? undefined,
      } : { riskScore: 55 },
      weatherRiskScore: weatherResult.weather.riskScore,
    });

    const mock = createMockAnalysisResult(body);

    const analysisData: AnalysisResult = {
      ...mock.data,
      drivingRisk,
      weather: weatherResult.weather,
      transit: {
        ...transitResult.transit,
        congestion: congestion ?? transitResult.transit?.congestion ?? null,
      },
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
        mode: "ANALYSIS_WITH_STORAGE",
        data: saveResult.result,
        resultId: saveResult.id,
        message: "분석 결과를 반환했습니다.",
        persistence: { saved: true },
        meta: {
          storageSource: "SUPABASE",
          routeSource: transitResult.source,
          weatherSource: weatherResult.source,
          reportSource: reportResult.source,
          accidentAreaSource: accidentAreaResult.source,
          afcCongestionSource: congestion ? "SUPABASE" : "FALLBACK",
        },
        fallbackFlags: analysisData.fallbackFlags,
      });
    }

    return Response.json({
      ok: true,
      mode: "ANALYSIS_FALLBACK",
      data: analysisData,
      resultId: analysisData.id,
      message: "저장 연결이 없어 분석 결과를 반환했습니다.",
      persistence: { saved: false, reason: "SAVE_FAILED" },
      meta: {
        storageSource: "FALLBACK",
        routeSource: transitResult.source,
        weatherSource: weatherResult.source,
        reportSource: reportResult.source,
        accidentAreaSource: accidentAreaResult.source,
        afcCongestionSource: congestion ? "SUPABASE" : "FALLBACK",
      },
      fallbackFlags: analysisData.fallbackFlags,
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "ANALYSIS_FALLBACK",
      data: sampleAnalysis,
      resultId: sampleAnalysis.id,
      message: "오류가 발생해 기본 분석 결과를 반환했습니다.",
      persistence: { saved: false, reason: "SAVE_FAILED" },
      meta: { storageSource: "FALLBACK", routeSource: "FALLBACK", weatherSource: "FALLBACK", reportSource: "FALLBACK" },
      fallbackFlags: { analysis: true, route: true, weather: true, report: true },
    });
  }
}
