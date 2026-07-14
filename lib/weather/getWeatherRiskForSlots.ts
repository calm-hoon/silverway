// SERVER ONLY — WEATHER_API_KEY를 읽습니다. 클라이언트 컴포넌트에서 import 금지.
// 기상청 단기예보 원본 응답 하나(fetchKmaForecast)를 재사용해, 하루 중 여러 출발
// 시각의 기상 위험도를 추가 API 호출 없이 계산한다. (AI 최적 출발시간대 추천용)
import { fetchKmaForecast } from "./fetchKmaForecast";
import { normalizeWeatherForecast } from "./normalizeWeatherForecast";
import type { WeatherRisk } from "@/types";

export type WeatherSlotResult = { iso: string; weather: WeatherRisk | null };

export async function getWeatherRiskForSlots(params: {
  lat?: number;
  lng?: number;
  isoList: string[];
}): Promise<WeatherSlotResult[]> {
  const { lat, lng, isoList } = params;

  const result = await fetchKmaForecast(lat, lng);
  if (!result.ok) {
    return isoList.map((iso) => ({ iso, weather: null }));
  }

  return isoList.map((iso) => ({ iso, weather: normalizeWeatherForecast(result.raw, iso) }));
}
