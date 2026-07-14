import { describe, it, expect } from "vitest";
import { getKstHour, getKstTime } from "@/lib/utils/time";

describe("getKstHour / getKstTime", () => {
  it("UTC(Z) 형식 문자열에서 KST 기준 시각을 정확히 추출한다 (오후 7시 KST = 10:00 UTC)", () => {
    expect(getKstHour("2026-07-14T10:00:00.000Z")).toBe(19);
  });

  it("+09:00 오프셋 문자열에서도 동일한 KST 시각을 추출한다", () => {
    expect(getKstHour("2026-07-14T19:00:00+09:00")).toBe(19);
  });

  it("자정을 넘어가는 UTC 시각도 올바르게 KST로 환산한다 (23:00 UTC = 익일 08:00 KST)", () => {
    expect(getKstHour("2026-07-14T23:00:00.000Z")).toBe(8);
  });

  it("빈 값이나 잘못된 문자열은 null을 반환한다", () => {
    expect(getKstHour(undefined)).toBeNull();
    expect(getKstHour("")).toBeNull();
    expect(getKstHour("invalid-date")).toBeNull();
  });

  it("분(minute) 값도 함께 반환한다", () => {
    expect(getKstTime("2026-07-14T10:30:00.000Z")).toEqual({ hour: 19, minute: 30 });
  });
});
