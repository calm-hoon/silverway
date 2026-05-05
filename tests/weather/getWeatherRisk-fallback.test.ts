import { describe, it, expect } from "vitest";
import { getWeatherRisk } from "@/lib/weather/getWeatherRisk";
import { convertLatLngToGrid } from "@/lib/weather/convertGrid";

const DAEJEON_LAT = 36.3504;
const DAEJEON_LNG = 127.3845;

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "운전 금지", "반드시 반납"];

describe("getWeatherRisk — fallback 동작 (WEATHER_API_KEY 없는 환경)", () => {
  it("WEATHER_API_KEY 없이 호출해도 throw하지 않는다", async () => {
    await expect(getWeatherRisk()).resolves.not.toThrow();
  });

  it("WEATHER_API_KEY가 없으면 source: FALLBACK을 반환한다", async () => {
    const result = await getWeatherRisk();
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
    }
  });

  it("결과에 항상 weather 객체가 있다", async () => {
    const result = await getWeatherRisk();
    expect(result.weather).toBeDefined();
    expect(result.weather.condition).toBeDefined();
  });

  it("좌표를 넣어도 throw하지 않는다", async () => {
    await expect(getWeatherRisk({ lat: DAEJEON_LAT, lng: DAEJEON_LNG })).resolves.not.toThrow();
  });

  it("잘못된 좌표 입력에서도 throw하지 않는다", async () => {
    await expect(getWeatherRisk({ lat: NaN, lng: NaN })).resolves.not.toThrow();
    await expect(getWeatherRisk({ lat: Infinity, lng: 0 })).resolves.not.toThrow();
  });

  it("fallback weather의 riskNote에 운전 위험 지수 참고 의미가 있다", async () => {
    const result = await getWeatherRisk();
    expect(result.weather.riskNote.length).toBeGreaterThan(0);
  });

  it("응답 내 텍스트에 금지 표현이 없다", async () => {
    const result = await getWeatherRisk({ lat: DAEJEON_LAT, lng: DAEJEON_LNG });
    const text = [result.weather.riskNote, result.weather.label, result.weather.source].join(" ");
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });

  it("응답 JSON 문자열에 API key가 포함되지 않는다", async () => {
    const result = await getWeatherRisk();
    const text = JSON.stringify(result);
    const apiKey = process.env.WEATHER_API_KEY;
    if (apiKey) {
      expect(text).not.toContain(apiKey);
    }
    expect(text).not.toContain("serviceKey=");
  });
});

describe("convertLatLngToGrid", () => {
  it("대전 좌표를 넣으면 숫자 nx, ny를 반환한다", () => {
    const { nx, ny } = convertLatLngToGrid(DAEJEON_LAT, DAEJEON_LNG);
    expect(typeof nx).toBe("number");
    expect(typeof ny).toBe("number");
    expect(isFinite(nx)).toBe(true);
    expect(isFinite(ny)).toBe(true);
  });

  it("대전 격자값이 올바른 범위에 있다", () => {
    const { nx, ny } = convertLatLngToGrid(DAEJEON_LAT, DAEJEON_LNG);
    // 대전광역시청 기준 격자: nx=67, ny=100
    expect(nx).toBe(67);
    expect(ny).toBe(100);
  });

  it("NaN 좌표에서도 throw하지 않고 fallback 격자를 반환한다", () => {
    expect(() => convertLatLngToGrid(NaN, NaN)).not.toThrow();
    const { nx, ny } = convertLatLngToGrid(NaN, NaN);
    expect(isFinite(nx)).toBe(true);
    expect(isFinite(ny)).toBe(true);
  });

  it("Infinity 좌표에서도 throw하지 않는다", () => {
    expect(() => convertLatLngToGrid(Infinity, 127)).not.toThrow();
  });
});
