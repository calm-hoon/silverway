import { getKstDateTime, buildKstIso } from "@/lib/utils/time";

/** AI 최적 출발시간대 추천에 사용할 하루 중 대표 시간대(KST) */
export const RECOMMENDATION_SLOT_HOURS = [7, 10, 13, 16, 19, 22] as const;

export type DaySlot = { hour: number; iso: string };

/** referenceDepartureTime과 같은 KST 날짜의 대표 시간대 목록을 ISO 8601(+09:00)로 만든다. */
export function buildDaySlotIsoList(referenceDepartureTime: string): DaySlot[] {
  const kst = getKstDateTime(referenceDepartureTime);
  if (!kst) return [];

  return RECOMMENDATION_SLOT_HOURS.map((hour) => ({
    hour,
    iso: buildKstIso(kst.year, kst.month, kst.day, hour),
  }));
}
