import { describe, it, expect } from "vitest";
import { extractSigungu } from "@/lib/data/accidentAreas";

describe("extractSigungu", () => {
  it("대덕구 주소에서 대덕구를 반환한다", () => {
    expect(extractSigungu("대전 대덕구 대전로1033번길 20")).toBe("대덕구");
  });

  it("서구 주소에서 서구를 반환한다", () => {
    expect(extractSigungu("대전 서구 둔산로 100")).toBe("서구");
  });

  it("중구 주소에서 중구를 반환한다", () => {
    expect(extractSigungu("대전 중구 문화로 282")).toBe("중구");
  });

  it("유성구 주소에서 유성구를 반환한다", () => {
    expect(extractSigungu("대전광역시 유성구 대학로 99")).toBe("유성구");
  });

  it("구가 없는 주소에서 null을 반환한다", () => {
    expect(extractSigungu("세종특별자치시 한누리대로 2130")).toBeNull();
  });

  it("빈 문자열에서 null을 반환한다", () => {
    expect(extractSigungu("")).toBeNull();
  });

  it("시도명에 구(대구) 포함돼도 행정 구를 정확히 반환한다", () => {
    // '대구' 뒤에 '광역시'(한글)가 오므로 lookahead 불일치 → 건너뜀
    // '중구' 뒤에 ' '(비한글)이 오므로 매칭
    expect(extractSigungu("대구광역시 중구 서성로 1")).toBe("중구");
  });

  it("구청 건물명 포함 주소에서도 행정 구를 반환한다", () => {
    expect(extractSigungu("대전 대덕구 대전로1033번길 20 대덕구청 1층")).toBe("대덕구");
  });

  it("광역시 포함 전체 주소에서 대덕구를 반환한다", () => {
    expect(extractSigungu("대전광역시 대덕구 대전로1033번길 20")).toBe("대덕구");
  });

  it("건물명만 있는 경우(대덕구청) null을 반환한다", () => {
    expect(extractSigungu("대덕구청")).toBeNull();
  });

  it("중구 주소에서 중구를 반환한다 (중앙로 포함)", () => {
    expect(extractSigungu("대전 중구 중앙로 215")).toBe("중구");
  });
});
