// SERVER ONLY — ANTHROPIC_API_KEY는 서버에서만 사용. 클라이언트 컴포넌트에서 import 금지.
// 하루 중 여러 시간대의 운전 위험 지수·혼잡도·날씨를 실제로 비교한 뒤, Claude가
// 데이터를 근거로 "언제 출발하는 게 가장 부담이 적은지" 추천한다. AI가 텍스트를
// 다듬는 역할을 넘어 실제 추천(의사결정)에 관여하도록 설계된 기능이다.
import Anthropic from "@anthropic-ai/sdk";
import type { AgeGroup, TimeRecommendation, TimeSlotOption } from "@/types";
import { containsForbiddenReportTerms } from "./reportSafety";

const CLAUDE_TIMEOUT_MS = 10_000;
const MODEL = "claude-haiku-4-5-20251001";

export type TimeRecommendationContext = {
  originName?: string;
  destinationName?: string;
  ageGroup?: AgeGroup;
};

function pickLowestScoreSlot(slots: TimeSlotOption[]): TimeSlotOption {
  return slots.reduce((best, s) => (s.score < best.score ? s : best), slots[0]);
}

function buildTemplateReason(best: TimeSlotOption, slots: TimeSlotOption[]): string {
  const worst = slots.reduce((w, s) => (s.score > w.score ? s : w), slots[0]);
  const diff = worst.score - best.score;
  if (diff <= 0) {
    return "오늘 하루 시간대별 운전 위험 지수 차이가 크지 않아, 편하신 시간에 출발하셔도 큰 차이가 없습니다.";
  }
  return `${best.label} 무렵이 다른 시간대보다 운전 위험 지수가 최대 ${diff}점 낮게 나타나 상대적으로 여유 있는 시간대입니다.`;
}

/** Claude 없이(또는 실패 시) 최저 점수 슬롯을 고르는 규칙 기반 추천. 오프라인 mock 경로에서도 재사용한다. */
export function templateRecommendation(slots: TimeSlotOption[]): TimeRecommendation {
  if (slots.length === 0) {
    return {
      recommendedHour: 10,
      recommendedLabel: "오전 10시",
      reason: "시간대별 비교 데이터가 없어 기본 안내를 제공합니다.",
      slots: [],
      generatedBy: "TEMPLATE",
    };
  }

  const best = pickLowestScoreSlot(slots);
  return {
    recommendedHour: best.hour,
    recommendedLabel: best.label,
    reason: buildTemplateReason(best, slots),
    slots,
    generatedBy: "TEMPLATE",
  };
}

const AGE_LABEL: Record<AgeGroup, string> = { "60s": "60대", "70s": "70대", "80s": "80대 이상" };

function buildPrompt(slots: TimeSlotOption[], context: TimeRecommendationContext): string {
  const slotText = slots
    .map((s) => {
      const parts = [`운전 위험 지수 ${s.score}점(${s.level === "LOW" ? "낮음" : s.level === "MEDIUM" ? "보통" : "높음"})`];
      if (s.congestionLabel) parts.push(`혼잡도 ${s.congestionLabel}`);
      if (s.weatherLabel) parts.push(`날씨 ${s.weatherLabel}`);
      return `- ${s.label} (hour=${s.hour}): ${parts.join(", ")}`;
    })
    .join("\n");

  return `당신은 고령 운전자의 하루 시간대별 이동 데이터를 비교해, 오늘 중 가장 부담이 적은
출발 시간대를 추천하는 도우미입니다.

경로: ${context.originName ?? "출발지"} → ${context.destinationName ?? "도착지"}
연령대: ${context.ageGroup ? AGE_LABEL[context.ageGroup] : "정보 없음"}

시간대별 비교 데이터:
${slotText}

반드시 지켜야 할 원칙:
1. 위험도는 "운전 위험 지수"로만 표현한다. "사고 확률", "예측 확률" 표현 금지.
2. 혼잡도는 "과거 패턴 기반 예측형 혼잡도"로만 표현한다.
3. "운전하지 마세요", "면허 반납하세요", "위험합니다" 같은 표현을 쓰지 않는다.
4. 반드시 위 목록에 있는 hour 값 중 하나만 추천한다.
5. 추천 이유에는 실제 점수 차이를 근거로 든다.

아래 JSON 형식으로만 응답하세요:
{
  "recommendedHour": (추천 시간대의 hour 숫자, 위 목록의 값 중 하나),
  "reason": "추천 이유 (1~3문장)"
}`;
}

export async function generateTimeRecommendation(
  slots: TimeSlotOption[],
  context: TimeRecommendationContext
): Promise<TimeRecommendation> {
  if (slots.length === 0) return templateRecommendation(slots);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return templateRecommendation(slots);

  try {
    const client = new Anthropic({ apiKey });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS);

    let rawText: string;
    try {
      const message = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 300,
          messages: [{ role: "user", content: buildPrompt(slots, context) }],
        },
        { signal: controller.signal }
      );
      const block = message.content[0];
      rawText = block.type === "text" ? block.text : "";
    } finally {
      clearTimeout(timer);
    }

    if (!rawText) return templateRecommendation(slots);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return templateRecommendation(slots);

    let parsed: { recommendedHour?: unknown; reason?: unknown };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return templateRecommendation(slots);
    }

    const matchedSlot = slots.find((s) => s.hour === parsed.recommendedHour);
    if (!matchedSlot || typeof parsed.reason !== "string" || !parsed.reason.trim()) {
      return templateRecommendation(slots);
    }
    if (containsForbiddenReportTerms(parsed.reason)) {
      return templateRecommendation(slots);
    }

    return {
      recommendedHour: matchedSlot.hour,
      recommendedLabel: matchedSlot.label,
      reason: parsed.reason.trim(),
      slots,
      generatedBy: "CLAUDE",
    };
  } catch {
    return templateRecommendation(slots);
  }
}
