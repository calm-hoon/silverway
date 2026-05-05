import { sampleRoute } from "@/lib/fallback/sampleRoute";
import { getTransitRoute } from "@/lib/odsay";

function toFiniteNumber(v: unknown): number | null {
  const n = Number(v);
  return isFinite(n) && n !== 0 ? n : null;
}

// GET — health / sample 응답
export async function GET() {
  return Response.json({
    ok: true,
    mode: "SAMPLE",
    message: "대중교통 경로 예시 데이터입니다. POST /api/route로 실제 ODsay 조회를 사용하세요.",
    data: sampleRoute,
  });
}

// POST — ODsay 대중교통 경로 조회. 실패 시 sampleRoute fallback 반환.
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      origin?: { lat?: unknown; lng?: unknown };
      destination?: { lat?: unknown; lng?: unknown };
    };

    const originLat = toFiniteNumber(body.origin?.lat);
    const originLng = toFiniteNumber(body.origin?.lng);
    const destinationLat = toFiniteNumber(body.destination?.lat);
    const destinationLng = toFiniteNumber(body.destination?.lng);

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return Response.json({
        ok: true,
        mode: "ODSAY_OR_FALLBACK",
        data: sampleRoute,
        meta: { source: "FALLBACK", fallback: true, reason: "INVALID_COORDINATES" },
      });
    }

    const result = await getTransitRoute({ originLat, originLng, destinationLat, destinationLng });

    return Response.json({
      ok: true,
      mode: "ODSAY_OR_FALLBACK",
      data: result.transit,
      meta: {
        source: result.ok ? "ODSAY" : "FALLBACK",
        fallback: !result.ok,
        reason: result.ok ? null : (result.reason ?? "UNKNOWN_ODSAY_ERROR"),
      },
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "ODSAY_OR_FALLBACK",
      data: sampleRoute,
      meta: { source: "FALLBACK", fallback: true, reason: "ODSAY_API_PARSE_ERROR" },
    });
  }
}
