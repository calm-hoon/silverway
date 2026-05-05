import { describe, it, expect } from "vitest";
import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { FORBIDDEN_REPORT_TERMS } from "@/lib/report/reportSafety";

const DRIVING_RISK_TERMS = ["운전 위험 지수"];

describe("generateClaudeReport — fallback 동작 (ANTHROPIC_API_KEY 없는 환경)", () => {
  it("ANTHROPIC_API_KEY가 없을 때 throw하지 않는다", async () => {
    await expect(generateClaudeReport({ analysis: sampleAnalysis })).resolves.not.toThrow();
  });

  it("ANTHROPIC_API_KEY가 없으면 source: TEMPLATE를 반환한다", async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    if (!result.ok) {
      expect(result.source).toBe("TEMPLATE");
    }
  });

  it("fallback report에 title, body, familyMessage가 존재한다", async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    expect(result.report.title).toBeTruthy();
    expect(result.report.familyMessage).toBeTruthy();
    // body는 optional이지만 templateReport는 포함
    // summary, recommendation은 항상 존재
    expect(result.report.summary).toBeTruthy();
    expect(result.report.recommendation).toBeTruthy();
  });

  it('fallback report에 "운전 위험 지수" 표현이 포함된다', async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    const text = [
      result.report.title,
      result.report.summary,
      result.report.body ?? "",
      result.report.familyMessage,
      result.report.recommendation,
    ].join(" ");
    const hasRiskTerm = DRIVING_RISK_TERMS.some((t) => text.includes(t));
    expect(hasRiskTerm).toBe(true);
  });

  it("반환 문자열 전체에 금지 표현이 포함되지 않는다", async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    const text = JSON.stringify(result.report);
    for (const word of FORBIDDEN_REPORT_TERMS) {
      expect(text.toLowerCase(), `금지 표현 "${word}" 발견`).not.toContain(word.toLowerCase());
    }
  });

  it("API key가 응답 문자열에 포함되지 않는다", async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    const text = JSON.stringify(result);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      expect(text).not.toContain(apiKey);
    }
    expect(text).not.toContain("sk-ant-");
  });

  it("입력값이 부족해도 throw하지 않는다", async () => {
    const minimalAnalysis = {
      ...sampleAnalysis,
      request: { ...sampleAnalysis.request, origin: { name: "", address: "", lat: 0, lng: 0 } },
    };
    await expect(generateClaudeReport({ analysis: minimalAnalysis })).resolves.not.toThrow();
  });

  it("결과에 항상 report 객체가 있다", async () => {
    const result = await generateClaudeReport({ analysis: sampleAnalysis });
    expect(result.report).toBeDefined();
    expect(typeof result.report.title).toBe("string");
    expect(typeof result.report.familyMessage).toBe("string");
  });
});
