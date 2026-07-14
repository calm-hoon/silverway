import { describe, it, expect } from "vitest";
import { generateTimeRecommendation, templateRecommendation } from "@/lib/report/generateTimeRecommendation";
import { buildTimeSlotOptions } from "@/lib/risk/buildTimeSlotOptions";
import { FORBIDDEN_REPORT_TERMS } from "@/lib/report/reportSafety";

const SLOTS = buildTimeSlotOptions({ referenceDepartureTime: "2026-05-04T09:00:00+09:00" });

describe("templateRecommendation", () => {
  it("가장 점수가 낮은 슬롯을 추천한다", () => {
    const rec = templateRecommendation(SLOTS);
    const minScore = Math.min(...SLOTS.map((s) => s.score));
    expect(rec.recommendedHour).toBe(SLOTS.find((s) => s.score === minScore)?.hour);
    expect(rec.generatedBy).toBe("TEMPLATE");
  });

  it("빈 슬롯 배열에서도 throw하지 않고 기본값을 반환한다", () => {
    expect(() => templateRecommendation([])).not.toThrow();
    const rec = templateRecommendation([]);
    expect(rec.slots).toEqual([]);
  });

  it("추천 이유에 금지 표현이 포함되지 않는다", () => {
    const rec = templateRecommendation(SLOTS);
    for (const term of FORBIDDEN_REPORT_TERMS) {
      expect(rec.reason.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});

describe("generateTimeRecommendation — ANTHROPIC_API_KEY 없는 환경 (fallback)", () => {
  it("throw하지 않고 TEMPLATE 소스로 추천을 반환한다", async () => {
    const rec = await generateTimeRecommendation(SLOTS, { ageGroup: "70s" });
    expect(rec.generatedBy).toBe("TEMPLATE");
    expect(rec.slots.length).toBe(SLOTS.length);
  });

  it("recommendedHour가 slots 중 하나와 일치한다", async () => {
    const rec = await generateTimeRecommendation(SLOTS, {});
    expect(SLOTS.some((s) => s.hour === rec.recommendedHour)).toBe(true);
  });
});
