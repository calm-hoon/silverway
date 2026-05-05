// SERVER ONLY — Supabase AFC 재차인원 데이터 조회. 클라이언트 컴포넌트에서 import 금지.
// AFC 데이터는 실시간 정보가 아닌 과거 패턴 기반 예측형 혼잡도 산정용입니다.
import { createAdminClient } from "@/lib/supabase/server";
import type { AfcStationLoad } from "@/types";

type GetAfcStationLoadsResult =
  | { ok: true; loads: AfcStationLoad[]; source: "SUPABASE" }
  | { ok: false; reason: string; source: "FALLBACK" };

/** 역명 + 시간대 기준 AFC 재차인원 조회 (과거 패턴 기반 예측형 혼잡도용) */
export async function getAfcStationLoads(params: {
  stationName: string;
  hour: number;
  direction?: "UP" | "DOWN";
}): Promise<GetAfcStationLoadsResult> {
  const { stationName, hour, direction } = params;

  if (!stationName?.trim()) {
    return { ok: false, reason: "STATION_NAME_EMPTY", source: "FALLBACK" };
  }

  const client = createAdminClient();
  if (!client) {
    return { ok: false, reason: "DB_CLIENT_MISSING", source: "FALLBACK" };
  }

  try {
    let query = client
      .from("afc_station_loads")
      .select("station_name, hour, direction, onboard_count, service_day_type")
      .eq("station_name", stationName)
      .eq("hour", hour);

    if (direction) {
      query = query.eq("direction", direction);
    }

    const { data, error } = await query.limit(200);

    if (error) {
      console.error("[SilverWay] afc_station_loads 조회 실패:", error.code, error.hint ?? "");
      return { ok: false, reason: "DB_QUERY_FAILED", source: "FALLBACK" };
    }

    if (!data || data.length === 0) {
      return { ok: false, reason: "AFC_DATA_NOT_FOUND", source: "FALLBACK" };
    }

    const loads: AfcStationLoad[] = data.map((row) => ({
      stationName: String(row.station_name),
      hour: Number(row.hour),
      direction: mapDirection(String(row.direction ?? "")),
      onboardCount: Number(row.onboard_count ?? 0),
      serviceDayType: mapServiceDayType(String(row.service_day_type ?? "")),
    }));

    return { ok: true, loads, source: "SUPABASE" };
  } catch (e) {
    console.error("[SilverWay] afc_station_loads 조회 예외:", e instanceof Error ? e.message : String(e));
    return { ok: false, reason: "DB_EXCEPTION", source: "FALLBACK" };
  }
}

/** 전체 평균 계산용 — 같은 시간대 전체 역 onboard_count 평균 조회 */
export async function getAfcHourlyAverage(hour: number): Promise<number | null> {
  const client = createAdminClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("afc_station_loads")
      .select("onboard_count")
      .eq("hour", hour)
      .limit(2000);

    if (error || !data || data.length === 0) return null;

    const total = data.reduce((sum, row) => sum + Number(row.onboard_count ?? 0), 0);
    return total / data.length;
  } catch {
    return null;
  }
}

function mapDirection(raw: string): "UP" | "DOWN" | "UNKNOWN" {
  if (raw === "UP" || raw === "상행") return "UP";
  if (raw === "DOWN" || raw === "하행") return "DOWN";
  return "UNKNOWN";
}

function mapServiceDayType(raw: string): "WEEKDAY" | "WEEKEND" | "HOLIDAY" {
  if (raw === "WEEKDAY" || raw === "평일") return "WEEKDAY";
  if (raw === "HOLIDAY" || raw === "휴일") return "HOLIDAY";
  return "WEEKDAY";
}
