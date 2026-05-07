// SERVER ONLY — ANTHROPIC_API_KEY는 서버에서만 사용. 클라이언트 컴포넌트에서 import 금지.
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, ReportContent } from "@/types";
import { generateTemplateReportFromAnalysis } from "./generateTemplateReport";
import { normalizeClaudeReport } from "./normalizeClaudeReport";
import { validateReportContent } from "./reportSafety";

export type ClaudeReportInput = {
  analysis: AnalysisResult;
};

export type ClaudeReportResult =
  | { ok: true; report: ReportContent; source: "CLAUDE" }
  | { ok: false; report: ReportContent; source: "TEMPLATE"; reason: string };

const CLAUDE_TIMEOUT_MS = 15_000;
const MODEL = "claude-haiku-4-5-20251001";

function buildPrompt(analysis: AnalysisResult): string {
  const { request, drivingRisk, transit, weather } = analysis;

  const routeText = `${request.origin.name ?? "출발지"} → ${request.destination.name ?? "도착지"}`;
  const factorText = drivingRisk.factors.slice(0, 3).map((f) => f.label).join(", ");
  const transitText = transit.available && transit.route
    ? `대중교통: 약 ${transit.route.totalDurationMin}분, 환승 ${transit.route.transferCount}회`
    : "대중교통 경로 없음";
  const weatherText = weather
    ? `기상: ${weather.label}`
    : "";

  return `당신은 고령 운전자의 이동 의사결정을 돕는 따뜻한 가족 안내 AI입니다.
아래 분석 데이터를 바탕으로, 자녀가 부모님께 드리는 따뜻한 이동 안내 리포트를 한국어로 작성해주세요.

분석 데이터:
- 이동 경로: ${routeText}
- 연령대: ${request.ageGroup ?? "미지정"}
- 운전 위험 지수: ${drivingRisk.score}점 (${drivingRisk.label})
- 주요 고려 요인: ${factorText || "없음"}
- ${transitText}
- ${weatherText}

반드시 지켜야 할 원칙:
1. 위험도는 반드시 "운전 위험 지수"로만 표현한다. "사고 확률", "예측 확률" 표현 금지.
2. 혼잡도는 "과거 패턴 기반 예측형 혼잡도"로만 표현한다.
3. "운전 금지", "반드시 반납" 같은 강압적 표현 금지.
4. 이 분석은 의사결정 보조 안내이지 실제 사고 가능성을 의미하지 않는다고 명시한다.

【familyMessage 작성 특별 지침】
- 자녀가 부모님께 직접 전하는 따뜻한 문자 메시지처럼 써주세요
- 데이터 수치를 나열하지 말고, 마음이 담긴 말로 표현하세요
- "걱정 마시고", "편하게", "안전하게" 같은 감성 표현 적극 활용
- 2~3문장, 구어체 존댓말 (예: "~해보세요", "~어떠세요?", "~드릴게요")
- 부모님의 자립심을 존중하면서도 가족의 관심이 느껴지도록
- 예시 느낌: "오늘 이동 잘 준비되셨어요? 지하철 타시면 훨씬 편하실 것 같아요. 출발하시기 전에 연락 한 번 주세요~"

아래 JSON 형식으로만 응답해주세요:
{
  "title": "리포트 제목 (한 줄, 50자 이내, 따뜻하고 긍정적인 톤)",
  "summary": "핵심 요약 (한 줄, 80자 이내, 안심시키는 톤)",
  "recommendation": "권장 행동 안내 (2~3문장, 데이터 기반이지만 따뜻하게)",
  "body": "상세 안내 본문 (3~5문장)",
  "familyMessage": "자녀가 부모님께 보내는 따뜻한 메시지 (2~3문장, 구어체 존댓말, 감성적으로)"
}`;
}

function fallback(analysis: AnalysisResult, reason: string): ClaudeReportResult {
  return {
    ok: false,
    report: generateTemplateReportFromAnalysis(analysis),
    source: "TEMPLATE",
    reason,
  };
}

export async function generateClaudeReport(input: ClaudeReportInput): Promise<ClaudeReportResult> {
  const { analysis } = input;
  const startMs = Date.now();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[SilverWay] generateClaudeReport: ANTHROPIC_API_KEY_MISSING");
    return fallback(analysis, "ANTHROPIC_API_KEY_MISSING");
  }

  try {
    const client = new Anthropic({ apiKey });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS);

    let rawText: string;
    try {
      const message = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: "user", content: buildPrompt(analysis) }],
        },
        { signal: controller.signal }
      );

      const block = message.content[0];
      rawText = block.type === "text" ? block.text : "";
    } finally {
      clearTimeout(timer);
    }

    if (!rawText) {
      console.error("[SilverWay] generateClaudeReport: CLAUDE_EMPTY_RESPONSE (%dms)", Date.now() - startMs);
      return fallback(analysis, "CLAUDE_EMPTY_RESPONSE");
    }

    const normalized = normalizeClaudeReport(rawText);
    if (!normalized) {
      console.error("[SilverWay] generateClaudeReport: CLAUDE_PARSE_ERROR (%dms)", Date.now() - startMs);
      return fallback(analysis, "CLAUDE_PARSE_ERROR");
    }

    const validation = validateReportContent(normalized);
    if (!validation.ok) {
      console.error("[SilverWay] generateClaudeReport: CLAUDE_SAFETY_FAILURE reason=%s (%dms)", validation.reason, Date.now() - startMs);
      return fallback(analysis, "CLAUDE_SAFETY_FAILURE");
    }

    console.info("[SilverWay] generateClaudeReport: ok source=CLAUDE (%dms)", Date.now() - startMs);
    return { ok: true, report: normalized, source: "CLAUDE" };
  } catch (err: unknown) {
    let reason = "CLAUDE_FETCH_FAILED";
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        reason = "CLAUDE_TIMEOUT";
      } else {
        const status = (err as { status?: number }).status;
        if (typeof status === "number") {
          reason = `CLAUDE_HTTP_ERROR_STATUS_${status}`;
        }
      }
    }
    console.error("[SilverWay] generateClaudeReport: %s (%dms)", reason, Date.now() - startMs);
    return fallback(analysis, reason);
  }
}
