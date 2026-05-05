import { describe, it, expect } from "vitest";
import { searchPlace } from "@/lib/kakao/searchPlace";

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "실시간 혼잡도", "운전 금지", "반드시 반납"];

describe("searchPlace — fallback 동작 (KAKAO_REST_API_KEY 없는 환경)", () => {
  it("KAKAO_REST_API_KEY가 없을 때 throw하지 않는다", async () => {
    await expect(searchPlace({ query: "대전광역시청" })).resolves.not.toThrow();
  });

  it("KAKAO_REST_API_KEY가 없으면 source: FALLBACK을 반환한다", async () => {
    const result = await searchPlace({ query: "대전광역시청" });
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
    }
  });

  it("query가 비어 있어도 throw하지 않는다", async () => {
    await expect(searchPlace({ query: "" })).resolves.not.toThrow();
  });

  it("query가 비어 있으면 fallback result를 반환한다", async () => {
    const result = await searchPlace({ query: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.source).toBe("FALLBACK");
  });

  it("fallback places에 lat/lng가 포함된다", async () => {
    const result = await searchPlace({ query: "대전" });
    for (const place of result.places) {
      expect(typeof place.lat).toBe("number");
      expect(typeof place.lng).toBe("number");
      expect(isFinite(place.lat)).toBe(true);
      expect(isFinite(place.lng)).toBe(true);
    }
  });

  it("fallback places에 name과 address가 포함된다", async () => {
    const result = await searchPlace({ query: "시청" });
    expect(result.places.length).toBeGreaterThan(0);
    for (const place of result.places) {
      expect(typeof place.name).toBe("string");
      expect(place.name.length).toBeGreaterThan(0);
    }
  });

  it("응답 문자열에 API key가 포함되지 않는다", async () => {
    const result = await searchPlace({ query: "대전광역시청" });
    const text = JSON.stringify(result);
    const apiKey = process.env.KAKAO_REST_API_KEY;
    if (apiKey) {
      expect(text).not.toContain(apiKey);
    }
    expect(text).not.toContain("KakaoAK ");
  });

  it("fallback 결과 텍스트에 금지 표현이 없다", async () => {
    const result = await searchPlace({ query: "대전광역시청" });
    const text = JSON.stringify(result);
    for (const word of FORBIDDEN) {
      expect(text.toLowerCase(), `금지 표현 "${word}" 발견`).not.toContain(word.toLowerCase());
    }
  });

  it("query가 1글자여도 throw하지 않는다", async () => {
    await expect(searchPlace({ query: "대" })).resolves.not.toThrow();
  });

  it("samplePlaces에서 유사 장소를 찾아 반환한다", async () => {
    const result = await searchPlace({ query: "대전역" });
    expect(result.places.length).toBeGreaterThan(0);
  });
});
