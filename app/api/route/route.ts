import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { getTransitRoute } from "@/lib/odsay";

// GET — health / mock 응답
export async function GET() {
  return Response.json({
    ok: true,
    mode: "MOCK",
    message: "대중교통 경로 Mock 데이터입니다. POST /api/route로 실제 ODsay 조회를 사용하세요.",
    data: sampleRoute,
  });
}

// POST — ODsay 대중교통 경로 조회. 실패 시 sampleRoute fallback 반환.
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      origin?: { lat?: number; lng?: number };
      destination?: { lat?: number; lng?: number };
    };

    const result = await getTransitRoute({
      originLat: body.origin?.lat ?? 0,
      originLng: body.origin?.lng ?? 0,
      destinationLat: body.destination?.lat ?? 0,
      destinationLng: body.destination?.lng ?? 0,
    });

    return Response.json({
      ok: true,
      mode: "ODSAY_OR_FALLBACK",
      data: result.transit,
      meta: {
        source: result.source,
        fallback: !result.ok,
        ...(!result.ok && { reason: result.reason }),
      },
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "ODSAY_OR_FALLBACK",
      data: sampleRoute,
      meta: { source: "FALLBACK", fallback: true, reason: "request parse error" },
    });
  }
}
