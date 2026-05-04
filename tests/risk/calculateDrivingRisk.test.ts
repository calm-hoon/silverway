import { describe, it, expect } from "vitest";
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";

describe("calculateDrivingRisk", () => {
  it("riskScore가 있는 입력에서 0~100 범위의 운전 위험 지수를 반환한다", () => {
    const result = calculateDrivingRisk({
      accidentArea: { riskScore: 62, sido: "대전광역시", sigungu: "서구", dong: "둔산동" },
      ageGroup: "70s",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("운전 위험 지수 등급은 LOW, MEDIUM, HIGH 중 하나다", () => {
    const levels = ["LOW", "MEDIUM", "HIGH"] as const;
    const result = calculateDrivingRisk({ ageGroup: "70s" });
    expect(levels).toContain(result.level);
  });

  it("입력값이 비어 있어도 throw하지 않고 기본값으로 동작한다", () => {
    expect(() => calculateDrivingRisk({})).not.toThrow();
    const result = calculateDrivingRisk({});
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("80s 연령대는 60s보다 운전 위험 지수 합산 점수가 높다", () => {
    const base = { accidentArea: { riskScore: 50 } };
    const result80s = calculateDrivingRisk({ ...base, ageGroup: "80s" });
    const result60s = calculateDrivingRisk({ ...base, ageGroup: "60s" });
    expect(result80s.score).toBeGreaterThan(result60s.score);
  });

  it("심야 시간대는 주간 시간대보다 운전 위험 지수 합산 점수가 높다", () => {
    const nightResult = calculateDrivingRisk({
      departureTime: "2026-05-04T23:00:00+09:00",
    });
    const dayResult = calculateDrivingRisk({
      departureTime: "2026-05-04T10:00:00+09:00",
    });
    expect(nightResult.score).toBeGreaterThan(dayResult.score);
  });

  it("description에 '운전 위험 지수' 표현이 포함된다", () => {
    const result = calculateDrivingRisk({ ageGroup: "70s" });
    expect(result.description).toContain("운전 위험 지수");
  });

  it("factors 설명에 금지 표현이 포함되지 않는다", () => {
    // description은 서비스 원칙에 따른 필수 면책 문구이므로 제외하고 factors만 검증
    const result = calculateDrivingRisk({
      accidentArea: { riskScore: 80, sido: "대전광역시", sigungu: "중구" },
      departureTime: "2026-05-04T23:00:00+09:00",
      weatherRiskScore: 60,
      ageGroup: "80s",
      routeAreaWeight: 70,
    });
    const factorText = result.factors.map((f) => f.description).join(" ");
    expect(factorText).not.toContain("예측 확률");
    expect(factorText).not.toContain("probability");
  });

  it("level이 score 기준(LOW<40, MEDIUM<70, HIGH>=70)에 맞게 반환된다", () => {
    // 모든 값이 최소인 경우(빈 입력) — 기본값 합산 20+5+3+5+2=35 → LOW
    const low = calculateDrivingRisk({});
    expect(low.level).toBe("LOW");

    // riskScore 높고 야간 + 80s → HIGH
    const high = calculateDrivingRisk({
      accidentArea: { riskScore: 100 },
      departureTime: "2026-05-04T23:00:00+09:00",
      weatherRiskScore: 100,
      ageGroup: "80s",
      routeAreaWeight: 100,
    });
    expect(high.level).toBe("HIGH");
  });

  it("반환 결과에 factors 배열이 포함된다", () => {
    const result = calculateDrivingRisk({ ageGroup: "70s" });
    expect(result.factors.length).toBeGreaterThan(0);
    result.factors.forEach((f) => {
      expect(typeof f.key).toBe("string");
      expect(typeof f.score).toBe("number");
      expect(typeof f.description).toBe("string");
    });
  });
});
