import type { WeatherRisk } from "@/types";

/** 기상청 API 미연동 시 사용하는 날씨 fallback 데이터 — 대전 맑음 예시 */
export const sampleWeather: WeatherRisk = {
  condition: "CLEAR",
  label: "맑음",
  temperatureCelsius: 18,
  windSpeedMs: 2.1,
  riskNote:
    "현재 기상 조건은 운전 위험 지수에 추가 가중치를 부여하지 않습니다. " +
    "맑고 시야가 양호하나, 고령 운전자는 직사광선으로 인한 눈부심에 주의하세요.",
  source: "fallback — 실제 기상청 단기예보 미연동",
};
