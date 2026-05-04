/**
 * AFC(자동요금징수) 재차인원 데이터 기반 과거 패턴 예측형 혼잡도 계산
 *
 * 전처리 원칙:
 * - 원본 AFC wide format은 long format으로 전처리된 AfcStationLoad[] 형태를 사용한다.
 * - Tot_Traffic보다 각 역·열차 단위의 onboardCount 값을 사용한다.
 * - direction 컬럼으로 상행(UP)/하행(DOWN)을 구분한다.
 * - 이 함수는 실시간 데이터를 사용하지 않는다.
 */

import type { AfcStationLoad, CongestionLevel, TransitCongestion } from "@/types";

export type CalculateCongestionInput = {
  stationName?: string;
  hour?: number;
  direction?: "UP" | "DOWN" | "UNKNOWN";
  stationLoads?: AfcStationLoad[];
};

// 역명 정규화: 공백 제거 후 끝에 "역"이 없으면 추가
function normalizeStationName(name: string): string {
  const trimmed = name.trim();
  return trimmed.endsWith("역") ? trimmed : `${trimmed}역`;
}

function filterStationLoads(
  loads: AfcStationLoad[],
  stationName: string,
  hour: number,
  direction?: "UP" | "DOWN" | "UNKNOWN"
): AfcStationLoad[] {
  const normalized = normalizeStationName(stationName);
  return loads.filter((load) => {
    const nameMatch = normalizeStationName(load.stationName) === normalized;
    const hourMatch = load.hour === hour;
    const dirMatch = !direction || direction === "UNKNOWN" || load.direction === direction;
    return nameMatch && hourMatch && dirMatch;
  });
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getCongestionLevel(ratio: number): CongestionLevel {
  if (ratio >= 1.2) return "HIGH";
  if (ratio >= 0.8) return "MEDIUM";
  return "LOW";
}

function getCongestionLabel(level: CongestionLevel): string {
  const labels: Record<CongestionLevel, string> = { LOW: "낮음", MEDIUM: "보통", HIGH: "높음" };
  return labels[level];
}

const BASE_DESCRIPTION =
  "이 혼잡도는 실시간 정보가 아니라 AFC 재차인원 데이터를 바탕으로 산정한 과거 패턴 기반 예측형 혼잡도입니다.";

function createFallbackCongestion(reason: string): TransitCongestion {
  return {
    level: "MEDIUM",
    label: "보통",
    description: `${BASE_DESCRIPTION} ${reason}`,
    basis: "HISTORICAL_PATTERN",
  };
}

export function calculateCongestion(input: CalculateCongestionInput): TransitCongestion {
  const { stationName, hour, direction, stationLoads } = input;

  if (!stationLoads || stationLoads.length === 0) {
    return createFallbackCongestion("데이터가 없어 기본값을 적용했습니다.");
  }

  if (!stationName || hour === undefined) {
    return createFallbackCongestion("역명 또는 시간 정보가 없어 기본값을 적용했습니다.");
  }

  const overallAverage = calculateAverage(stationLoads.map((l) => l.onboardCount));

  if (overallAverage === 0) {
    return createFallbackCongestion("재차인원 평균이 0이어서 기본값을 적용했습니다.");
  }

  const matched = filterStationLoads(stationLoads, stationName, hour, direction);

  if (matched.length === 0) {
    return createFallbackCongestion(
      `'${normalizeStationName(stationName)}' ${hour}시 데이터가 없어 기본값을 적용했습니다.`
    );
  }

  const stationHourAverage = calculateAverage(matched.map((l) => l.onboardCount));
  const ratio = stationHourAverage / overallAverage;
  const level = getCongestionLevel(ratio);

  return {
    level,
    label: getCongestionLabel(level),
    description: BASE_DESCRIPTION,
    basis: "HISTORICAL_PATTERN",
    ratio: Math.round(ratio * 100) / 100,
    stationName: normalizeStationName(stationName),
    hour,
  };
}
