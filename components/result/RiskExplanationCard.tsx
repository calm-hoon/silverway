import { type ReportGeneratedBy } from "@/types";
import { Badge } from "@/components/ui/Badge";

type RiskExplanationCardProps = {
  explanation?: string;
  generatedBy?: ReportGeneratedBy;
};

export function RiskExplanationCard({ explanation, generatedBy }: RiskExplanationCardProps) {
  if (!explanation) return null;

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: "var(--sw-fs-xs)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink-3)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          AI 위험 요인 해설
        </div>
        <Badge variant={generatedBy === "CLAUDE" ? "default" : "muted"}>
          {generatedBy === "CLAUDE" ? "Claude AI 분석" : "요약 분석"}
        </Badge>
      </div>

      <div
        style={{
          fontSize: "var(--sw-fs-sm)",
          color: "var(--sw-ink-2)",
          lineHeight: 1.7,
          padding: "12px 14px",
          background: "var(--sw-paper)",
          borderRadius: "var(--sw-r-md)",
        }}
      >
        {explanation}
      </div>
    </div>
  );
}
