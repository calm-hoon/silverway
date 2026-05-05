import { sampleWeather } from "@/lib/fallback/sampleWeather";
import { getWeatherRisk } from "@/lib/weather";

// GET — 대전 기본 위치 기준 날씨 조회
export async function GET() {
  const result = await getWeatherRisk();

  return Response.json({
    ok: true,
    mode: "KMA_OR_FALLBACK",
    data: result.weather,
    meta: {
      source: result.source,
      fallback: !result.ok,
      ...(!result.ok && { reason: result.reason }),
    },
  });
}

// POST — body의 lat/lng 기준 날씨 조회
export async function POST(request: Request) {
  try {
    const body = await request.json() as { lat?: number; lng?: number };
    const result = await getWeatherRisk({ lat: body.lat, lng: body.lng });

    return Response.json({
      ok: true,
      mode: "KMA_OR_FALLBACK",
      data: result.weather,
      meta: {
        source: result.source,
        fallback: !result.ok,
        ...(!result.ok && { reason: result.reason }),
      },
    });
  } catch {
    return Response.json({
      ok: true,
      mode: "KMA_OR_FALLBACK",
      data: sampleWeather,
      meta: { source: "FALLBACK", fallback: true, reason: "request parse error" },
    });
  }
}
