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
  const { request, drivingRisk, transit, weather, summary } = analysis;

  const factorText = drivingRisk.factors.slice(0, 3).map((f) => f.label).join(", ");
  const transitText = transit.available && transit.route
    ? `약 ${transit.route.totalDurationMin}분, 환승 ${transit.route.transferCount}회`
    : "대중교통 경로 없음";
  const congestionText = transit.congestion?.label ?? "정보 없음";
  const recommendationText = summary.recommendDriving ? "운전 권장" : "대중교통 권장";
  const weatherText = weather?.label ?? "";

  return `당신은 40~50대 자녀가 고령 부모님께 보내는 따뜻한 편지를 대신 작성하는 도우미입니다.
분석 결과를 바탕으로 부모님께 운전 부담과 대중교통 대안을 부드럽게 전달하세요.

분석 데이터:
- 출발지: ${request.origin.name ?? "출발지"}
- 도착지: ${request.destination.name ?? "도착지"}
- 출발시간: ${request.departureTime}
- 운전 위험도: ${drivingRisk.score}/100
- 위험도 등급: ${drivingRisk.label}
- 위험 요인: ${factorText || "없음"}
- 대중교통 대안: ${transitText}
- 혼잡도: ${congestionText}
- 추천 판단: ${recommendationText}
- 기상: ${weatherText}

반드시 지켜야 할 원칙:
1. 위험도는 반드시 "운전 위험 지수"로만 표현한다. "사고 확률", "예측 확률" 표현 금지.
2. 혼잡도는 "과거 패턴 기반 예측형 혼잡도"로만 표현한다.
3. 이 분석은 의사결정 보조 안내이지 실제 사고 가능성을 의미하지 않는다고 명시한다.

아래 JSON 형식으로만 응답해주세요:
{
  "title": "리포트 제목 (한 줄, 50자 이내, 따뜻하고 긍정적인 톤)",
  "summary": "핵심 요약 (한 줄, 80자 이내, 안심시키는 톤)",
  "recommendation": "권장 행동 안내 (2~3문장, 데이터 기반이지만 따뜻하게)",
  "body": "상세 안내 본문 (3~5문장)",
  "familyMessage": "아래 규칙에 따라 작성한 편지 본문"
}

familyMessage 작성 규칙:
- "부모님께"로 시작하는 편지 형식, 존댓말
- 5~8문장
- "운전하지 마세요", "면허 반납하세요", "위험합니다" 표현 금지
- 부드러운 표현 사용: "운전 부담이 조금 큰 편이에요", "대중교통이 더 안전해 보여요"
- 면허 반납은 "이동 포기"가 아닌 "더 안전한 이동 방법 선택"으로 표현
- 자녀가 함께 챙기겠다는 문장 포함
- 마지막은 "사랑하는 가족이" 또는 "사랑을 담아"로 끝냄
- 편지 본문만 작성 (제목·날짜·서명란 제외)`;
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
