import { describe, it, expect } from "vitest";
import { buildDaySlotIsoList, RECOMMENDATION_SLOT_HOURS } from "@/lib/risk/buildDaySlots";
import { getKstHour } from "@/lib/utils/time";

describe("buildDaySlotIsoList", () => {
  it("대표 시간대 개수만큼 슬롯을 생성한다", () => {
    const slots = buildDaySlotIsoList("2026-05-04T09:00:00+09:00");
    expect(slots.length).toBe(RECOMMENDATION_SLOT_HOURS.length);
  });

  it("각 슬롯의 iso가 실제로 해당 hour의 KST 시각을 가리킨다", () => {
    const slots = buildDaySlotIsoList("2026-05-04T09:00:00+09:00");
    for (const slot of slots) {
      expect(getKstHour(slot.iso)).toBe(slot.hour);
    }
  });

  it("UTC(Z) 형식 기준 시각을 넣어도 같은 KST 날짜의 슬롯을 만든다", () => {
    // 2026-07-14T10:00:00Z == 2026-07-14 19:00 KST
    const slots = buildDaySlotIsoList("2026-07-14T10:00:00.000Z");
    expect(slots.every((s) => s.iso.startsWith("2026-07-14"))).toBe(true);
  });

  it("잘못된 문자열이면 빈 배열을 반환한다", () => {
    expect(buildDaySlotIsoList("invalid")).toEqual([]);
  });
});
