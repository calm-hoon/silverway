import { type AnalysisResult } from "@/types";
import { sampleAnalysis } from "./sampleAnalysis";

/**
 * id를 받아 AnalysisResult Mock을 반환한다.
 * 빈 id나 이상한 id도 throw하지 않고 sampleAnalysis id를 fallback으로 사용한다.
 * 실제 Supabase 조회는 작업 11.5에서 구현 예정.
 */
export function createMockResultById(id?: string): AnalysisResult {
  const resolvedId = id?.trim() || sampleAnalysis.id;
  return {
    ...sampleAnalysis,
    id: resolvedId,
    fallbackFlags: {
      analysis: true,
      route: true,
      weather: true,
      report: true,
    },
  };
}
