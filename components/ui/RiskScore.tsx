type ScoreTone = "danger" | "warning" | "safe";
type ScoreSize = "lg" | "md";

type RiskScoreProps = {
  score: number;
  tone: ScoreTone;
  size?: ScoreSize;
};

const COLORS: Record<ScoreTone, string> = {
  danger:  "var(--sw-danger)",
  warning: "var(--sw-warning)",
  safe:    "var(--sw-safe)",
};

export function RiskScore({ score, tone, size = "md" }: RiskScoreProps) {
  const numSize = size === "lg" ? "var(--sw-fs-num)" : "44px";
  const unitSize = size === "lg" ? "22px" : "18px";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span
        style={{
          fontSize: numSize,
          fontWeight: "var(--sw-fw-black)",
          color: COLORS[tone],
          fontFeatureSettings: '"tnum"',
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        {score}
      </span>
      <span style={{ fontSize: unitSize, fontWeight: "var(--sw-fw-bold)", color: "var(--sw-ink-2)" }}>
        점
      </span>
    </div>
  );
}
