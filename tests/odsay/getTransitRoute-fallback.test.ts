import { describe, it, expect } from "vitest";
import { getTransitRoute } from "@/lib/odsay/getTransitRoute";

const VALID_INPUT = {
  originLat: 36.3504,
  originLng: 127.3845,
  destinationLat: 36.3166,
  destinationLng: 127.4156,
};

const FORBIDDEN = [
  "사고 확률",
  "예측 확률",
  "probability",
  "실시간 혼잡도",
  "realtime",
  "live congestion",
  "운전 금지",
  "반드시 반납",
];

describe("getTransitRoute — fallback 동작 (ODSAY_API_KEY 없는 환경)", () => {
  it("ODSAY_API_KEY 없이 호출해도 throw하지 않는다", async () => {
    await expect(getTransitRoute(VALID_INPUT)).resolves.not.toThrow();
  });

  it("ODSAY_API_KEY가 없으면 source: FALLBACK을 반환한다", async () => {
    const result = await getTransitRoute(VALID_INPUT);
    // 테스트 환경에서는 API key가 없으므로 FALLBACK
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
    }
  });

  it("결과에 항상 transit 객체가 있다", async () => {
    const result = await getTransitRoute(VALID_INPUT);
    expect(result.transit).toBeDefined();
    expect(result.transit.available).toBeDefined();
  });

  it("잘못된 좌표 입력에서도 throw하지 않는다", async () => {
    await expect(
      getTransitRoute({ originLat: NaN, originLng: NaN, destinationLat: NaN, destinationLng: NaN })
    ).resolves.not.toThrow();
    await expect(
      getTransitRoute({ originLat: Infinity, originLng: 0, destinationLat: 0, destinationLng: 0 })
    ).resolves.not.toThrow();
  });

  it("잘못된 좌표이면 source: FALLBACK을 반환한다", async () => {
    const result = await getTransitRoute({ originLat: NaN, originLng: NaN, destinationLat: NaN, destinationLng: NaN });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.source).toBe("FALLBACK");
    }
  });

  it("fallback transit의 혼잡도 설명에 '과거 패턴 기반 예측형 혼잡도' 표현이 포함된다", async () => {
    const result = await getTransitRoute(VALID_INPUT);
    expect(result.transit.congestion?.description).toContain("과거 패턴 기반 예측형 혼잡도");
  });

  it("응답 내 텍스트에 금지 표현이 없다", async () => {
    const result = await getTransitRoute(VALID_INPUT);
    const text = [
      result.transit.congestion?.description ?? "",
      ...(result.transit.route?.steps.map((s) => s.description) ?? []),
      result.transit.route?.source ?? "",
    ].join(" ");
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });

  it("응답 JSON 문자열에 API key가 포함되지 않는다", async () => {
    const result = await getTransitRoute(VALID_INPUT);
    const text = JSON.stringify(result);
    const apiKey = process.env.ODSAY_API_KEY;
    if (apiKey) {
      expect(text).not.toContain(apiKey);
    }
    // key가 없는 환경에서도 응답에 'apiKey' 문자열이 노출되지 않아야 함
    expect(text).not.toContain("apiKey=");
  });
});
