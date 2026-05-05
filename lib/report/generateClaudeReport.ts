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
  const congestionText = transit.congestion
    ? `혼잡도: ${transit.congestion.label} (과거 패턴 기반 예측형 혼잡도)`
    : "";
  const weatherText = weather
    ? `기상: ${weather.label}, 날씨 위험 지수 ${weather.riskScore ?? 0}`
    : "";

  return `당신은 고령 운전자의 이동 의사결정을 돕는 안내 보조 AI입니다.
아래 분석 데이터를 바탕으로 가족과 함께 공유할 수 있는 이동 안내 리포트를 한국어로 작성해주세요.

분석 데이터:
- 이동 경로: ${routeText}
- 출발 시간: ${request.departureTime ?? "미지정"}
- 연령대: ${request.ageGroup ?? "미지정"}
- 운전 위험 지수: ${drivingRisk.score}점 (${drivingRisk.label})
- 주요 위험 요인: ${factorText || "없음"}
- ${transitText}
- ${congestionText}
- ${weatherText}

반드시 지켜야 할 원칙:
1. 위험도는 반드시 "운전 위험 지수"로만 표현한다. "사고 확률", "예측 확률", "probability" 표현을 쓰지 않는다.
2. 혼잡도는 반드시 "과거 패턴 기반 예측형 혼잡도"로 표현한다. "실시간 혼잡도"는 쓰지 않는다.
3. 면허 반납을 강요하거나 "운전 금지", "반드시 반납" 같은 표현을 쓰지 않는다.
4. 공포감을 주는 문장 대신 차분하고 따뜻한 안내 문장으로 작성한다.
5. 이 분석은 의사결정 보조 안내이지 실제 사고 가능성을 의미하지 않는다고 명시한다.

아래 JSON 형식으로만 응답해주세요:
{
  "title": "리포트 제목 (한 줄, 50자 이내)",
  "summary": "핵심 요약 (한 줄, 80자 이내)",
  "recommendation": "권장 행동 안내 (2~3문장)",
  "body": "상세 안내 본문 (3~5문장)",
  "familyMessage": "가족에게 전달하는 메시지 (1~2문장, 100자 이내)"
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallback(analysis, "ANTHROPIC_API_KEY가 설정되지 않았습니다.");
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
      return fallback(analysis, "Claude 응답이 비어 있습니다.");
    }

    const normalized = normalizeClaudeReport(rawText);
    if (!normalized) {
      return fallback(analysis, "Claude 응답 정규화에 실패했습니다.");
    }

    const validation = validateReportContent(normalized);
    if (!validation.ok) {
      return fallback(analysis, `Claude 응답 안전 검사 실패: ${validation.reason}`);
    }

    return { ok: true, report: normalized, source: "CLAUDE" };
  } catch (err: unknown) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Claude API 타임아웃"
          : err.message
        : "Claude API 호출 오류";
    return fallback(analysis, reason);
  }
}
