import { describe, it, expect } from "vitest";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { sampleWeather } from "@/lib/fallback/sampleWeather";
import { generateTemplateReport, generateTemplateReportFromAnalysis } from "@/lib/report/generateTemplateReport";
import { FORBIDDEN_REPORT_TERMS, containsForbiddenReportTerms } from "@/lib/report/reportSafety";
import { createFallbackAnalysis } from "@/lib/fallback/createFallbackAnalysis";

// 서비스 표현 원칙 위반 감지 테스트
// 금지 표현: 사고 확률, 예측 확률, probability, 실시간 혼잡도, 운전 금지, 반드시 반납 등

const FORBIDDEN = [
  "사고 확률",
  "예측 확률",
  "probability",
  "accident probability",
  "prediction probability",
  "실시간 혼잡도",
  "realtime congestion",
  "live congestion",
  "운전 금지",
  "반드시 반납",
];

function checkNoForbidden(text: string, label: string) {
  for (const term of FORBIDDEN) {
    expect(text.toLowerCase(), `"${label}"에서 금지 표현 발견: "${term}"`).not.toContain(
      term.toLowerCase()
    );
  }
}

describe("sampleAnalysis 표현 원칙", () => {
  it("전체 문자열에 금지 표현이 없다", () => {
    checkNoForbidden(JSON.stringify(sampleAnalysis), "sampleAnalysis");
  });

  it('"운전 위험 지수" 표현이 포함된다', () => {
    expect(JSON.stringify(sampleAnalysis)).toContain("운전 위험 지수");
  });

  it('"과거 패턴 기반 예측형 혼잡도" 표현이 포함된다', () => {
    expect(JSON.stringify(sampleAnalysis)).toContain("과거 패턴 기반 예측형 혼잡도");
  });
});

describe("sampleRoute 표현 원칙", () => {
  it("전체 문자열에 금지 표현이 없다", () => {
    checkNoForbidden(JSON.stringify(sampleRoute), "sampleRoute");
  });

  it('"과거 패턴 기반 예측형 혼잡도" 표현이 포함된다', () => {
    expect(JSON.stringify(sampleRoute)).toContain("과거 패턴 기반 예측형 혼잡도");
  });
});

describe("sampleWeather 표현 원칙", () => {
  it("전체 문자열에 금지 표현이 없다", () => {
    checkNoForbidden(JSON.stringify(sampleWeather), "sampleWeather");
  });

  it('"운전 위험 지수" 표현이 포함된다', () => {
    expect(JSON.stringify(sampleWeather)).toContain("운전 위험 지수");
  });
});

describe("generateTemplateReport 표현 원칙", () => {
  it("기본 입력 결과에 금지 표현이 없다", () => {
    const report = generateTemplateReport({});
    checkNoForbidden(JSON.stringify(report), "generateTemplateReport 기본");
  });

  it("HIGH 레벨 결과에 금지 표현이 없다", () => {
    const report = generateTemplateReport({
      drivingRisk: { score: 85, level: "HIGH", label: "높음", factors: [], description: "운전 위험 지수 높음" },
    });
    checkNoForbidden(JSON.stringify(report), "generateTemplateReport HIGH");
  });

  it("sampleAnalysis 기반 결과에 금지 표현이 없다", () => {
    const report = generateTemplateReportFromAnalysis(sampleAnalysis);
    checkNoForbidden(JSON.stringify(report), "generateTemplateReportFromAnalysis");
  });

  it("사용자 facing 문구에 '운전 위험 지수'가 포함된다", () => {
    const report = generateTemplateReport({
      drivingRisk: { score: 62, level: "MEDIUM", label: "보통", factors: [], description: "" },
    });
    const text = JSON.stringify(report);
    expect(text).toContain("운전 위험 지수");
  });

  it("혼잡도 문구에 '과거 패턴 기반 예측형 혼잡도'가 포함된다", () => {
    const report = generateTemplateReport({
      transit: {
        available: true,
        route: { totalDurationMin: 26, transferCount: 0, steps: [] },
        congestion: { level: "MEDIUM", label: "보통", description: "" },
      },
    });
    expect(JSON.stringify(report)).toContain("과거 패턴 기반 예측형 혼잡도");
  });
});

describe("createFallbackAnalysis 표현 원칙", () => {
  it("결과 전체에 금지 표현이 없다", () => {
    const result = createFallbackAnalysis();
    checkNoForbidden(JSON.stringify(result), "createFallbackAnalysis");
  });
});

describe("FORBIDDEN_REPORT_TERMS 목록", () => {
  it("금지 표현 목록이 비어 있지 않다", () => {
    expect(FORBIDDEN_REPORT_TERMS.length).toBeGreaterThan(0);
  });

  it("containsForbiddenReportTerms가 금지 표현을 감지한다", () => {
    expect(containsForbiddenReportTerms("이것은 사고 확률이 높습니다")).toBe(true);
    expect(containsForbiddenReportTerms("운전 위험 지수를 확인하세요")).toBe(false);
  });
});
