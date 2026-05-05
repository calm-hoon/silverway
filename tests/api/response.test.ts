import { describe, it, expect } from "vitest";
import { createSuccessResponse, createFallbackResponse } from "@/lib/api/response";
import { toSafeErrorReason, getUserFriendlyMessage } from "@/lib/api/errors";

describe("createSuccessResponse", () => {
  it("ok: true 응답 shape를 만든다", async () => {
    const res = createSuccessResponse({ mode: "TEST", data: { value: 1 } });
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.mode).toBe("TEST");
    expect((body.data as Record<string, unknown>).value).toBe(1);
  });

  it("meta 필드가 포함된다", async () => {
    const res = createSuccessResponse({
      mode: "TEST",
      data: {},
      meta: { source: "ODSAY", fallback: false },
    });
    const body = await res.json() as Record<string, unknown>;
    expect((body.meta as Record<string, unknown>).source).toBe("ODSAY");
  });
});

describe("createFallbackResponse", () => {
  it("meta.fallback: true 응답 shape를 만든다", async () => {
    const res = createFallbackResponse({
      mode: "FALLBACK",
      data: { placeholder: true },
      reason: "API key missing",
    });
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect((body.meta as Record<string, unknown>).fallback).toBe(true);
  });

  it("reason이 meta에 포함된다", async () => {
    const res = createFallbackResponse({ mode: "TEST", data: {}, reason: "timeout" });
    const body = await res.json() as Record<string, unknown>;
    expect((body.meta as Record<string, unknown>).reason).toBe("timeout");
  });

  it("응답 문자열에 API key처럼 보이는 민감 정보가 포함되지 않는다", async () => {
    const res = createFallbackResponse({ mode: "TEST", data: {} });
    const text = await res.text();
    expect(text).not.toContain("KakaoAK ");
    expect(text).not.toContain("sk-ant-");
    expect(text).not.toContain("serviceKey=");
  });
});

describe("toSafeErrorReason", () => {
  it("Error 객체를 안전한 문자열로 변환한다", () => {
    const err = new Error("connection refused");
    const result = toSafeErrorReason(err);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("connection refused");
  });

  it("stack trace 전체가 노출되지 않는다", () => {
    const err = new Error("test error");
    const result = toSafeErrorReason(err);
    expect(result).not.toContain("at Object.");
    expect(result.length).toBeLessThanOrEqual(120);
  });

  it("null/undefined 입력을 처리한다", () => {
    expect(() => toSafeErrorReason(null)).not.toThrow();
    expect(() => toSafeErrorReason(undefined)).not.toThrow();
    expect(typeof toSafeErrorReason(null)).toBe("string");
  });

  it("문자열 입력을 그대로 반환한다", () => {
    expect(toSafeErrorReason("timeout")).toBe("timeout");
  });
});

describe("getUserFriendlyMessage", () => {
  it("ODSAY source에 대한 메시지를 반환한다", () => {
    const msg = getUserFriendlyMessage("ODSAY");
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("알 수 없는 source도 처리한다", () => {
    const msg = getUserFriendlyMessage("UNKNOWN");
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("메시지에 금지 표현이 없다", () => {
    const sources = ["ODSAY", "KMA", "CLAUDE", "KAKAO", "KAKAO_MAP", "SUPABASE"];
    const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "운전 금지", "반드시 반납"];
    for (const source of sources) {
      const msg = getUserFriendlyMessage(source);
      for (const word of FORBIDDEN) {
        expect(msg.toLowerCase()).not.toContain(word.toLowerCase());
      }
    }
  });
});
