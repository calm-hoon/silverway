import { type DrivingRiskFactor } from "@/types";

const FACTOR_COLORS: Record<string, string> = {
  area:     "var(--sw-danger)",
  time:     "var(--sw-primary)",
  weather:  "var(--sw-warning)",
  age:      "#9C5D2E",
  distance: "var(--sw-ink-3)",
};

type RiskFactorListProps = {
  factors: DrivingRiskFactor[];
};

export function RiskFactorList({ factors }: RiskFactorListProps) {
  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: "var(--sw-fs-xs)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink-3)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        위험 지수 구성 요소
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {factors.map((f) => {
          const max = f.maxScore ?? 100;
          const ratio = Math.min(f.score / max, 1);
          const color = FACTOR_COLORS[f.key] ?? "var(--sw-ink-3)";

          return (
            <div key={f.key}>
              {/* label + score */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: "var(--sw-fs-sm)",
                    fontWeight: "var(--sw-fw-bold)",
                    color: "var(--sw-ink)",
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontSize: "var(--sw-fs-sm)",
                    fontWeight: "var(--sw-fw-bold)",
                    color,
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {f.score}
                  {f.maxScore && (
                    <span style={{ fontWeight: 400, color: "var(--sw-ink-3)" }}>/{f.maxScore}</span>
                  )}
                </span>
              </div>

              {/* progress bar */}
              <div
                style={{
                  height: 6,
                  background: "var(--sw-paper-elev)",
                  borderRadius: "var(--sw-r-full)",
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${ratio * 100}%`,
                    background: color,
                    borderRadius: "var(--sw-r-full)",
                  }}
                />
              </div>

              {/* description */}
              <div
                style={{
                  fontSize: 13,
                  color: "var(--sw-ink-2)",
                  lineHeight: 1.55,
                }}
              >
                {f.description}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 8,
          paddingTop: 12,
          borderTop: "1px solid var(--sw-hairline)",
          fontSize: 12,
          color: "var(--sw-ink-3)",
          lineHeight: 1.6,
        }}
      >
        각 구성 요소 점수는 의사결정 보조용이며, 실제 사고 위험을 직접 나타내지 않습니다.
      </div>
    </div>
  );
}
