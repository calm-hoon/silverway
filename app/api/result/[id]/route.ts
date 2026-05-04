// 분석 결과 조회 API — Supabase 조회 시도 후 실패 시 fallback 반환
import { getAnalysisLogById } from "@/lib/supabase/analysisLogs";

type ResultApiContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ResultApiContext) {
  const { id } = await params;
  const result = await getAnalysisLogById(id);

  if (result.ok) {
    return Response.json({
      ok: true,
      mode: "RESULT_LOOKUP",
      data: result.result,
      message: "결과를 반환했습니다.",
      meta: { requestedId: id, source: result.source, fallback: false },
    });
  }

  return Response.json({
    ok: true,
    mode: "RESULT_LOOKUP_FALLBACK",
    data: result.fallback,
    message: "저장된 결과를 찾지 못해 예시 결과를 반환했습니다.",
    meta: { requestedId: id, source: result.source, fallback: true },
  });
}
