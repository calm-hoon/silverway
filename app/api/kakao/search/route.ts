import { searchPlace } from "@/lib/kakao/searchPlace";
import { samplePlaces } from "@/lib/fallback/samplePlaces";

function clampSize(raw: string | number | undefined): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (!isFinite(n) || n < 1) return 5;
  return Math.min(n, 10);
}

function buildResponse(query: string, size: number) {
  return searchPlace({ query: query.trim(), size });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // q와 query 둘 다 허용
  const query = (searchParams.get("q") ?? searchParams.get("query") ?? "").trim();
  const size = clampSize(searchParams.get("size") ?? undefined);

  if (!query) {
    return Response.json({
      ok: true,
      mode: "KAKAO_OR_FALLBACK",
      data: [],
      meta: { source: "FALLBACK", fallback: true, reason: "EMPTY_QUERY" },
    });
  }

  const result = await buildResponse(query, size);

  return Response.json({
    ok: true,
    mode: "KAKAO_OR_FALLBACK",
    data: result.places,
    meta: {
      source: result.ok ? "KAKAO_LOCAL" : "FALLBACK",
      fallback: !result.ok,
      reason: result.ok ? null : (result.reason ?? "UNKNOWN_KAKAO_ERROR"),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    // q와 query 둘 다 허용
    const query = String(body["query"] ?? body["q"] ?? "").trim();
    const size = clampSize(body["size"] as string | number | undefined);

    if (!query) {
      return Response.json({
        ok: true,
        mode: "KAKAO_OR_FALLBACK",
        data: [],
        meta: { source: "FALLBACK", fallback: true, reason: "EMPTY_QUERY" },
      });
    }

    const result = await buildResponse(query, size);

    return Response.json({
      ok: true,
      mode: "KAKAO_OR_FALLBACK",
      data: result.places,
      meta: {
        source: result.ok ? "KAKAO_LOCAL" : "FALLBACK",
        fallback: !result.ok,
        reason: result.ok ? null : (result.reason ?? "UNKNOWN_KAKAO_ERROR"),
      },
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "KAKAO_OR_FALLBACK",
      data: samplePlaces.slice(0, 3),
      meta: { source: "FALLBACK", fallback: true, reason: "KAKAO_API_PARSE_ERROR" },
    });
  }
}
