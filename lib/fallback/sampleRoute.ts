import type { TransitSummary } from "@/types";

/**
 * ODsay API 미연동 시 사용하는 대중교통 경로 fallback 데이터.
 * 예시 경로: 대전광역시청 → 충남대학교병원 (지하철 1호선 + 도보)
 */
export const sampleRoute: TransitSummary = {
  available: true,
  route: {
    totalDurationMin: 26,
    transferCount: 0,
    steps: [
      {
        mode: "WALK",
        durationMin: 5,
        distanceM: 350,
        description: "대전광역시청에서 시청역까지 도보 이동",
      },
      {
        mode: "SUBWAY",
        lineName: "대전 1호선",
        stationFrom: "시청역",
        stationTo: "충남대역",
        durationMin: 14,
        distanceM: 3200,
        description: "시청역 승차 → 충남대역 하차 (3정거장)",
      },
      {
        mode: "WALK",
        durationMin: 7,
        distanceM: 500,
        description: "충남대역에서 충남대학교병원까지 도보 이동",
      },
    ],
    source: "ODsay 대중교통 경로",
  },
  // 과거 패턴 기반 예측형 혼잡도 — 실시간 데이터 아님
  congestion: {
    level: "MEDIUM",
    label: "보통",
    description:
      "출발 시간대 기준 과거 패턴 기반 예측형 혼잡도입니다. " +
      "오전 10시~11시 구간은 통근 혼잡이 소폭 감소한 시간대로 보통 수준이 예상됩니다.",
    basis: "HISTORICAL_PATTERN",
  },
};
