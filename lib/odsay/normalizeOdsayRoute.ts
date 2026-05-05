import type { TransitSummary, TransitStep } from "@/types";
import type { OdsaySubPath } from "./types";

function mapTrafficType(type: number): "WALK" | "SUBWAY" | "BUS" {
  if (type === 1) return "SUBWAY";
  if (type === 2) return "BUS";
  return "WALK";
}

function normalizeSubPath(sp: unknown): TransitStep | null {
  if (!sp || typeof sp !== "object") return null;
  const s = sp as OdsaySubPath;

  const trafficType = Number(s.trafficType ?? 3);
  const mode = mapTrafficType(trafficType);
  const durationMin = Number(s.sectionTime ?? 0);
  const distanceM = s.distance != null ? Number(s.distance) : undefined;

  if (mode === "WALK") {
    return {
      mode,
      durationMin,
      distanceM,
      description: `도보 이동 (${durationMin}분)`,
    };
  }

  const lane = Array.isArray(s.lane) ? s.lane[0] : undefined;
  const lineName = mode === "SUBWAY"
    ? String(lane?.name ?? "")
    : String(lane?.busNo ?? "");
  const stationFrom = String(s.startName ?? "");
  const stationTo = String(s.endName ?? "");

  const description = mode === "SUBWAY"
    ? `${stationFrom}역 승차 → ${stationTo}역 하차 (${lineName})`
    : `${stationFrom} 탑승 → ${stationTo} 하차 (${lineName})`;

  return { mode, lineName, stationFrom, stationTo, durationMin, distanceM, description };
}

// ODsay 원본 응답 → TransitSummary 변환. 경로 없음/파싱 실패 시 null 반환.
// 혼잡도(congestion)는 AFC 기반이므로 여기서 설정하지 않는다.
export function normalizeOdsayRoute(raw: unknown): TransitSummary | null {
  try {
    if (!raw || typeof raw !== "object") return null;

    const root = raw as Record<string, unknown>;
    const result = root["result"];
    if (!result || typeof result !== "object") return null;

    const paths = (result as Record<string, unknown>)["path"];
    if (!Array.isArray(paths) || paths.length === 0) return null;

    const path = paths[0] as Record<string, unknown>;
    const info = path["info"] as Record<string, unknown> | undefined;
    const subPaths = path["subPath"];

    if (!info || !Array.isArray(subPaths) || subPaths.length === 0) return null;

    const totalDurationMin = Number(info["totalTime"] ?? 0);
    const busTransitCount = Number(info["busTransitCount"] ?? 0);
    const subwayTransitCount = Number(info["subwayTransitCount"] ?? 0);
    const transferCount = busTransitCount + subwayTransitCount;

    const steps = subPaths
      .map(normalizeSubPath)
      .filter((step): step is TransitStep => step !== null);

    if (steps.length === 0) return null;

    return {
      available: true,
      route: {
        totalDurationMin,
        transferCount,
        steps,
        source: "ODsay API",
      },
      congestion: null,
    };
  } catch {
    return null;
  }
}
