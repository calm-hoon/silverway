import { describe, it, expect } from "vitest";
import { normalizeOdsayRoute } from "@/lib/odsay/normalizeOdsayRoute";

const MINIMAL_RAW = {
  result: {
    path: [
      {
        info: {
          totalTime: 26,
          busTransitCount: 0,
          subwayTransitCount: 0,
        },
        subPath: [
          { trafficType: 3, sectionTime: 5, distance: 350 },
          {
            trafficType: 1,
            sectionTime: 14,
            distance: 3200,
            lane: [{ name: "대전 1호선" }],
            startName: "시청",
            endName: "충남대",
          },
          { trafficType: 3, sectionTime: 7, distance: 500 },
        ],
      },
    ],
  },
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

describe("normalizeOdsayRoute", () => {
  it("최소 ODsay 응답을 TransitSummary로 변환한다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    expect(result).not.toBeNull();
    expect(result?.available).toBe(true);
  });

  it("durationMin, transferCount, steps가 포함된다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    expect(result?.route?.totalDurationMin).toBe(26);
    expect(result?.route?.transferCount).toBe(0);
    expect((result?.route?.steps.length ?? 0)).toBeGreaterThan(0);
  });

  it("지하철 step이 SUBWAY mode로 변환된다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    const subway = result?.route?.steps.find((s) => s.mode === "SUBWAY");
    expect(subway).toBeDefined();
    expect(subway?.stationFrom).toBe("시청");
    expect(subway?.stationTo).toBe("충남대");
    expect(subway?.lineName).toBe("대전 1호선");
  });

  it("도보 step이 WALK mode로 변환된다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    const walk = result?.route?.steps.find((s) => s.mode === "WALK");
    expect(walk).toBeDefined();
  });

  it("버스 step이 BUS mode로 변환된다", () => {
    const busRaw = {
      result: {
        path: [
          {
            info: { totalTime: 30, busTransitCount: 1, subwayTransitCount: 0 },
            subPath: [
              {
                trafficType: 2,
                sectionTime: 20,
                distance: 4000,
                lane: [{ busNo: "705" }],
                startName: "시청",
                endName: "충남대병원",
              },
            ],
          },
        ],
      },
    };
    const result = normalizeOdsayRoute(busRaw);
    const bus = result?.route?.steps.find((s) => s.mode === "BUS");
    expect(bus).toBeDefined();
    expect(bus?.lineName).toBe("705");
  });

  it("경로가 없으면 null을 반환한다", () => {
    expect(normalizeOdsayRoute({ result: { path: [] } })).toBeNull();
    expect(normalizeOdsayRoute({ result: {} })).toBeNull();
    expect(normalizeOdsayRoute({})).toBeNull();
  });

  it("잘못된 raw 입력에서도 throw하지 않는다", () => {
    expect(() => normalizeOdsayRoute(null)).not.toThrow();
    expect(() => normalizeOdsayRoute(undefined)).not.toThrow();
    expect(() => normalizeOdsayRoute("invalid")).not.toThrow();
    expect(() => normalizeOdsayRoute(42)).not.toThrow();
    expect(() => normalizeOdsayRoute({ result: null })).not.toThrow();
  });

  it("정규화 결과의 route.source에 ODsay 표시가 있다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    expect(result?.route?.source).toContain("ODsay");
  });

  it("정규화 결과 텍스트에 금지 표현이 없다", () => {
    const result = normalizeOdsayRoute(MINIMAL_RAW);
    const text = [
      result?.route?.source ?? "",
      ...(result?.route?.steps.map((s) => s.description) ?? []),
    ].join(" ");
    for (const word of FORBIDDEN) {
      expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
    }
  });
});
