// SERVER ONLY — WEATHER_API_KEY를 읽습니다. 클라이언트 컴포넌트에서 import 금지.
// 기상청 단기예보 원본 JSON을 좌표 기준으로 가져오는 공용 fetch 함수.
// numOfRows=290은 여러 날짜·시간대의 예보를 한 번에 포함하므로, 이 원본 응답 하나로
// getWeatherRisk(단일 시각)와 getWeatherRiskForSlots(여러 시각 비교) 양쪽에서 재사용한다.
import { convertLatLngToGrid, DAEJEON_GRID } from "./convertGrid";

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

export type FetchKmaResult =
  | { ok: true; raw: unknown }
  | { ok: false; reason: string };

export async function fetchKmaForecast(lat?: number, lng?: number): Promise<FetchKmaResult> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "WEATHER_API_KEY missing" };
  }

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
      return { ok: false, reason: `HTTP ${res.status}` };
    }

    const json = await res.json() as unknown;
    return { ok: true, raw: json };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { ok: false, reason };
  }
}
