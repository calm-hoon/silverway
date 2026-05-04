import { describe, it, expect } from "vitest";
import { calculateCongestion } from "@/lib/risk/calculateCongestion";
import type { AfcStationLoad } from "@/types";

const load = (
  stationName: string,
  hour: number,
  onboardCount: number,
  direction: "UP" | "DOWN" = "UP"
): AfcStationLoad => ({ stationName, hour, direction, onboardCount });

describe("calculateCongestion", () => {
  it("stationLoads가 있을 때 LOW, MEDIUM, HIGH 중 하나의 level을 반환한다", () => {
    const loads = [load("시청역", 8, 312), load("대전역", 8, 421)];
    const result = calculateCongestion({ stationName: "시청역", hour: 8, stationLoads: loads });
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.level);
  });

  it("혼잡 비율이 0.8 미만인 역에 대해 LOW를 반환한다", () => {
    // stationHourAverage = 50, overallAverage = 125 → ratio = 0.4 → LOW
    const loads = [
      load("조용역", 9, 50),
      load("조용역", 9, 50),
      load("기준역", 9, 200),
      load("기준역", 9, 200),
    ];
    const result = calculateCongestion({ stationName: "조용역", hour: 9, stationLoads: loads });
    expect(result.level).toBe("LOW");
  });

  it("혼잡 비율이 0.8 이상 1.2 미만인 역에 대해 MEDIUM을 반환한다", () => {
    // stationHourAverage = 100, overallAverage = 100 → ratio = 1.0 → MEDIUM
    const loads = [
      load("테스트역", 9, 100),
      load("기준역A", 9, 100),
      load("기준역B", 9, 100),
    ];
    const result = calculateCongestion({ stationName: "테스트역", hour: 9, stationLoads: loads });
    expect(result.level).toBe("MEDIUM");
  });

  it("혼잡 비율이 1.2 이상인 역에 대해 HIGH를 반환한다", () => {
    // stationHourAverage = 500, overallAverage ≈ 233 → ratio ≈ 2.14 → HIGH
    const loads = [
      load("혼잡역", 8, 500),
      load("기준역", 8, 100),
      load("기준역", 8, 100),
    ];
    const result = calculateCongestion({ stationName: "혼잡역", hour: 8, stationLoads: loads });
    expect(result.level).toBe("HIGH");
  });

  it("'정부청사' 입력이 '정부청사역' 데이터와 매칭된다", () => {
    const loads = [load("정부청사역", 10, 156), load("시청역", 10, 178)];
    const result = calculateCongestion({
      stationName: "정부청사",
      hour: 10,
      stationLoads: loads,
    });
    expect(result.stationName).toBe("정부청사역");
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.level);
  });

  it("입력값이 비어 있어도 throw하지 않고 기본값을 반환한다", () => {
    expect(() => calculateCongestion({})).not.toThrow();
    const result = calculateCongestion({});
    expect(result.level).toBeDefined();
    expect(result.basis).toBe("HISTORICAL_PATTERN");
  });

  it("매칭 데이터가 없을 때 fallback으로 기본값을 반환한다", () => {
    const loads = [load("시청역", 8, 300)];
    const result = calculateCongestion({ stationName: "없는역", hour: 8, stationLoads: loads });
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.level);
    expect(result.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("description에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    const result = calculateCongestion({});
    expect(result.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("반환값 문자열에 금지 표현이 포함되지 않는다", () => {
    const loads = [load("시청역", 8, 300), load("대전역", 8, 200)];
    const result = calculateCongestion({ stationName: "시청역", hour: 8, stationLoads: loads });
    const text = JSON.stringify(result);
    expect(text).not.toContain("실시간 혼잡도");
    expect(text).not.toContain("realtime");
    expect(text).not.toContain("live congestion");
    expect(text).not.toContain("예측 확률");
    expect(text).not.toContain("probability");
  });
});
