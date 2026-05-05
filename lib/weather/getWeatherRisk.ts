// SERVER ONLY — WEATHER_API_KEY를 읽습니다. 클라이언트 컴포넌트에서 import 금지.
import { sampleWeather } from "@/lib/fallback/sampleWeather";
import { convertLatLngToGrid, DAEJEON_GRID } from "./convertGrid";
import { normalizeWeatherForecast } from "./normalizeWeatherForecast";
import type { WeatherRiskRequest, WeatherRiskResult } from "./types";

const KMA_TIMEOUT_MS = 5000;
const KMA_BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

// 기상청 단기예보 base_time 목록 (시 단위)
const BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

function getBaseDatetime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  // KST = UTC + 9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hour = kst.getUTCHours();

  // 데이터 게시까지 약 10분 소요 → 1시간 여유 확보
  let selectedHour = -1;
  for (const h of BASE_HOURS) {
    if (hour >= h + 1) selectedHour = h;
  }

  let date = kst;
  if (selectedHour === -1) {
    // 03:00 KST 이전 → 전날 23:00 예보 사용
    selectedHour = 23;
    date = new Date(kst.getTime() - 24 * 60 * 60 * 1000);
  }

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");

  return {
    baseDate: `${y}${m}${d}`,
    baseTime: `${String(selectedHour).padStart(2, "0")}00`,
  };
}

function makeFallback(reason: string): WeatherRiskResult {
  return { ok: false, weather: sampleWeather, source: "FALLBACK", reason };
}

export async function getWeatherRisk(input?: WeatherRiskRequest): Promise<WeatherRiskResult> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return makeFallback("WEATHER_API_KEY missing");
  }

  // 격자 좌표 결정
  const lat = input?.lat;
  const lng = input?.lng;
  const { nx, ny } =
    lat != null && lng != null && isFinite(lat) && isFinite(lng)
      ? convertLatLngToGrid(lat, lng)
      : DAEJEON_GRID;

  const { baseDate, baseTime } = getBaseDatetime();

  // serviceKey는 공공데이터포털에서 이미 인코딩된 형태로 제공되므로 직접 조합
  const url =
    `${KMA_BASE_URL}?serviceKey=${apiKey}` +
    `&pageNo=1&numOfRows=290&dataType=JSON` +
    `&base_date=${baseDate}&base_time=${baseTime}` +
    `&nx=${nx}&ny=${ny}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), KMA_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return makeFallback(`HTTP ${res.status}`);
    }

    const json = await res.json() as unknown;

    const weather = normalizeWeatherForecast(json);
    if (!weather) {
      return makeFallback("no forecast data");
    }

    return { ok: true, weather, source: "KMA" };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return makeFallback(reason);
  }
}
