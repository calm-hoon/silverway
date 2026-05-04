// 분석 결과 조회 Mock API
// TODO: 작업 11.5에서 실제 Supabase 조회 구현 예정
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";

type ResultApiContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ResultApiContext) {
  const { id } = await params;

  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "Mock 분석 결과를 반환했습니다. 실제 Supabase 조회는 작업 11.5에서 구현됩니다.",
    meta: { requestedId: id },
    data: { ...sampleAnalysis, id: id === sampleAnalysis.id ? id : sampleAnalysis.id },
  });
}
