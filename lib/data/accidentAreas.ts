// SERVER ONLY — Supabase 사고 지역 데이터 조회. 클라이언트 컴포넌트에서 import 금지.
import { createAdminClient } from "@/lib/supabase/server";

export type AccidentAreaData = {
  sido: string;
  sigungu: string;
  dong?: string | null;
  region_full_name?: string | null;
  accident_count: number;
  elderly_driver_count: number;
  fatal_count: number;
  severe_count: number;
  risk_score: number;
};

type GetAccidentAreaResult =
  | { ok: true; data: AccidentAreaData; source: "SUPABASE" }
  | { ok: false; reason: string; source: "FALLBACK" };

/** 주소 문자열에서 구 이름을 추출한다 (예: "대전 서구 둔산로 100" → "서구") */
export function extractSigungu(address: string): string | null {
  if (!address) return null;
  const match = address.match(/([가-힣]+구)\b/);
  return match ? match[1] : null;
}

/** sigungu 기준으로 accident_areas 조회. 매칭 없으면 FALLBACK */
export async function getAccidentAreaBySigungu(sigungu: string): Promise<GetAccidentAreaResult> {
  if (!sigungu?.trim()) {
    return { ok: false, reason: "SIGUNGU_EMPTY", source: "FALLBACK" };
  }

  const client = createAdminClient();
  if (!client) {
    return { ok: false, reason: "DB_CLIENT_MISSING", source: "FALLBACK" };
  }

  try {
    const { data, error } = await client
      .from("accident_areas")
      .select("sido, sigungu, dong, region_full_name, accident_count, elderly_driver_count, fatal_count, severe_count, risk_score")
      .eq("sigungu", sigungu)
      .order("source_year_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[SilverWay] accident_areas 조회 실패:", error.code, error.hint ?? "");
      return { ok: false, reason: "DB_QUERY_FAILED", source: "FALLBACK" };
    }

    if (!data) {
      return { ok: false, reason: "AREA_NOT_FOUND", source: "FALLBACK" };
    }

    return {
      ok: true,
      source: "SUPABASE",
      data: {
        sido: data.sido,
        sigungu: data.sigungu,
        dong: data.dong ?? null,
        region_full_name: data.region_full_name ?? null,
        accident_count: data.accident_count ?? 0,
        elderly_driver_count: data.elderly_driver_count ?? 0,
        fatal_count: data.fatal_count ?? 0,
        severe_count: data.severe_count ?? 0,
        risk_score: Number(data.risk_score ?? 0),
      },
    };
  } catch (e) {
    console.error("[SilverWay] accident_areas 조회 예외:", e instanceof Error ? e.message : String(e));
    return { ok: false, reason: "DB_EXCEPTION", source: "FALLBACK" };
  }
}
