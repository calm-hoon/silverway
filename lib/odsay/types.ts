import type { TransitSummary } from "@/types";

export type OdsayRouteRequest = {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
};

export type OdsayRouteResult =
  | { ok: true; transit: TransitSummary; source: "ODSAY" }
  | { ok: false; transit: TransitSummary; source: "FALLBACK"; reason: string };

// ODsay 원본 응답 내부 파싱용 — 필요한 최소 필드만 정의
export type OdsaySubPath = {
  trafficType?: number;
  sectionTime?: number;
  distance?: number;
  lane?: Array<{ name?: string; busNo?: string }>;
  startName?: string;
  endName?: string;
};

export type OdsayPath = {
  pathType?: number;
  info?: {
    totalTime?: number;
    busTransitCount?: number;
    subwayTransitCount?: number;
    totalWalk?: number;
  };
  subPath?: OdsaySubPath[];
};

export type OdsayRawResponse = {
  result?: {
    path?: OdsayPath[];
  };
  error?: {
    code?: string;
    message?: string;
  };
};
