// SERVER ONLY — WEATHER_API_KEY를 읽습니다. 클라이언트 컴포넌트에서 import 금지.
import { sampleWeather } from "@/lib/fallback/sampleWeather";
import { fetchKmaForecast } from "./fetchKmaForecast";
import { normalizeWeatherForecast } from "./normalizeWeatherForecast";
import type { WeatherRiskRequest, WeatherRiskResult } from "./types";

function makeFallback(reason: string): WeatherRiskResult {
  return { ok: false, weather: sampleWeather, source: "FALLBACK", reason };
}

export async function getWeatherRisk(input?: WeatherRiskRequest): Promise<WeatherRiskResult> {
  const result = await fetchKmaForecast(input?.lat, input?.lng);
  if (!result.ok) {
    return makeFallback(result.reason);
  }

  const weather = normalizeWeatherForecast(result.raw, input?.baseDateTime);
  if (!weather) {
    return makeFallback("no forecast data");
  }

  return { ok: true, weather, source: "KMA" };
}
