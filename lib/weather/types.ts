import type { WeatherRisk } from "@/types";

export type WeatherRiskRequest = {
  lat?: number;
  lng?: number;
  baseDateTime?: string;
};

export type WeatherRiskResult =
  | { ok: true; weather: WeatherRisk; source: "KMA" }
  | { ok: false; weather: WeatherRisk; source: "FALLBACK"; reason: string };

export type WeatherCategory =
  | "TMP" | "POP" | "PTY" | "PCP" | "SNO" | "SKY" | "WSD"
  | string;

// 기상청 단기예보 item 최소 타입
export type KmaForecastItem = {
  baseDate: string;
  baseTime: string;
  category: WeatherCategory;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
};

// 기상청 단기예보 응답 최소 타입
export type KmaForecastResponse = {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: KmaForecastItem[];
      };
    };
  };
};
