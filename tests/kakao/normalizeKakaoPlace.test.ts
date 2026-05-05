import { describe, it, expect } from "vitest";
import { normalizeKakaoPlaces } from "@/lib/kakao/normalizeKakaoPlace";

const SAMPLE_RAW = {
  documents: [
    {
      place_name: "대전광역시청",
      address_name: "대전 서구 둔산동 1000",
      road_address_name: "대전 서구 둔산로 100",
      x: "127.3845",
      y: "36.3504",
      category_name: "공공기관",
    },
    {
      place_name: "충남대학교병원",
      address_name: "대전 중구 문화동 640",
      road_address_name: "대전 중구 문화로 282",
      x: "127.4156",
      y: "36.3166",
    },
  ],
  meta: { total_count: 2, is_end: true },
};

const INVALID_COORD_RAW = {
  documents: [
    { place_name: "좌표없는 장소", x: "invalid", y: "notanumber" },
    { place_name: "정상 장소", x: "127.3845", y: "36.3504", address_name: "대전 서구" },
  ],
};

describe("normalizeKakaoPlaces", () => {
  it("최소 Kakao-like raw 응답을 Place[]로 변환한다", () => {
    const result = normalizeKakaoPlaces(SAMPLE_RAW);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("대전광역시청");
    expect(result[1].name).toBe("충남대학교병원");
  });

  it("x는 lng, y는 lat으로 변환한다", () => {
    const result = normalizeKakaoPlaces(SAMPLE_RAW);
    expect(result[0].lat).toBe(36.3504);  // y → lat
    expect(result[0].lng).toBe(127.3845); // x → lng
  });

  it("road_address_name을 우선 사용하고 없으면 address_name을 사용한다", () => {
    const result = normalizeKakaoPlaces(SAMPLE_RAW);
    expect(result[0].address).toBe("대전 서구 둔산로 100");
  });

  it("좌표가 잘못된 항목은 제외한다", () => {
    const result = normalizeKakaoPlaces(INVALID_COORD_RAW);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("정상 장소");
  });

  it("검색 결과가 없으면 빈 배열을 반환한다", () => {
    expect(normalizeKakaoPlaces({ documents: [] })).toHaveLength(0);
    expect(normalizeKakaoPlaces({ documents: null })).toHaveLength(0);
  });

  it("잘못된 raw 입력에서도 throw하지 않는다", () => {
    expect(() => normalizeKakaoPlaces(null)).not.toThrow();
    expect(() => normalizeKakaoPlaces(undefined)).not.toThrow();
    expect(() => normalizeKakaoPlaces("invalid")).not.toThrow();
    expect(() => normalizeKakaoPlaces(42)).not.toThrow();
    expect(() => normalizeKakaoPlaces({})).not.toThrow();
  });

  it("source가 KAKAO_LOCAL로 설정된다", () => {
    const result = normalizeKakaoPlaces(SAMPLE_RAW);
    expect(result[0].source).toBe("KAKAO_LOCAL");
  });

  it("중복 장소가 제거된다", () => {
    const raw = {
      documents: [
        { place_name: "대전광역시청", x: "127.3845", y: "36.3504", address_name: "대전 서구" },
        { place_name: "대전광역시청", x: "127.3845", y: "36.3504", address_name: "대전 서구" },
      ],
    };
    const result = normalizeKakaoPlaces(raw);
    expect(result).toHaveLength(1);
  });

  it("place_name이 없는 항목은 제외한다", () => {
    const raw = {
      documents: [
        { x: "127.3845", y: "36.3504", address_name: "대전 서구" },
      ],
    };
    const result = normalizeKakaoPlaces(raw);
    expect(result).toHaveLength(0);
  });
});
