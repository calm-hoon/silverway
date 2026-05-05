import { generateClaudeReport } from "@/lib/report/generateClaudeReport";
import { generateTemplateReportFromAnalysis } from "@/lib/report/generateTemplateReport";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { AnalysisResult } from "@/types";

export async function POST(request: Request) {
  let analysis: AnalysisResult = sampleAnalysis;
  try {
    const body = await request.json() as { analysis?: Partial<AnalysisResult> };
    if (body.analysis && typeof body.analysis === "object") {
      analysis = { ...sampleAnalysis, ...body.analysis } as AnalysisResult;
    }
  } catch {
    // body 파싱 실패 시 sampleAnalysis 사용
  }

  const result = await generateClaudeReport({ analysis });

  return Response.json({
    ok: true,
    mode: "CLAUDE_OR_TEMPLATE",
    data: result.report,
    meta: {
      source: result.source,
      fallback: !result.ok,
      ...(!result.ok && { reason: result.reason }),
    },
  });
}
