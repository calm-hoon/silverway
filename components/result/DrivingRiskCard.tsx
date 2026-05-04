import { type DrivingRisk, type RiskLevel } from "@/types";
import { RiskScore } from "@/components/ui/RiskScore";
import { Badge } from "@/components/ui/Badge";

const LEVEL_CONFIG: Record<RiskLevel, { badgeVariant: "success" | "warning" | "danger"; bg: string; bar: string }> = {
  LOW:    { badgeVariant: "success", bg: "var(--sw-safe-50)",    bar: "var(--sw-safe)" },
  MEDIUM: { badgeVariant: "warning", bg: "var(--sw-warning-50)", bar: "var(--sw-warning)" },
  HIGH:   { badgeVariant: "danger",  bg: "var(--sw-danger-50)",  bar: "var(--sw-danger)" },
};

const TONE: Record<RiskLevel, "safe" | "warning" | "danger"> = {
  LOW: "safe", MEDIUM: "warning", HIGH: "danger",
};

type DrivingRiskCardProps = {
  risk: DrivingRisk;
};

export function DrivingRiskCard({ risk }: DrivingRiskCardProps) {
  const cfg = LEVEL_CONFIG[risk.level];
  const tone = TONE[risk.level];

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        overflow: "hidden",
      }}
    >
      {/* top accent bar */}
      <div
        style={{
          height: 5,
          background: cfg.bar,
        }}
      />

      <div style={{ padding: "20px" }}>
        <div
          style={{
            fontSize: "var(--sw-fs-xs)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink-3)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          운전 위험 지수
        </div>

        {/* score row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 16 }}>
          <RiskScore score={risk.score} tone={tone} size="lg" />
          <div style={{ paddingBottom: 4 }}>
            <Badge variant={cfg.badgeVariant}>{risk.label}</Badge>
          </div>
        </div>

        {/* score bar */}
        <div
          style={{
            height: 10,
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-full)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${risk.score}%`,
              background: cfg.bar,
              borderRadius: "var(--sw-r-full)",
              transition: "width var(--sw-d-med) var(--sw-ease)",
            }}
          />
        </div>

        {/* disclaimer */}
        <div
          style={{
            padding: "12px 14px",
            background: cfg.bg,
            borderRadius: "var(--sw-r-md)",
            fontSize: 13,
            color: "var(--sw-ink-2)",
            lineHeight: 1.65,
          }}
        >
          {risk.description}
        </div>
      </div>
    </div>
  );
}
