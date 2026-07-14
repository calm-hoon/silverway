export const dynamic = "force-dynamic";
export const revalidate = 0;
import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import { getTransitRoute } from "@/lib/odsay";
import { getWeatherRisk } from "@/lib/weather";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";
import { estimateCongestionForHour } from "@/lib/risk/estimateCongestion";
import { buildTimeSlotOptions } from "@/lib/risk/buildTimeSlotOptions";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import { generateTimeRecommendation } from "@/lib/report/generateTimeRecommendation";
import { extractSigungu, getAccidentAreaBySigungu } from "@/lib/data/accidentAreas";
import { getWeatherRiskForSlots } from "@/lib/weather/getWeatherRiskForSlots";
import { buildDaySlotIsoList } from "@/lib/risk/buildDaySlots";
import { getKstHour } from "@/lib/utils/time";
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
      getWeatherRisk({ lat: originLat, lng: originLng, baseDateTime: departureTime }),
      sigungu ? getAccidentAreaBySigungu(sigungu) : Promise.resolve({ ok: false as const, reason: "SIGUNGU_NOT_FOUND", source: "FALLBACK" as const }),
    ]);
    const accidentAreaMeta = accidentAreaResult.ok
      ? "SUPABASE"
      : accidentAreaResult.reason === "AREA_NOT_FOUND"
        ? "NOT_FOUND"
        : ["DB_QUERY_FAILED", "DB_EXCEPTION", "DB_CLIENT_MISSING"].includes(accidentAreaResult.reason)
          ? "DB_QUERY_FAILED"
          : "FALLBACK";

    // 첫 번째 지하철 step에서 역명·방향·시간대 추출 (AFC 혼잡도 조회용)
    const subwayStep = transitResult.transit?.route?.steps.find(
      (s: TransitStep) => s.mode === "SUBWAY" && s.stationFrom
    );
    const afcStationName = subwayStep?.stationFrom ?? null;
    // getKstHour: 서버 TZ(UTC)와 무관하게 KST 기준 시(hour)를 계산 (Z/+09:00 형식 모두 지원)
    const departureHour = getKstHour(departureTime);

    // AFC 혼잡도 조회 (routeSource=FALLBACK이어도 fallback route의 stationFrom 기준으로 조회)
    const { congestion, source: afcCongestionSource } = await estimateCongestionForHour(afcStationName, departureHour);

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

    const dataSources: string[] = [
      accidentAreaResult.ok
        ? "TAAS 사고분석 지역별 데이터"
        : "공공데이터 기반 사고 패턴 (보조 데이터)",
      congestion
        ? "AFC 열차 재차인원 데이터"
        : "AFC 과거 패턴 기반 예측형 혼잡도 (보조 데이터)",
      "기상청 단기예보",
    ];

    const mock = createMockAnalysisResult(body);

    const analysisData: AnalysisResult = {
      ...mock.data,
      drivingRisk,
      weather: weatherResult.weather,
      transit: {
        ...transitResult.transit,
        congestion: congestion ?? transitResult.transit?.congestion ?? null,
      },
      summary: {
        recommendDriving: drivingRisk.level === "LOW",
        oneLiner: `운전 위험 지수 ${drivingRisk.score}점(${drivingRisk.label})으로 분석되었습니다.`,
      },
      dataSources,
      fallbackFlags: {
        analysis: !accidentAreaResult.ok,
        route: !transitResult.ok,
        weather: !weatherResult.ok,
        report: true,
      },
    };

    // AI 최적 출발시간대 추천 준비 — 하루 중 대표 시간대별 날씨·혼잡도를 미리 조회
    // (기상청 원본 응답 1회 재사용 + AFC 시간대별 조회, generateClaudeReport와 병렬 실행하기 전에 필요)
    const accidentAreaRiskScore = accidentAreaResult.ok ? accidentAreaResult.data.risk_score : 55;
    const daySlots = buildDaySlotIsoList(departureTime);

    const [weatherSlots, congestionSlots] = await Promise.all([
      getWeatherRiskForSlots({ lat: originLat, lng: originLng, isoList: daySlots.map((s) => s.iso) }),
      Promise.all(daySlots.map((s) => estimateCongestionForHour(afcStationName, s.hour))),
    ]);

    const weatherBySlot = new Map<number, { riskScore?: number; label?: string }>();
    const congestionBySlot = new Map<number, string>();
    daySlots.forEach((s, i) => {
      const w = weatherSlots[i]?.weather;
      weatherBySlot.set(s.hour, { riskScore: w?.riskScore ?? undefined, label: w?.label });
      const label = congestionSlots[i]?.congestion?.label;
      if (label) congestionBySlot.set(s.hour, label);
    });

    const timeSlotOptions = buildTimeSlotOptions({
      referenceDepartureTime: departureTime,
      ageGroup: analysisData.request.ageGroup,
      accidentAreaRiskScore,
      weatherBySlot,
      congestionBySlot,
    });

    // Claude 리포트 생성 + AI 시간대 추천 생성 — 서로 독립적이므로 병렬 실행 (지연시간 절감)
    // 둘 다 실패해도 generateTemplateReport / 최저 점수 슬롯 선택으로 자동 대체됨
    const [reportResult, timeRecommendation] = await Promise.all([
      generateClaudeReport({ analysis: analysisData }),
      generateTimeRecommendation(timeSlotOptions, {
        originName: analysisData.request.origin.name,
        destinationName: analysisData.request.destination.name,
        ageGroup: analysisData.request.ageGroup,
      }),
    ]);
    analysisData.report = { ...reportResult.report, timeRecommendation };
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
          accidentAreaSource: accidentAreaMeta,
          afcCongestionSource,
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
        accidentAreaSource: accidentAreaMeta,
        afcCongestionSource,
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
