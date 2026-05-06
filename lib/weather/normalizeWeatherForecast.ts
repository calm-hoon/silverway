import type { WeatherCondition, WeatherRisk } from "@/types";
import type { KmaForecastItem, KmaForecastResponse } from "./types";

function extractItems(raw: unknown): KmaForecastItem[] | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as KmaForecastResponse;
  const items = root.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;
  return items;
}

function slotKeyToUtcMs(key: string): number {
  // key = fcstDate(8) + fcstTime(4) = "YYYYMMDDHHMM" in KST
  const y = parseInt(key.slice(0, 4), 10);
  const mo = parseInt(key.slice(4, 6), 10) - 1;
  const d = parseInt(key.slice(6, 8), 10);
  const h = parseInt(key.slice(8, 10), 10);
  const mi = parseInt(key.slice(10, 12), 10);
  return Date.UTC(y, mo, d, h, mi) - 9 * 60 * 60 * 1000; // KST → UTC
}

function getTargetSlot(items: KmaForecastItem[], targetIso?: string): KmaForecastItem[] {
  const keys = [...new Set(items.map((i) => i.fcstDate + i.fcstTime))].sort();
  if (keys.length === 0) return [];

  let bestKey = keys[0];
  if (targetIso) {
    try {
      const targetMs = new Date(targetIso).getTime();
      let bestDiff = Infinity;
      for (const k of keys) {
        const diff = Math.abs(slotKeyToUtcMs(k) - targetMs);
        if (diff < bestDiff) { bestDiff = diff; bestKey = k; }
      }
    } catch { /* fall through to first slot */ }
  }

  return items.filter((i) => i.fcstDate + i.fcstTime === bestKey);
}

function getValue(slot: KmaForecastItem[], category: string): string | null {
  return slot.find((i) => i.category === category)?.fcstValue ?? null;
}

function mapCondition(pty: number, sky: number, wsd: number): { condition: WeatherCondition; label: string } {
  if (pty === 1 || pty === 4) {
    return wsd >= 9
      ? { condition: "HEAVY_RAIN", label: "강한 비" }
      : { condition: "RAIN", label: "비" };
  }
  if (pty === 2) return { condition: "RAIN", label: "비/눈" };
  if (pty === 3) return { condition: "SNOW", label: "눈" };
  if (sky === 1) return { condition: "CLEAR", label: "맑음" };
  if (sky === 3 || sky === 4) return { condition: "CLOUDY", label: "흐림" };
  return { condition: "UNKNOWN", label: "알 수 없음" };
}

// 0~100 운전 위험 지수 참고 기상 가중치 (실제 사고 가능성이 아님)
function calcRiskScore(pty: number, wsd: number, pop: number): number {
  let score = 0;

  if (pty === 1 || pty === 4) score += 40;     // 비/소나기
  else if (pty === 2) score += 50;              // 비/눈
  else if (pty === 3) score += 45;              // 눈

  if (wsd >= 14) score += 30;                   // 강풍
  else if (wsd >= 9) score += 20;               // 강한 바람
  else if (wsd >= 5) score += 10;               // 다소 강한 바람

  if (pop >= 70) score += 20;                   // 강수확률 높음
  else if (pop >= 40) score += 10;

  return Math.min(100, score);
}

function buildRiskNote(condition: WeatherCondition, riskScore: number): string {
  if (riskScore >= 75) {
    return "강한 비 또는 눈, 강한 바람 등 기상 조건이 운전 위험 지수에 상당한 가중치를 더합니다. 대중교통 이용도 고려해 보세요.";
  }
  if (riskScore >= 45) {
    return "비 또는 눈, 바람 등 기상 조건이 운전 위험 지수에 일부 가중치를 더합니다.";
  }
  if (condition === "CLEAR") {
    return "맑고 시야가 양호하여 기상 조건은 운전 위험 지수에 추가 가중치를 부여하지 않습니다.";
  }
  return "흐린 날씨로 기상 조건이 운전 위험 지수에 소폭 반영됩니다.";
}

// 기상청 단기예보 원본 응답 → WeatherRisk 변환. 파싱 실패 시 null 반환.
// targetIso: 출발 시각 ISO 8601 문자열 — 가장 가까운 예보 슬롯 선택에 사용.
export function normalizeWeatherForecast(raw: unknown, targetIso?: string): WeatherRisk | null {
  try {
    const items = extractItems(raw);
    if (!items) return null;

    // 기상청 응답 성공 여부 확인
    const root = raw as KmaForecastResponse;
    const resultCode = root.response?.header?.resultCode;
    if (resultCode && resultCode !== "00") return null;

    const slot = getTargetSlot(items, targetIso);
    if (slot.length === 0) return null;

    const pty = Number(getValue(slot, "PTY") ?? 0);
    const sky = Number(getValue(slot, "SKY") ?? 1);
    const wsd = Number(getValue(slot, "WSD") ?? 0);
    const pop = Number(getValue(slot, "POP") ?? 0);
    const tmpRaw = getValue(slot, "TMP");
    const temperatureCelsius = tmpRaw != null ? Number(tmpRaw) : null;

    const { condition, label } = mapCondition(pty, sky, wsd);
    const riskScore = calcRiskScore(pty, wsd, pop);
    const riskNote = buildRiskNote(condition, riskScore);

    return {
      condition,
      label,
      temperatureCelsius: isFinite(temperatureCelsius ?? NaN) ? temperatureCelsius : null,
      windSpeedMs: isFinite(wsd) ? wsd : null,
      riskNote,
      riskScore,
      source: "기상청 단기예보",
    };
  } catch {
    return null;
  }
}
