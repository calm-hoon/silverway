// 순수 함수 — 외부 API/DB 호출 없이 하루 중 대표 시간대별 운전 위험 지수를 계산한다.
// 실제 날씨/혼잡도 데이터는 호출부(app/api/analyze/route.ts)가 미리 조회해
// weatherBySlot/congestionBySlot으로 전달한다. 데이터가 없으면(mock 경로 등)
// calculateDrivingRisk의 기본값으로 동작해 throw 없이 항상 결과를 반환한다.
import type { AgeGroup, TimeSlotOption } from "@/types";
import { calculateDrivingRisk } from "./calculateDrivingRisk";
import { buildDaySlotIsoList } from "./buildDaySlots";

export type SlotWeatherInfo = { riskScore?: number; label?: string };

export type BuildTimeSlotOptionsInput = {
  referenceDepartureTime: string;
  ageGroup?: AgeGroup;
  /** accident_areas의 riskScore(0~100). 없으면 calculateDrivingRisk 기본값 적용 */
  accidentAreaRiskScore?: number;
  /** hour → 해당 시간대 기상 정보 */
  weatherBySlot?: Map<number, SlotWeatherInfo>;
  /** hour → 해당 시간대 혼잡도 레이블 */
  congestionBySlot?: Map<number, string>;
};

function formatHourLabel(hour: number): string {
  const ampm = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${ampm} ${h12}시`;
}

export function buildTimeSlotOptions(input: BuildTimeSlotOptionsInput): TimeSlotOption[] {
  const slots = buildDaySlotIsoList(input.referenceDepartureTime);

  return slots.map(({ hour, iso }) => {
    const weatherInfo = input.weatherBySlot?.get(hour);

    const drivingRisk = calculateDrivingRisk({
      ageGroup: input.ageGroup,
      departureTime: iso,
      accidentArea: input.accidentAreaRiskScore !== undefined
        ? { riskScore: input.accidentAreaRiskScore }
        : undefined,
      weatherRiskScore: weatherInfo?.riskScore,
    });

    return {
      hour,
      iso,
      label: formatHourLabel(hour),
      score: drivingRisk.score,
      level: drivingRisk.level,
      congestionLabel: input.congestionBySlot?.get(hour),
      weatherLabel: weatherInfo?.label,
    };
  });
}
