// SERVER ONLY — Supabase AFC 데이터를 조회합니다. 클라이언트 컴포넌트에서 import 금지.
// 역명 + 시간대로 AFC 재차인원을 조회하고 calculateCongestion으로 과거 패턴 기반
// 예측형 혼잡도를 계산하는 헬퍼. 메인 분석 흐름(app/api/analyze/route.ts)과
// 시간대 비교 흐름(buildTimeSlotOptions)이 함께 사용한다.
import { getAfcStationLoads, getAfcHourlyAverage } from "@/lib/data/afcStationLoads";
import { calculateCongestion } from "./calculateCongestion";
import type { TransitCongestion } from "@/types";

export type EstimateCongestionResult = {
  congestion: TransitCongestion | null;
  source: "SUPABASE" | "NO_SUBWAY_STEP" | "FALLBACK" | "NO_STATION_MATCH" | "DB_QUERY_FAILED";
};

export async function estimateCongestionForHour(
  stationName: string | null,
  hour: number | null
): Promise<EstimateCongestionResult> {
  if (!stationName || hour === null) {
    return { congestion: null, source: stationName === null ? "NO_SUBWAY_STEP" : "FALLBACK" };
  }

  const [afcResult, avgResult] = await Promise.all([
    getAfcStationLoads({ stationName, hour }),
    getAfcHourlyAverage(hour),
  ]);

  if (!afcResult.ok || afcResult.loads.length === 0) {
    // ok=true+빈배열: 역명 매칭 없음 / ok=false: 데이터 미존재(AFC_DATA_NOT_FOUND) 또는 DB 오류
    const isDataNotFound = !afcResult.ok && (
      afcResult.reason === "AFC_DATA_NOT_FOUND" ||
      afcResult.reason === "STATION_NAME_EMPTY"
    );
    return { congestion: null, source: (afcResult.ok || isDataNotFound) ? "NO_STATION_MATCH" : "DB_QUERY_FAILED" };
  }

  const overallAvg = avgResult ?? (afcResult.loads.reduce((s, l) => s + l.onboardCount, 0) / afcResult.loads.length);
  const baseLoads = Array.from({ length: 10 }, () => ({
    stationName: "__base__",
    hour,
    direction: "UP" as const,
    onboardCount: Math.round(overallAvg),
    serviceDayType: "WEEKDAY" as const,
  }));

  const congestion = calculateCongestion({
    stationName,
    hour,
    stationLoads: [...afcResult.loads, ...baseLoads],
  });

  return { congestion, source: "SUPABASE" };
}
