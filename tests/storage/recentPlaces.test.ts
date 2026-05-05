// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  getRecentPlaces,
  saveRecentPlace,
  removeRecentPlace,
  clearRecentPlaces,
  getRecentRoutes,
  saveRecentRoute,
  removeRecentRoute,
  clearRecentRoutes,
} from "@/lib/storage/recentPlaces";
import type { Place } from "@/types";

const placeA: Place = { name: "대전광역시청", address: "대전 서구 둔산로 100", lat: 36.3504, lng: 127.3845 };
const placeB: Place = { name: "충남대학교병원", address: "대전 중구 문화로 282", lat: 36.3166, lng: 127.4156 };
const placeC: Place = { name: "대전역", address: "대전 동구 중앙로 215", lat: 36.3318, lng: 127.4347 };

beforeEach(() => {
  localStorage.clear();
});

describe("saveRecentPlace / getRecentPlaces", () => {
  it("저장 후 읽을 수 있다", () => {
    saveRecentPlace(placeA);
    const places = getRecentPlaces();
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe("대전광역시청");
  });

  it("같은 장소를 다시 저장하면 중복되지 않고 최신순으로 이동한다", () => {
    saveRecentPlace(placeA);
    saveRecentPlace(placeB);
    saveRecentPlace(placeA); // 다시 A
    const places = getRecentPlaces();
    expect(places).toHaveLength(2);
    expect(places[0].name).toBe("대전광역시청"); // A가 최신
    expect(places[1].name).toBe("충남대학교병원");
  });

  it("최근 장소는 최대 10개까지만 유지된다", () => {
    for (let i = 0; i < 12; i++) {
      saveRecentPlace({
        name: `장소${i}`,
        address: `대전 테스트 주소 ${i}`,
        lat: 36 + i * 0.001,
        lng: 127 + i * 0.001,
      });
    }
    expect(getRecentPlaces()).toHaveLength(10);
  });

  it("id가 각 장소에 부여된다", () => {
    saveRecentPlace(placeA);
    const places = getRecentPlaces();
    expect(places[0].id).toBeTruthy();
  });

  it("lastUsedAt이 ISO 문자열로 저장된다", () => {
    saveRecentPlace(placeA);
    const { lastUsedAt } = getRecentPlaces()[0];
    expect(() => new Date(lastUsedAt)).not.toThrow();
    expect(new Date(lastUsedAt).toISOString()).toBe(lastUsedAt);
  });

  it("name이나 좌표가 없는 장소는 저장하지 않는다", () => {
    saveRecentPlace({ name: "", address: "주소", lat: 0, lng: 0 });
    saveRecentPlace({ name: "이름", address: "주소", lat: 0, lng: 0 });
    expect(getRecentPlaces()).toHaveLength(0);
  });
});

describe("removeRecentPlace", () => {
  it("id로 특정 장소를 삭제한다", () => {
    saveRecentPlace(placeA);
    saveRecentPlace(placeB);
    const places = getRecentPlaces();
    const idA = places.find((p) => p.name === "대전광역시청")!.id;
    removeRecentPlace(idA);
    expect(getRecentPlaces()).toHaveLength(1);
    expect(getRecentPlaces()[0].name).toBe("충남대학교병원");
  });
});

describe("clearRecentPlaces", () => {
  it("전체 삭제가 동작한다", () => {
    saveRecentPlace(placeA);
    saveRecentPlace(placeB);
    clearRecentPlaces();
    expect(getRecentPlaces()).toHaveLength(0);
  });
});

describe("saveRecentRoute / getRecentRoutes", () => {
  it("저장 후 읽을 수 있다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    const routes = getRecentRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].origin.name).toBe("대전광역시청");
    expect(routes[0].destination.name).toBe("충남대학교병원");
  });

  it("같은 경로를 다시 저장하면 중복되지 않고 최신순으로 이동한다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    saveRecentRoute({ origin: placeB, destination: placeC });
    saveRecentRoute({ origin: placeA, destination: placeB }); // 다시 동일 경로
    const routes = getRecentRoutes();
    expect(routes).toHaveLength(2);
    expect(routes[0].origin.name).toBe("대전광역시청"); // 최신
  });

  it("최근 경로는 최대 5개까지만 유지된다", () => {
    for (let i = 0; i < 7; i++) {
      const origin: Place = { name: `출발${i}`, address: `출발주소${i}`, lat: 36 + i * 0.001, lng: 127 };
      const destination: Place = { name: `도착${i}`, address: `도착주소${i}`, lat: 36, lng: 127 + i * 0.001 };
      saveRecentRoute({ origin, destination });
    }
    expect(getRecentRoutes()).toHaveLength(5);
  });

  it("id가 각 경로에 부여된다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    expect(getRecentRoutes()[0].id).toBeTruthy();
  });

  it("lastUsedAt이 ISO 문자열로 저장된다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    const { lastUsedAt } = getRecentRoutes()[0];
    expect(new Date(lastUsedAt).toISOString()).toBe(lastUsedAt);
  });

  it("origin 또는 destination name이 없으면 저장하지 않는다", () => {
    saveRecentRoute({ origin: { ...placeA, name: "" }, destination: placeB });
    saveRecentRoute({ origin: placeA, destination: { ...placeB, name: "" } });
    expect(getRecentRoutes()).toHaveLength(0);
  });
});

describe("removeRecentRoute", () => {
  it("id로 특정 경로를 삭제한다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    saveRecentRoute({ origin: placeB, destination: placeC });
    const routes = getRecentRoutes();
    removeRecentRoute(routes[0].id);
    expect(getRecentRoutes()).toHaveLength(1);
  });
});

describe("clearRecentRoutes", () => {
  it("전체 삭제가 동작한다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    clearRecentRoutes();
    expect(getRecentRoutes()).toHaveLength(0);
  });
});

describe("오류 내성", () => {
  it("깨진 JSON이 localStorage에 있어도 throw하지 않는다", () => {
    localStorage.setItem("silverway:recent-places", "{ broken json {{");
    expect(() => getRecentPlaces()).not.toThrow();
    expect(getRecentPlaces()).toEqual([]);
  });

  it("배열이 아닌 값이 저장되어 있어도 빈 배열을 반환한다", () => {
    localStorage.setItem("silverway:recent-routes", JSON.stringify({ not: "an array" }));
    expect(getRecentRoutes()).toEqual([]);
  });
});

describe("보안 — 민감정보 비저장", () => {
  it("API 키 관련 필드가 저장되지 않는다", () => {
    saveRecentPlace(placeA);
    const raw = localStorage.getItem("silverway:recent-places") ?? "";
    expect(raw).not.toContain("KAKAO_REST_API_KEY");
    expect(raw).not.toContain("ANTHROPIC_API_KEY");
    expect(raw).not.toContain("ODSAY_API_KEY");
    expect(raw).not.toContain("SUPABASE");
    expect(raw).not.toContain("apiKey");
  });

  it("저장 데이터에 resultId나 분석 결과 전체가 포함되지 않는다", () => {
    saveRecentRoute({ origin: placeA, destination: placeB });
    const raw = localStorage.getItem("silverway:recent-routes") ?? "";
    expect(raw).not.toContain("resultId");
    expect(raw).not.toContain("drivingRisk");
    expect(raw).not.toContain("fallbackFlags");
  });
});
