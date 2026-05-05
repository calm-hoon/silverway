import type { AnalysisResult } from "@/types";
import { createMapPointFromPlace, isValidCoordinate } from "./mapUtils";
import { KakaoMap } from "./KakaoMap";
import { MapFallback } from "./MapFallback";
import { MapLegend } from "./MapLegend";

type MapSectionProps = {
  analysis: AnalysisResult;
};

export function MapSection({ analysis }: MapSectionProps) {
  const { origin, destination } = analysis.request;

  const originPoint = createMapPointFromPlace(origin, "origin");
  const destPoint = createMapPointFromPlace(destination, "destination");

  const hasCoords =
    isValidCoordinate(origin.lat, origin.lng) &&
    isValidCoordinate(destination.lat, destination.lng);

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e1)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Section header */}
      <div
        style={{
          fontSize: "var(--sw-fs-sm)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink)",
        }}
      >
        이동 위치 확인
      </div>

      {/* Map or fallback */}
      {hasCoords ? (
        <KakaoMap
          origin={originPoint ?? undefined}
          destination={destPoint ?? undefined}
          showLine
          height={320}
        />
      ) : (
        <MapFallback reason="no-coords" height={200} />
      )}

      {/* Legend */}
      {hasCoords && <MapLegend />}

      {/* Guide text */}
      <div
        style={{
          fontSize: 12,
          color: "var(--sw-ink-3)",
          lineHeight: 1.6,
        }}
      >
        지도는 출발지와 도착지 위치 이해를 돕는 보조 정보입니다.
        대중교통 경로는 ODsay 조회 결과를 기반으로 하며, 지도 선은 실제 이동 경로와 다를 수 있습니다.
      </div>
    </div>
  );
}
