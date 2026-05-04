// Mock API — 실제 Kakao/ODsay/Weather/Claude/Supabase 연동 없이 동작
import { createMockAnalysisResult } from "@/lib/fallback/createMockAnalysisResult";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import { saveAnalysisLog } from "@/lib/supabase/analysisLogs";
import type { AnalysisRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: Partial<AnalysisRequest> = {};
    try {
      body = await request.json();
    } catch {
      // body 파싱 실패 시 빈 객체로 진행 — fallback 값이 적용됨
    }

    const mock = createMockAnalysisResult(body);
    const saveResult = await saveAnalysisLog(mock.data);

    if (saveResult.ok) {
      return Response.json({
        ok: true,
        mode: "MOCK_WITH_STORAGE",
        data: saveResult.result,
        resultId: saveResult.id,
        message: "Mock 분석 결과를 반환했습니다.",
        meta: { stored: true, storageSource: "SUPABASE" },
        fallbackFlags: mock.fallbackFlags,
      });
    }

    return Response.json({
      ok: true,
      mode: "MOCK_WITH_STORAGE_FALLBACK",
      data: mock.data,
      resultId: mock.data.id,
      message: "저장 연결이 없어 Mock 결과를 반환했습니다.",
      meta: { stored: false, storageSource: "FALLBACK", reason: saveResult.reason },
      fallbackFlags: mock.fallbackFlags,
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "MOCK_WITH_STORAGE_FALLBACK",
      data: sampleAnalysis,
      resultId: "test",
      message: "오류가 발생해 기본 분석 결과를 반환했습니다.",
      meta: { stored: false, storageSource: "FALLBACK" },
      fallbackFlags: { analysis: true, route: true, weather: true, report: true },
    });
  }
}
