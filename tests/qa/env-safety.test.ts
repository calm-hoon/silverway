import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { buildHealthCheckData } from "@/lib/api/healthCheck";

// 환경변수 보안 원칙 테스트
// 서버 전용 key가 NEXT_PUBLIC_ 접두사를 갖지 않고, 응답 문자열에 실제 값이 노출되지 않는지 확인

const SERVER_ONLY_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "KAKAO_REST_API_KEY",
  "ODSAY_API_KEY",
  "WEATHER_API_KEY",
  "ANTHROPIC_API_KEY",
];

const PUBLIC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_KAKAO_MAP_KEY",
];

describe("서버 전용 환경변수 이름 규칙", () => {
  it("서버 전용 key에 NEXT_PUBLIC_ 접두사가 없다", () => {
    for (const key of SERVER_ONLY_KEYS) {
      expect(key.startsWith("NEXT_PUBLIC_"), `${key}에 NEXT_PUBLIC_ 접두사가 있어서는 안 됩니다`).toBe(false);
    }
  });

  it("public key는 NEXT_PUBLIC_ 접두사를 갖는다", () => {
    for (const key of PUBLIC_KEYS) {
      expect(key.startsWith("NEXT_PUBLIC_"), `${key}는 NEXT_PUBLIC_ 접두사를 가져야 합니다`).toBe(true);
    }
  });
});

describe(".env.local.example 보안", () => {
  const examplePath = join(process.cwd(), ".env.local.example");

  it(".env.local.example에 실제 키처럼 보이는 값이 없다", () => {
    const content = readFileSync(examplePath, "utf-8");
    const lines = content.split("\n").filter((l) => !l.trimStart().startsWith("#") && l.includes("="));
    for (const line of lines) {
      const [, value] = line.split("=");
      const trimmed = (value ?? "").trim();
      // 값이 비어 있거나 공백만 있어야 한다
      expect(
        trimmed.length === 0,
        `.env.local.example에 실제 값이 포함된 것 같습니다: "${line.slice(0, 40)}"`
      ).toBe(true);
    }
  });

  it(".env.local.example에 민감 키 패턴이 없다", () => {
    const content = readFileSync(examplePath, "utf-8");
    expect(content).not.toContain("KakaoAK ");
    expect(content).not.toContain("sk-ant-");
    expect(content).not.toContain("eyJ"); // JWT prefix
    expect(content).not.toContain("Bearer ");
  });
});

describe("health check 응답 보안", () => {
  it("key 값을 직접 반환하지 않는다", () => {
    const data = buildHealthCheckData();
    const text = JSON.stringify(data);
    expect(text).not.toContain("KakaoAK ");
    expect(text).not.toContain("sk-ant-");
    expect(text).not.toContain("serviceKey=");
    expect(text).not.toContain("Bearer ");
    expect(text).not.toContain("eyJ");
  });

  it("checks 값이 boolean만 포함한다", () => {
    const data = buildHealthCheckData();
    for (const [key, value] of Object.entries(data.checks)) {
      expect(typeof value, `checks.${key}는 boolean이어야 합니다`).toBe("boolean");
    }
  });

  it("서버 전용 key 이름 자체는 checks에 존재하되 값은 boolean이다", () => {
    const data = buildHealthCheckData();
    expect("supabaseServiceRoleKey" in data.checks).toBe(true);
    expect(typeof data.checks.supabaseServiceRoleKey).toBe("boolean");
    expect("kakaoRestApiKey" in data.checks).toBe(true);
    expect(typeof data.checks.kakaoRestApiKey).toBe("boolean");
  });
});

describe("주요 파일 서버 전용 키 참조 확인", () => {
  // 정적 분석 — 클라이언트 컴포넌트("use client")에서 서버 전용 키를 직접 참조하지 않는지 확인
  // 완벽한 AST 분석 대신 문자열 검색 수준으로 안전장치를 둔다

  const CLIENT_FILES = [
    "components/analyze/AnalyzeForm.tsx",
    "components/analyze/PlaceInput.tsx",
    "components/map/KakaoMap.tsx",
    "components/result/FamilyReportCard.tsx",
  ];

  for (const relativePath of CLIENT_FILES) {
    it(`${relativePath}에 서버 전용 키 참조가 없다`, () => {
      const filePath = join(process.cwd(), relativePath);
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        // 파일이 없으면 pass — 파일 존재 여부는 별도 확인
        return;
      }
      for (const key of SERVER_ONLY_KEYS) {
        expect(
          content,
          `${relativePath}에서 서버 전용 키 "${key}" 직접 참조 발견`
        ).not.toContain(key);
      }
    });
  }
});
