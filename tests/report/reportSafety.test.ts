import { describe, it, expect } from "vitest";
import {
  containsForbiddenReportTerms,
  sanitizeReportText,
  validateReportContent,
  FORBIDDEN_REPORT_TERMS,
} from "@/lib/report/reportSafety";
import type { ReportContent } from "@/types";

const SAFE_REPORT: ReportContent = {
  title: "이동 조건을 함께 확인해보세요",
  summary: "운전 위험 지수 42점(보통) 수준입니다.",
  recommendation: "대중교통 대안도 함께 검토해보세요.",
  familyMessage: "오늘 이동 시 운전 위험 지수가 보통 수준입니다. 날씨를 함께 확인해보세요.",
  dataSources: ["공공데이터"],
  body: "운전 위험 지수 기반 분석 결과입니다. 과거 패턴 기반 예측형 혼잡도를 참고하세요.",
  generatedBy: "TEMPLATE",
};

describe("containsForbiddenReportTerms", () => {
  it("금지 표현이 포함된 문자열을 감지한다", () => {
    expect(containsForbiddenReportTerms("사고 확률이 높습니다")).toBe(true);
    expect(containsForbiddenReportTerms("예측 확률 기반 분석")).toBe(true);
    expect(containsForbiddenReportTerms("probability of accident")).toBe(true);
    expect(containsForbiddenReportTerms("운전 금지 구간입니다")).toBe(true);
    expect(containsForbiddenReportTerms("반드시 반납하세요")).toBe(true);
    expect(containsForbiddenReportTerms("실시간 혼잡도 정보")).toBe(true);
    expect(containsForbiddenReportTerms("realtime congestion")).toBe(true);
    expect(containsForbiddenReportTerms("live congestion data")).toBe(true);
  });

  it("안전한 리포트 문구는 통과한다", () => {
    expect(containsForbiddenReportTerms("운전 위험 지수 42점입니다")).toBe(false);
    expect(containsForbiddenReportTerms("대중교통을 검토해보세요")).toBe(false);
    expect(containsForbiddenReportTerms("가족과 함께 논의해보세요")).toBe(false);
  });

  it("면허 반납 강요 문구를 감지한다", () => {
    expect(containsForbiddenReportTerms("반드시 반납해야 합니다")).toBe(true);
  });

  it('"운전 위험 지수" 표현은 통과한다', () => {
    expect(containsForbiddenReportTerms("운전 위험 지수를 확인하세요")).toBe(false);
  });

  it('"과거 패턴 기반 예측형 혼잡도" 표현은 통과한다', () => {
    expect(containsForbiddenReportTerms("과거 패턴 기반 예측형 혼잡도 정보입니다")).toBe(false);
  });
});

describe("sanitizeReportText", () => {
  it('"실시간 혼잡도"를 "과거 패턴 기반 예측형 혼잡도"로 치환한다', () => {
    const result = sanitizeReportText("실시간 혼잡도 정보입니다");
    expect(result).toContain("과거 패턴 기반 예측형 혼잡도");
    expect(result).not.toContain("실시간 혼잡도");
  });

  it("안전한 문구는 변경하지 않는다", () => {
    const safe = "운전 위험 지수 42점입니다.";
    expect(sanitizeReportText(safe)).toBe(safe);
  });
});

describe("validateReportContent", () => {
  it("안전한 리포트는 ok true를 반환한다", () => {
    const result = validateReportContent(SAFE_REPORT);
    expect(result.ok).toBe(true);
  });

  it("금지 표현이 포함된 리포트는 ok false를 반환한다", () => {
    const bad: ReportContent = {
      ...SAFE_REPORT,
      body: "사고 확률이 높으니 주의하세요",
    };
    const result = validateReportContent(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("사고 확률");
    }
  });

  it("title이 비어 있으면 ok false를 반환한다", () => {
    const bad: ReportContent = { ...SAFE_REPORT, title: "" };
    const result = validateReportContent(bad);
    expect(result.ok).toBe(false);
  });

  it("familyMessage가 비어 있으면 ok false를 반환한다", () => {
    const bad: ReportContent = { ...SAFE_REPORT, familyMessage: "" };
    const result = validateReportContent(bad);
    expect(result.ok).toBe(false);
  });

  it("FORBIDDEN_REPORT_TERMS 목록이 비어 있지 않다", () => {
    expect(FORBIDDEN_REPORT_TERMS.length).toBeGreaterThan(0);
  });
});
