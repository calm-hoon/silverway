import type { ReportContent } from "@/types";

export const FORBIDDEN_REPORT_TERMS = [
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

const SANITIZE_MAP: [RegExp, string][] = [
  [/실시간\s*혼잡도/g, "과거 패턴 기반 예측형 혼잡도"],
  [/realtime\s*congestion/gi, "과거 패턴 기반 예측형 혼잡도"],
  [/live\s*congestion/gi, "과거 패턴 기반 예측형 혼잡도"],
];

export function containsForbiddenReportTerms(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_REPORT_TERMS.some((term) => lower.includes(term.toLowerCase()));
}

export function sanitizeReportText(text: string): string {
  let result = text;
  for (const [pattern, replacement] of SANITIZE_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function validateReportContent(report: ReportContent): { ok: true } | { ok: false; reason: string } {
  const fields = [report.title, report.body ?? "", report.familyMessage, report.summary, report.recommendation];
  const combined = fields.join(" ");

  const found = FORBIDDEN_REPORT_TERMS.find((term) =>
    combined.toLowerCase().includes(term.toLowerCase())
  );
  if (found) {
    return { ok: false, reason: `금지 표현 포함: "${found}"` };
  }

  if (!report.title || !report.familyMessage) {
    return { ok: false, reason: "필수 필드 누락 (title 또는 familyMessage)" };
  }

  return { ok: true };
}
