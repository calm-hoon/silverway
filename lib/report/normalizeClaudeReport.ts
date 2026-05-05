import type { ReportContent } from "@/types";
import { containsForbiddenReportTerms, sanitizeReportText, validateReportContent } from "./reportSafety";

const MAX_FAMILY_MESSAGE_LEN = 200;

export function normalizeClaudeReport(rawText: string): ReportContent | null {
  if (!rawText || typeof rawText !== "string") return null;

  let parsed: Record<string, unknown> | null = null;

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      // 파싱 실패 시 raw text 경로로 진행
    }
  }

  let title: string;
  let body: string;
  let summary: string;
  let recommendation: string;
  let familyMessage: string;

  if (parsed) {
    title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    body = typeof parsed.body === "string" ? parsed.body.trim() : "";
    summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    recommendation = typeof parsed.recommendation === "string" ? parsed.recommendation.trim() : "";
    familyMessage = typeof parsed.familyMessage === "string" ? parsed.familyMessage.trim() : "";
  } else {
    // JSON 파싱 실패 시 raw text를 body로 사용
    body = rawText.trim().slice(0, 1000);
    title = "이동 분석 결과를 확인해보세요";
    summary = "이동 조건을 분석했습니다.";
    recommendation = "출발 전 날씨와 컨디션을 확인하신 후 안전하게 이동하세요.";
    familyMessage = "이동 분석이 완료되었습니다. 이동 전 컨디션과 날씨를 함께 확인해보면 좋겠습니다.";
  }

  if (!title || !body) return null;
  if (!familyMessage) return null;

  // sanitize 가능한 표현 보정
  title = sanitizeReportText(title);
  body = sanitizeReportText(body);
  summary = sanitizeReportText(summary);
  recommendation = sanitizeReportText(recommendation);
  familyMessage = sanitizeReportText(familyMessage);

  // familyMessage 길이 제한
  if (familyMessage.length > MAX_FAMILY_MESSAGE_LEN) {
    familyMessage = familyMessage.slice(0, MAX_FAMILY_MESSAGE_LEN).trimEnd() + "…";
  }

  const report: ReportContent = {
    title,
    body,
    summary: summary || "이동 조건을 분석했습니다.",
    recommendation: recommendation || "출발 전 날씨와 컨디션을 확인하신 후 안전하게 이동하세요.",
    familyMessage,
    dataSources: ["Claude AI 생성 리포트"],
    generatedBy: "CLAUDE",
    cautions: ["이 내용은 의사결정 보조용 안내이며, 실제 사고 가능성을 의미하지 않습니다."],
  };

  // 금지 표현이 남아 있으면 null 처리
  const combined = [title, body, summary, recommendation, familyMessage].join(" ");
  if (containsForbiddenReportTerms(combined)) return null;

  const validation = validateReportContent(report);
  if (!validation.ok) return null;

  return report;
}
