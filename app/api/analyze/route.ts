// Mock API — 실제 Kakao/ODsay/Weather/Claude/Supabase 연동 없이 동작
// 이후 실제 API 연동 시 createMockAnalysisResult 호출부를 교체한다.
import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { AnalysisRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: Partial<AnalysisRequest> = {};
    try {
      body = await request.json();
    } catch {
      // body 파싱 실패 시 빈 객체로 진행 — fallback 값이 적용됨
    }
    return Response.json(createMockAnalysisResult(body));
  } catch {
    // 계산 중 예외 발생 시 sampleAnalysis 기반 안전 fallback 반환
    return Response.json({
      ok: true,
      mode: "MOCK",
      data: sampleAnalysis,
      message: "오류가 발생해 기본 분석 결과를 반환했습니다.",
      fallbackFlags: { analysis: true, route: true, weather: true, report: true },
    });
  }
}
