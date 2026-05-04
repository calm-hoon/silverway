// 기상 조건 Mock API — 실제 기상청 단기예보 조회서비스 연동은 아직 없음
import { sampleWeather } from "@/lib/fallback/sampleWeather";

export async function GET() {
  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "기상 조건 Mock 데이터입니다. 실제 기상청 API는 아직 연동되지 않았습니다.",
    data: sampleWeather,
  });
}
