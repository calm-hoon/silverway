import { describe, it, expect } from "vitest";
import { saveAnalysisLog, getAnalysisLogById } from "@/lib/supabase/analysisLogs";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

// 금지 표현 목록
const FORBIDDEN = [
  "사고 확률",
  "예측 확률",
  "probability",
  "실시간 혼잡도",
  "운전 금지",
  "반드시 반납",
];

function collectFallbackText(result: Awaited<ReturnType<typeof getAnalysisLogById>>): string {
  const data = result.ok ? result.result : result.fallback;
  // drivingRisk.description은 필수 면책 문구이므로 제외
  return [
    data.summary.oneLiner,
    data.report.title,
    data.report.summary,
    data.report.recommendation,
    data.report.familyMessage,
    data.transit.congestion?.description ?? "",
    ...data.drivingRisk.factors.map((f) => f.description),
    ...(data.report.cautions ?? []),
  ].join(" ");
}

describe("saveAnalysisLog", () => {
  it("환경변수 없이 호출해도 throw하지 않는다", async () => {
    await expect(saveAnalysisLog(sampleAnalysis)).resolves.not.toThrow();
  });

  it("환경변수 없으면 ok: false를 반환한다", async () => {
    const result = await saveAnalysisLog(sampleAnalysis);
    expect(result.ok).toBe(false);
  });

  it("ok: false일 때 fallback으로 전달한 result를 그대로 반환한다", async () => {
    const result = await saveAnalysisLog(sampleAnalysis);
    if (!result.ok) {
      expect(result.fallback.id).toBe(sampleAnalysis.id);
    }
  });

  it("ok: false일 때 reason이 SAVE_FAILED다", async () => {
    const result = await saveAnalysisLog(sampleAnalysis);
    if (!result.ok) {
      expect(result.reason).toBe("SAVE_FAILED");
    }
  });

  it("ok: false 응답 문자열에 service role key가 포함되지 않는다", async () => {
    const result = await saveAnalysisLog(sampleAnalysis);
    const text = JSON.stringify(result);
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (key) expect(text).not.toContain(key);
    expect(text).not.toContain("service_role");
    expect(text).not.toContain("SERVICE_ROLE");
  });
});

describe("getAnalysisLogById", () => {
  it("환경변수 없이 호출해도 throw하지 않는다", async () => {
    await expect(getAnalysisLogById("any-id")).resolves.not.toThrow();
  });

  it("빈 id를 넣어도 throw하지 않는다", async () => {
    await expect(getAnalysisLogById("")).resolves.not.toThrow();
  });

  it("빈 id는 source: FALLBACK을 반환한다", async () => {
    const result = await getAnalysisLogById("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
      expect(result.reason).toBe("INVALID_ID");
    }
  });

  it("환경변수 없으면 source: FALLBACK을 반환한다", async () => {
    const result = await getAnalysisLogById("some-uuid");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
    }
  });

  it("fallback result의 위험 지수 설명에 '운전 위험 지수' 표현이 포함된다", async () => {
    const result = await getAnalysisLogById("check-risk-label");
    const data = result.ok ? result.result : result.fallback;
    expect(data.drivingRisk.description).toContain("운전 위험 지수");
  });

  it("fallback result의 혼잡도 설명에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", async () => {
    const result = await getAnalysisLogById("check-congestion");
    const data = result.ok ? result.result : result.fallback;
    expect(data.transit.congestion?.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("fallback result의 주요 텍스트 필드에 금지 표현이 없다", async () => {
    const result = await getAnalysisLogById("check-forbidden");
    const text = collectFallbackText(result);
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });

  it("이상한 id여도 throw하지 않는다", async () => {
    await expect(getAnalysisLogById("!@#$%^&*()")).resolves.not.toThrow();
    await expect(getAnalysisLogById("a".repeat(500))).resolves.not.toThrow();
    await expect(getAnalysisLogById("   ")).resolves.not.toThrow();
  });

  it("조회 실패 시 reason이 RESULT_NOT_FOUND다", async () => {
    const result = await getAnalysisLogById("nonexistent-id");
    if (!result.ok) {
      expect(result.reason).toBe("RESULT_NOT_FOUND");
    }
  });

  it("조회 실패 응답 문자열에 service role key가 포함되지 않는다", async () => {
    const result = await getAnalysisLogById("some-id");
    const text = JSON.stringify(result);
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (key) expect(text).not.toContain(key);
    expect(text).not.toContain("service_role");
  });
});
