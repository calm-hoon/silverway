import { searchPlace } from "@/lib/kakao/searchPlace";
import { samplePlaces } from "@/lib/fallback/samplePlaces";
import type { KakaoPlaceSearchRequest } from "@/lib/kakao/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<KakaoPlaceSearchRequest>;
    const result = await searchPlace({
      query: body.query ?? "",
      size: body.size,
      page: body.page,
    });

    return Response.json({
      ok: true,
      mode: "KAKAO_OR_FALLBACK",
      data: result.places,
      meta: {
        source: result.source,
        fallback: !result.ok,
        ...(!result.ok && { reason: result.reason }),
      },
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "KAKAO_OR_FALLBACK",
      data: samplePlaces.slice(0, 3),
      meta: { source: "FALLBACK", fallback: true, reason: "request parse error" },
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const size = searchParams.get("size");

  const result = await searchPlace({
    query,
    size: size ? parseInt(size, 10) : 5,
  });

  return Response.json({
    ok: true,
    mode: "KAKAO_OR_FALLBACK",
    data: result.places,
    meta: {
      source: result.source,
      fallback: !result.ok,
      ...(!result.ok && { reason: result.reason }),
    },
  });
}
