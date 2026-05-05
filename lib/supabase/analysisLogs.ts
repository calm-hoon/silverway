// SERVER ONLY — service role key 사용. 클라이언트 컴포넌트에서 import 금지.
import { createAdminClient } from "@/lib/supabase/server";
import { createMockResultById } from "@/lib/fallback/createMockResultById";
import { sampleAnalysis } from "@/lib/fallback/sampleAnalysis";
import type { AnalysisResult, AnalysisLogRow, Json } from "@/types";

type SaveAnalysisLogResult =
  | { ok: true; id: string; result: AnalysisResult }
  | { ok: false; reason: string; fallback: AnalysisResult };

type GetAnalysisLogResult =
  | { ok: true; result: AnalysisResult; source: "SUPABASE" }
  | { ok: false; reason: string; fallback: AnalysisResult; source: "FALLBACK" };

function rowToAnalysisResult(row: AnalysisLogRow): AnalysisResult {
  const drivingRisk = (row.risk_factors as unknown as AnalysisResult["drivingRisk"]) ?? sampleAnalysis.drivingRisk;
  const transit = (row.transit_summary as unknown as AnalysisResult["transit"]) ?? sampleAnalysis.transit;
  const report = (row.report as unknown as AnalysisResult["report"]) ?? sampleAnalysis.report;
  const dataSources = Array.isArray(row.data_sources)
    ? (row.data_sources as unknown as string[])
    : sampleAnalysis.dataSources;

  return {
    id: row.id,
    createdAt: row.created_at ?? new Date().toISOString(),
    request: {
      origin: {
        name: row.origin_name ?? sampleAnalysis.request.origin.name,
        address: row.origin_address ?? sampleAnalysis.request.origin.address,
        lat: Number(row.origin_lat ?? sampleAnalysis.request.origin.lat),
        lng: Number(row.origin_lng ?? sampleAnalysis.request.origin.lng),
      },
      destination: {
        name: row.destination_name ?? sampleAnalysis.request.destination.name,
        address: row.destination_address ?? sampleAnalysis.request.destination.address,
        lat: Number(row.destination_lat ?? sampleAnalysis.request.destination.lat),
        lng: Number(row.destination_lng ?? sampleAnalysis.request.destination.lng),
      },
      departureTime: row.departure_time ?? sampleAnalysis.request.departureTime,
      ageGroup: row.age_group ?? sampleAnalysis.request.ageGroup,
    },
    summary: {
      recommendDriving: drivingRisk?.level === "LOW",
      oneLiner: report?.summary ?? sampleAnalysis.summary.oneLiner,
    },
    drivingRisk: drivingRisk ?? sampleAnalysis.drivingRisk,
    transit: transit ?? sampleAnalysis.transit,
    weather: sampleAnalysis.weather,
    report: report ?? sampleAnalysis.report,
    dataSources,
    fallbackFlags: (row.fallback_flags as unknown as AnalysisResult["fallbackFlags"]) ?? {},
  };
}

export async function saveAnalysisLog(result: AnalysisResult): Promise<SaveAnalysisLogResult> {
  const client = createAdminClient();
  if (!client) {
    return { ok: false, reason: "SAVE_FAILED", fallback: result };
  }

  try {
    const { data, error } = await client
      .from("analysis_logs")
      .insert({
        origin_name: result.request.origin.name,
        origin_address: result.request.origin.address,
        origin_lat: result.request.origin.lat,
        origin_lng: result.request.origin.lng,
        destination_name: result.request.destination.name,
        destination_address: result.request.destination.address,
        destination_lat: result.request.destination.lat,
        destination_lng: result.request.destination.lng,
        departure_time: result.request.departureTime,
        age_group: result.request.ageGroup,
        risk_score: result.drivingRisk.score,
        risk_level: result.drivingRisk.level,
        risk_factors: result.drivingRisk as unknown as Json,
        transit_summary: result.transit as unknown as Json,
        report: result.report as unknown as Json,
        data_sources: result.dataSources as unknown as Json,
        fallback_flags: (result.fallbackFlags ?? {}) as unknown as Json,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[SilverWay] analysis_logs insert 실패:", error?.code, error?.hint);
      return { ok: false, reason: "SAVE_FAILED", fallback: result };
    }

    return { ok: true, id: data.id, result: { ...result, id: data.id } };
  } catch (e) {
    console.error("[SilverWay] analysis_logs insert 예외:", e instanceof Error ? e.message : String(e));
    return { ok: false, reason: "SAVE_FAILED", fallback: result };
  }
}

export async function getAnalysisLogById(id: string): Promise<GetAnalysisLogResult> {
  const fallback = createMockResultById(id);

  if (!id?.trim()) {
    return { ok: false, reason: "INVALID_ID", fallback, source: "FALLBACK" };
  }

  const client = createAdminClient();
  if (!client) {
    return { ok: false, reason: "RESULT_NOT_FOUND", fallback, source: "FALLBACK" };
  }

  try {
    const { data, error } = await client
      .from("analysis_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("[SilverWay] analysis_logs select 실패:", error?.code, error?.hint);
      return { ok: false, reason: "RESULT_NOT_FOUND", fallback, source: "FALLBACK" };
    }

    return { ok: true, result: rowToAnalysisResult(data), source: "SUPABASE" };
  } catch (e) {
    console.error("[SilverWay] analysis_logs select 예외:", e instanceof Error ? e.message : String(e));
    return { ok: false, reason: "RESULT_NOT_FOUND", fallback, source: "FALLBACK" };
  }
}
