// 리포트 생성 Mock API — 실제 Claude API 연동은 아직 없음
import { generateTemplateReport } from "@/lib/report/generateTemplateReport";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { GenerateTemplateReportInput } from "@/lib/report/generateTemplateReport";

export async function POST(request: Request) {
  let input: GenerateTemplateReportInput = {};
  try {
    input = await request.json();
  } catch {
    // body 파싱 실패 시 sampleAnalysis 기반으로 리포트 생성
    input = {
      originName: sampleAnalysis.request.origin.name,
      destinationName: sampleAnalysis.request.destination.name,
      drivingRisk: sampleAnalysis.drivingRisk,
      transit: sampleAnalysis.transit,
      weather: sampleAnalysis.weather,
      departureTime: sampleAnalysis.request.departureTime,
      ageGroup: sampleAnalysis.request.ageGroup,
    };
  }

  const report = generateTemplateReport(input);
  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "템플릿 리포트를 생성했습니다. 실제 Claude API는 아직 연동되지 않았습니다.",
    data: report,
  });
}
