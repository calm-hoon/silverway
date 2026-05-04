import { describe, it, expect } from "vitest";
import { generateTemplateReport } from "@/lib/report/generateTemplateReport";
import type { DrivingRisk, TransitSummary } from "@/types";

const makeDrivingRisk = (level: "LOW" | "MEDIUM" | "HIGH", score: number): DrivingRisk => ({
  score,
  level,
  label: level === "LOW" ? "낮음" : level === "MEDIUM" ? "보통" : "높음",
  description: "의사결정 보조용 운전 위험 지수입니다.",
  factors: [
    { key: "area", label: "지역 사고 패턴", score: 30, description: "지역 패턴 반영" },
    { key: "time", label: "시간대", score: 10, description: "시간대 반영" },
  ],
});

const makeTransit = (): TransitSummary => ({
  available: true,
  route: {
    totalDurationMin: 26,
    transferCount: 0,
    steps: [],
    source: "fallback",
  },
  congestion: {
    level: "MEDIUM",
    label: "보통",
    description: "과거 패턴 기반 예측형 혼잡도입니다.",
    basis: "HISTORICAL_PATTERN",
  },
});

describe("generateTemplateReport", () => {
  it("LOW 등급 입력에 대해 title, summary, familyMessage를 반환한다", () => {
    const result = generateTemplateReport({
      drivingRisk: makeDrivingRisk("LOW", 30),
      originName: "대전광역시청",
      destinationName: "충남대학교병원",
    });
    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.familyMessage).toBeTruthy();
  });

  it("MEDIUM 등급 입력에 대해 title, summary, familyMessage를 반환한다", () => {
    const result = generateTemplateReport({
      drivingRisk: makeDrivingRisk("MEDIUM", 55),
      originName: "대전광역시청",
      destinationName: "충남대학교병원",
    });
    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.familyMessage).toBeTruthy();
  });

  it("HIGH 등급 입력에 대해 title, summary, familyMessage를 반환한다", () => {
    const result = generateTemplateReport({
      drivingRisk: makeDrivingRisk("HIGH", 80),
      originName: "대전광역시청",
      destinationName: "충남대학교병원",
    });
    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.familyMessage).toBeTruthy();
  });

  it("summary 또는 body에 '운전 위험 지수' 표현이 포함된다", () => {
    const result = generateTemplateReport({ drivingRisk: makeDrivingRisk("MEDIUM", 55) });
    const text = result.summary + (result.body ?? "");
    expect(text).toContain("운전 위험 지수");
  });

  it("대중교통 정보가 있을 때 body에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", () => {
    const result = generateTemplateReport({
      drivingRisk: makeDrivingRisk("MEDIUM", 55),
      transit: makeTransit(),
    });
    expect(result.body).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("familyMessage가 비어 있지 않다", () => {
    const result = generateTemplateReport({});
    expect(result.familyMessage.trim().length).toBeGreaterThan(0);
  });

  it("입력값이 비어 있어도 throw하지 않는다", () => {
    expect(() => generateTemplateReport({})).not.toThrow();
    const result = generateTemplateReport({});
    expect(result.title).toBeTruthy();
  });

  it("반환 문자열 전체에 금지 표현이 포함되지 않는다", () => {
    const result = generateTemplateReport({
      drivingRisk: makeDrivingRisk("HIGH", 85),
      transit: makeTransit(),
    });
    const text = JSON.stringify(result);
    expect(text).not.toContain("사고 확률");
    expect(text).not.toContain("예측 확률");
    expect(text).not.toContain("probability");
    expect(text).not.toContain("반드시 반납");
    expect(text).not.toContain("운전 금지");
    expect(text).not.toContain("실시간 혼잡도");
  });

  it("HIGH 등급에서 면허 반납을 강요하는 표현이 포함되지 않는다", () => {
    const result = generateTemplateReport({ drivingRisk: makeDrivingRisk("HIGH", 85) });
    const text = JSON.stringify(result);
    expect(text).not.toContain("반드시 반납");
    expect(text).not.toContain("반납해야");
    expect(text).not.toContain("운전 금지");
    expect(text).not.toContain("운전하지 마");
  });
});
