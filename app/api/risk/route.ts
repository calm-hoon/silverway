// 운전 위험 지수 Mock API — 실제 공공데이터 연동은 아직 없음
import { calculateDrivingRisk } from "@/lib/risk/calculateDrivingRisk";

export async function GET() {
  const risk = calculateDrivingRisk({
    accidentArea: { riskScore: 62, sido: "대전광역시", sigungu: "서구", dong: "둔산동" },
    departureTime: new Date().toISOString(),
    ageGroup: "70s",
  });

  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "운전 위험 지수 샘플 결과입니다. 이 점수는 의사결정 보조용 운전 위험 지수입니다.",
    data: risk,
  });
}
