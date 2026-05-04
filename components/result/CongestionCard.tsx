import { type TransitCongestion, type CongestionLevel } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusPill";

const LEVEL_CONFIG: Record<CongestionLevel, { label: string; badgeVariant: "success" | "warning" | "danger"; bar: string; pct: number }> = {
  LOW:    { label: "여유",   badgeVariant: "success", bar: "var(--sw-safe)",    pct: 30 },
  MEDIUM: { label: "보통",   badgeVariant: "warning", bar: "var(--sw-warning)", pct: 60 },
  HIGH:   { label: "혼잡",   badgeVariant: "danger",  bar: "var(--sw-danger)",  pct: 90 },
};

type CongestionCardProps = {
  congestion: TransitCongestion | null;
};

export function CongestionCard({ congestion }: CongestionCardProps) {
  if (!congestion) {
    return (
      <div
        style={{
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-xl)",
          boxShadow: "var(--sw-e2)",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)" }}>
          혼잡도 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  const cfg = LEVEL_CONFIG[congestion.level];
  const displayPct = congestion.ratio != null ? Math.round(congestion.ratio * 100) : cfg.pct;

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: "var(--sw-fs-xs)",
              fontWeight: "var(--sw-fw-bold)",
              color: "var(--sw-ink-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            혼잡도
          </div>
          <StatusPill label="과거 패턴 기반 예측형 혼잡도" tone="muted" />
        </div>
        <Badge variant={cfg.badgeVariant}>{congestion.label}</Badge>
      </div>

      {/* visual bar */}
      <div>
        <div
          style={{
            height: 12,
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${displayPct}%`,
              background: cfg.bar,
              borderRadius: "var(--sw-r-full)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 12,
            color: "var(--sw-ink-3)",
          }}
        >
          <span>여유</span>
          <span>혼잡</span>
        </div>
      </div>

      {/* meta */}
      {(congestion.stationName || congestion.hour != null) && (
        <div
          style={{
            fontSize: 13,
            color: "var(--sw-ink-2)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {congestion.stationName && <span>기준 역: {congestion.stationName}</span>}
          {congestion.hour != null && <span>시간대: {congestion.hour}시</span>}
          {congestion.ratio != null && (
            <span>평균 대비: {(congestion.ratio * 100).toFixed(0)}%</span>
          )}
        </div>
      )}

      {/* description */}
      <div
        style={{
          fontSize: "var(--sw-fs-sm)",
          color: "var(--sw-ink-2)",
          lineHeight: 1.65,
        }}
      >
        {congestion.description}
      </div>
    </div>
  );
}
