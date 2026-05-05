import { describe, it, expect } from "vitest";
import { buildHealthCheckData } from "@/lib/api/healthCheck";

const FORBIDDEN = ["사고 확률", "예측 확률", "probability", "실시간 혼잡도", "운전 금지", "반드시 반납"];

describe("buildHealthCheckData", () => {
  it("ok: true가 포함된다", () => {
    const data = buildHealthCheckData();
    expect(data.ok).toBe(true);
  });

  it("service 이름이 SilverWay다", () => {
    const data = buildHealthCheckData();
    expect(data.service).toBe("SilverWay");
  });

  it("환경변수 존재 여부가 boolean으로 표시된다", () => {
    const data = buildHealthCheckData();
    for (const value of Object.values(data.checks)) {
      expect(typeof value).toBe("boolean");
    }
  });

  it("checks 항목에 필수 키가 모두 포함된다", () => {
    const data = buildHealthCheckData();
    const expected = [
      "supabaseUrl",
      "supabaseAnonKey",
      "supabaseServiceRoleKey",
      "kakaoMapKey",
      "kakaoRestApiKey",
      "odsayApiKey",
      "weatherApiKey",
      "anthropicApiKey",
    ];
    for (const key of expected) {
      expect(key in data.checks).toBe(true);
    }
  });

  it("실제 키 값이 응답 문자열에 포함되지 않는다", () => {
    const data = buildHealthCheckData();
    const text = JSON.stringify(data);
    expect(text).not.toContain("KakaoAK ");
    expect(text).not.toContain("sk-ant-");
    expect(text).not.toContain("serviceKey=");
    expect(text).not.toContain("Bearer ");
  });

  it("금지 표현이 포함되지 않는다", () => {
    const data = buildHealthCheckData();
    const text = JSON.stringify(data);
    for (const word of FORBIDDEN) {
      expect(text.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  it("environment 필드가 문자열이다", () => {
    const data = buildHealthCheckData();
    expect(typeof data.environment).toBe("string");
  });

  it("message 필드가 비어 있지 않다", () => {
    const data = buildHealthCheckData();
    expect(data.message.length).toBeGreaterThan(0);
  });
});
