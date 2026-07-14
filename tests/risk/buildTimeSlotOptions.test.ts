import { describe, it, expect } from "vitest";
import { buildTimeSlotOptions } from "@/lib/risk/buildTimeSlotOptions";

describe("buildTimeSlotOptions", () => {
  it("입력 데이터 없이도 throw하지 않고 6개 시간대를 반환한다", () => {
    expect(() =>
      buildTimeSlotOptions({ referenceDepartureTime: "2026-05-04T09:00:00+09:00" })
    ).not.toThrow();
    const slots = buildTimeSlotOptions({ referenceDepartureTime: "2026-05-04T09:00:00+09:00" });
    expect(slots.length).toBe(6);
  });

  it("심야 시간대(22시)가 낮 시간대(10시)보다 운전 위험 지수가 높다", () => {
    const slots = buildTimeSlotOptions({ referenceDepartureTime: "2026-05-04T09:00:00+09:00" });
    const night = slots.find((s) => s.hour === 22);
    const day = slots.find((s) => s.hour === 10);
    expect(night?.score).toBeGreaterThan(day?.score ?? 0);
  });

  it("weatherBySlot으로 전달한 기상 정보가 해당 시간대 점수에 반영된다", () => {
    const base = buildTimeSlotOptions({ referenceDepartureTime: "2026-05-04T09:00:00+09:00" });
    const withStorm = buildTimeSlotOptions({
      referenceDepartureTime: "2026-05-04T09:00:00+09:00",
      weatherBySlot: new Map([[10, { riskScore: 100, label: "강한 비" }]]),
    });

    const baseAt10 = base.find((s) => s.hour === 10)!;
    const stormAt10 = withStorm.find((s) => s.hour === 10)!;
    expect(stormAt10.score).toBeGreaterThan(baseAt10.score);
    expect(stormAt10.weatherLabel).toBe("강한 비");
  });

  it("congestionBySlot으로 전달한 혼잡도 레이블이 그대로 반영된다", () => {
    const slots = buildTimeSlotOptions({
      referenceDepartureTime: "2026-05-04T09:00:00+09:00",
      congestionBySlot: new Map([[19, "혼잡"]]),
    });
    expect(slots.find((s) => s.hour === 19)?.congestionLabel).toBe("혼잡");
    expect(slots.find((s) => s.hour === 10)?.congestionLabel).toBeUndefined();
  });

  it("잘못된 referenceDepartureTime이면 빈 배열을 반환한다", () => {
    expect(buildTimeSlotOptions({ referenceDepartureTime: "invalid" })).toEqual([]);
  });
});
