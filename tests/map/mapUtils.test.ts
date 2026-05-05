import { describe, it, expect } from "vitest";
import {
  isValidCoordinate,
  createMapPointFromPlace,
  getMapCenter,
  getDaejeonDefaultCenter,
} from "@/components/map/mapUtils";
import type { Place } from "@/types";

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "실시간 혼잡도", "운전 금지", "반드시 반납"];

const DAEJEON_ORIGIN: Place = {
  name: "대전광역시청",
  address: "대전 서구 둔산로 100",
  lat: 36.3504,
  lng: 127.3845,
};

const DAEJEON_DEST: Place = {
  name: "충남대학교병원",
  address: "대전 중구 문화로 282",
  lat: 36.3166,
  lng: 127.4156,
};

describe("isValidCoordinate", () => {
  it("유효한 좌표는 true를 반환한다", () => {
    expect(isValidCoordinate(36.3504, 127.3845)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
  });

  it("잘못된 좌표는 false를 반환한다", () => {
    expect(isValidCoordinate(NaN, 127.3845)).toBe(false);
    expect(isValidCoordinate(36.3504, NaN)).toBe(false);
    expect(isValidCoordinate(Infinity, 127)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(0, 181)).toBe(false);
  });
});

describe("createMapPointFromPlace", () => {
  it("Place를 MapPoint로 변환한다", () => {
    const point = createMapPointFromPlace(DAEJEON_ORIGIN, "origin");
    expect(point).not.toBeNull();
    expect(point?.name).toBe("대전광역시청");
    expect(point?.lat).toBe(36.3504);
    expect(point?.lng).toBe(127.3845);
    expect(point?.type).toBe("origin");
  });

  it("좌표가 없는 Place는 null을 반환한다", () => {
    const invalid: Place = { name: "잘못된 장소", address: "", lat: NaN, lng: NaN };
    expect(createMapPointFromPlace(invalid, "destination")).toBeNull();
  });

  it("Infinity 좌표인 Place도 null을 반환한다", () => {
    const invalid: Place = { name: "무한 좌표", address: "", lat: Infinity, lng: 0 };
    expect(createMapPointFromPlace(invalid, "origin")).toBeNull();
  });
});

describe("getMapCenter", () => {
  it("origin/destination이 모두 있으면 중간 좌표를 반환한다", () => {
    const oPoint = createMapPointFromPlace(DAEJEON_ORIGIN, "origin")!;
    const dPoint = createMapPointFromPlace(DAEJEON_DEST, "destination")!;
    const center = getMapCenter(oPoint, dPoint);
    expect(center.lat).toBeCloseTo((36.3504 + 36.3166) / 2, 4);
    expect(center.lng).toBeCloseTo((127.3845 + 127.4156) / 2, 4);
  });

  it("origin만 있으면 origin 좌표를 반환한다", () => {
    const oPoint = createMapPointFromPlace(DAEJEON_ORIGIN, "origin")!;
    const center = getMapCenter(oPoint, undefined);
    expect(center.lat).toBe(36.3504);
    expect(center.lng).toBe(127.3845);
  });

  it("값이 없어도 대전 기본 중심 좌표를 반환한다", () => {
    const center = getMapCenter(undefined, undefined);
    expect(center.lat).toBe(36.3504);
    expect(center.lng).toBe(127.3845);
  });
});

describe("getDaejeonDefaultCenter", () => {
  it("대전 기본 좌표를 반환한다", () => {
    const center = getDaejeonDefaultCenter();
    expect(typeof center.lat).toBe("number");
    expect(typeof center.lng).toBe("number");
    expect(isValidCoordinate(center.lat, center.lng)).toBe(true);
  });

  it("반환 문자열에 금지 표현이 없다", () => {
    const result = getDaejeonDefaultCenter();
    const text = JSON.stringify(result);
    for (const word of FORBIDDEN) {
      expect(text.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
