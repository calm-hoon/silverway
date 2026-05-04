// 대중교통 경로 Mock API — 실제 ODsay 연동은 아직 없음
import { sampleRoute } from "@/lib/fallback/sampleRoute";

export async function GET() {
  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "대중교통 경로 Mock 데이터입니다. 실제 ODsay API는 아직 연동되지 않았습니다.",
    data: sampleRoute,
  });
}
