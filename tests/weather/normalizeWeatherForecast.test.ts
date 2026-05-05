import { describe, it, expect } from "vitest";
import { normalizeWeatherForecast } from "@/lib/weather/normalizeWeatherForecast";

const CLEAR_RAW = {
  response: {
    header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
    body: {
      items: {
        item: [
          { baseDate: "20260505", baseTime: "0500", category: "TMP",  fcstDate: "20260505", fcstTime: "0600", fcstValue: "18" },
          { baseDate: "20260505", baseTime: "0500", category: "PTY",  fcstDate: "20260505", fcstTime: "0600", fcstValue: "0" },
          { baseDate: "20260505", baseTime: "0500", category: "SKY",  fcstDate: "20260505", fcstTime: "0600", fcstValue: "1" },
          { baseDate: "20260505", baseTime: "0500", category: "WSD",  fcstDate: "20260505", fcstTime: "0600", fcstValue: "2.1" },
          { baseDate: "20260505", baseTime: "0500", category: "POP",  fcstDate: "20260505", fcstTime: "0600", fcstValue: "10" },
        ],
      },
    },
  },
};

const RAIN_RAW = {
  response: {
    header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
    body: {
      items: {
        item: [
          { baseDate: "20260505", baseTime: "0500", category: "TMP",  fcstDate: "20260505", fcstTime: "0900", fcstValue: "14" },
          { baseDate: "20260505", baseTime: "0500", category: "PTY",  fcstDate: "20260505", fcstTime: "0900", fcstValue: "1" },
          { baseDate: "20260505", baseTime: "0500", category: "SKY",  fcstDate: "20260505", fcstTime: "0900", fcstValue: "4" },
          { baseDate: "20260505", baseTime: "0500", category: "WSD",  fcstDate: "20260505", fcstTime: "0900", fcstValue: "5.0" },
          { baseDate: "20260505", baseTime: "0500", category: "POP",  fcstDate: "20260505", fcstTime: "0900", fcstValue: "70" },
        ],
      },
    },
  },
};

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "운전 금지", "반드시 반납"];

describe("normalizeWeatherForecast", () => {
  it("최소 KMA 응답을 WeatherRisk로 변환한다", () => {
    const result = normalizeWeatherForecast(CLEAR_RAW);
    expect(result).not.toBeNull();
    expect(result?.condition).toBe("CLEAR");
  });

  it("condition, riskScore, riskNote, source가 포함된다", () => {
    const result = normalizeWeatherForecast(CLEAR_RAW);
    expect(result?.condition).toBeDefined();
    expect(result?.riskScore).toBeDefined();
    expect(result?.riskNote).toBeDefined();
    expect(result?.source).toBeDefined();
  });

  it("riskScore가 0~100 범위에 있다", () => {
    const clear = normalizeWeatherForecast(CLEAR_RAW);
    expect((clear?.riskScore ?? 0)).toBeGreaterThanOrEqual(0);
    expect((clear?.riskScore ?? 0)).toBeLessThanOrEqual(100);

    const rain = normalizeWeatherForecast(RAIN_RAW);
    expect((rain?.riskScore ?? 0)).toBeGreaterThanOrEqual(0);
    expect((rain?.riskScore ?? 0)).toBeLessThanOrEqual(100);
  });

  it("비(PTY=1)는 RAIN condition으로 변환된다", () => {
    const result = normalizeWeatherForecast(RAIN_RAW);
    expect(result?.condition).toBe("RAIN");
  });

  it("비는 맑음보다 높은 riskScore를 가진다", () => {
    const clear = normalizeWeatherForecast(CLEAR_RAW);
    const rain = normalizeWeatherForecast(RAIN_RAW);
    expect((rain?.riskScore ?? 0)).toBeGreaterThan((clear?.riskScore ?? 0));
  });

  it("기온이 올바르게 파싱된다", () => {
    const result = normalizeWeatherForecast(CLEAR_RAW);
    expect(result?.temperatureCelsius).toBe(18);
  });

  it("예보가 없으면 null을 반환한다", () => {
    expect(normalizeWeatherForecast({ response: { body: { items: { item: [] } } } })).toBeNull();
    expect(normalizeWeatherForecast({ response: {} })).toBeNull();
    expect(normalizeWeatherForecast({})).toBeNull();
  });

  it("resultCode가 00이 아니면 null을 반환한다", () => {
    const errRaw = { response: { header: { resultCode: "03" }, body: CLEAR_RAW.response.body } };
    expect(normalizeWeatherForecast(errRaw)).toBeNull();
  });

  it("잘못된 raw 입력에서도 throw하지 않는다", () => {
    expect(() => normalizeWeatherForecast(null)).not.toThrow();
    expect(() => normalizeWeatherForecast(undefined)).not.toThrow();
    expect(() => normalizeWeatherForecast("invalid")).not.toThrow();
    expect(() => normalizeWeatherForecast(42)).not.toThrow();
  });

  it("정규화 결과 텍스트에 금지 표현이 없다", () => {
    const result = normalizeWeatherForecast(CLEAR_RAW);
    const rainResult = normalizeWeatherForecast(RAIN_RAW);
    const text = [result?.riskNote ?? "", rainResult?.riskNote ?? ""].join(" ");
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });
});
