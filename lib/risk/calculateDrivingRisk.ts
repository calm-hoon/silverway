import type { AgeGroup, DrivingRisk, DrivingRiskFactor, RiskLevel } from "@/types";

export type CalculateDrivingRiskInput = {
  accidentArea?: {
    accidentCount?: number;
    elderlyDriverCount?: number;
    fatalCount?: number;
    severeCount?: number;
    riskScore?: number;
    sido?: string;
    sigungu?: string;
    dong?: string;
  };
  departureTime?: string;
  weatherRiskScore?: number;
  ageGroup?: AgeGroup;
  routeAreaWeight?: number;
};

// 0~100 입력값을 maxOutput 범위로 환산
function normalizeScore(value: number, maxOutput: number): number {
  return Math.round((Math.min(100, Math.max(0, value)) / 100) * maxOutput);
}

// 운전 위험 지수 산정용 상대 점수 (실제 사고 가능성을 의미하지 않음)
function calculateAccidentRisk(
  accidentArea: CalculateDrivingRiskInput["accidentArea"]
): { score: number; description: string } {
  const MAX = 50;
  const DEFAULT = 20;

  if (!accidentArea) {
    return { score: DEFAULT, description: "지역 사고 패턴 데이터가 없어 기본값을 적용했습니다." };
  }

  const { riskScore, accidentCount, elderlyDriverCount, fatalCount, severeCount, sido, sigungu, dong } =
    accidentArea;

  const locationDesc = [sido, sigungu, dong].filter(Boolean).join(" ") || "해당 지역";

  if (riskScore !== undefined) {
    return {
      score: normalizeScore(riskScore, MAX),
      description: `${locationDesc}의 공공데이터 기반 사고 패턴을 반영했습니다.`,
    };
  }

  // riskScore 없을 때 휴리스틱 산정
  let heuristic = 0;
  if (accidentCount !== undefined) heuristic += Math.min(accidentCount * 0.5, 30);
  if (elderlyDriverCount !== undefined) heuristic += Math.min(elderlyDriverCount * 1.0, 15);
  if (severeCount !== undefined) heuristic += Math.min(severeCount * 2.0, 10);
  if (fatalCount !== undefined) heuristic += Math.min(fatalCount * 5.0, 10);

  const score = heuristic === 0 ? DEFAULT : Math.min(MAX, Math.round(heuristic));
  return {
    score,
    description: `${locationDesc}의 공공데이터 기반 사고 패턴을 반영했습니다.`,
  };
}

function calculateTimeRisk(departureTime?: string): { score: number; description: string } {
  if (!departureTime) {
    return { score: 5, description: "출발 시각 정보가 없어 기본값을 적용했습니다." };
  }

  try {
    const date = new Date(departureTime);
    if (isNaN(date.getTime())) throw new Error("invalid");
    const hour = date.getHours();

    if (hour >= 22 || hour < 6) return { score: 15, description: "심야·새벽 시간대로 시간대 위험 지수가 높습니다." };
    if (hour >= 19) return { score: 12, description: "저녁 시간대로 시간대 위험 지수가 높은 편입니다." };
    if (hour >= 16) return { score: 10, description: "오후 퇴근 시간대로 교통량이 많습니다." };
    if (hour >= 9) return { score: 5, description: "오전·낮 시간대로 시간대 위험 지수가 낮습니다." };
    return { score: 8, description: "오전 출근 시간대로 교통량이 많습니다." };
  } catch {
    return { score: 5, description: "출발 시각 파싱에 실패해 기본값을 적용했습니다." };
  }
}

function calculateWeatherRisk(weatherRiskScore?: number): { score: number; description: string } {
  const MAX = 15;
  if (weatherRiskScore === undefined || weatherRiskScore === null) {
    return { score: 3, description: "기상 데이터가 없어 보수적 기본값을 적용했습니다." };
  }
  return {
    score: normalizeScore(weatherRiskScore, MAX),
    description: "기상 조건이 운전 위험 지수에 반영되었습니다.",
  };
}

function calculateAgeRisk(ageGroup?: AgeGroup): { score: number; description: string } {
  switch (ageGroup) {
    case "60s":
      return { score: 4, description: "60대 운전자 보정이 적용되었습니다." };
    case "70s":
      return { score: 7, description: "70대 운전자는 반응 속도 및 야간 시력 저하 가능성이 고려됩니다." };
    case "80s":
      return { score: 10, description: "80대 이상 운전자는 고령 운전 특성이 충분히 반영되었습니다." };
    default:
      return { score: 5, description: "연령대 정보가 없어 기본값을 적용했습니다." };
  }
}

function calculateAreaRisk(routeAreaWeight?: number): { score: number; description: string } {
  const MAX = 10;
  if (routeAreaWeight === undefined || routeAreaWeight === null) {
    return { score: 2, description: "경로 지역 보정 데이터가 없어 기본값을 적용했습니다." };
  }
  return {
    score: normalizeScore(routeAreaWeight, MAX),
    description: "경로 지역 특성이 운전 위험 지수에 반영되었습니다.",
  };
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = { LOW: "낮음", MEDIUM: "보통", HIGH: "높음" };
  return labels[level];
}

const RISK_DESCRIPTION =
  "이 점수는 실제 사고 확률이 아니라, 공공데이터 기반 사고 패턴, 시간대, 기상 조건, 이동 지역 특성을 조합한 의사결정 보조용 운전 위험 지수입니다.";

export function calculateDrivingRisk(input: CalculateDrivingRiskInput): DrivingRisk {
  const accident = calculateAccidentRisk(input.accidentArea);
  const time = calculateTimeRisk(input.departureTime);
  const weather = calculateWeatherRisk(input.weatherRiskScore);
  const age = calculateAgeRisk(input.ageGroup);
  const area = calculateAreaRisk(input.routeAreaWeight);

  const finalScore = Math.min(100, Math.max(0, accident.score + time.score + weather.score + age.score + area.score));
  const level = getRiskLevel(finalScore);

  const factors: DrivingRiskFactor[] = [
    { key: "area", label: "지역 사고 패턴", score: accident.score, maxScore: 50, description: accident.description },
    { key: "time", label: "시간대", score: time.score, maxScore: 15, description: time.description },
    { key: "weather", label: "기상 조건", score: weather.score, maxScore: 15, description: weather.description },
    { key: "age", label: "연령대", score: age.score, maxScore: 10, description: age.description },
    { key: "distance", label: "경로 지역 보정", score: area.score, maxScore: 10, description: area.description },
  ];

  return {
    score: finalScore,
    level,
    label: getRiskLabel(level),
    description: RISK_DESCRIPTION,
    factors,
  };
}
