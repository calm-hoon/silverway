import { type RiskLevel, type TimeRecommendation } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

const LEVEL_COLOR: Record<RiskLevel, string> = {
  LOW: "var(--sw-safe)",
  MEDIUM: "var(--sw-warning)",
  HIGH: "var(--sw-danger)",
};

type TimeRecommendationCardProps = {
  recommendation?: TimeRecommendation;
};

export function TimeRecommendationCard({ recommendation }: TimeRecommendationCardProps) {
  if (!recommendation || recommendation.slots.length === 0) return null;

  const { recommendedHour, recommendedLabel, reason, slots, generatedBy } = recommendation;
  const maxScore = Math.max(...slots.map((s) => s.score), 1);

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="clock" size={18} color="var(--sw-primary)" />
          <div
            style={{
              fontSize: "var(--sw-fs-xs)",
              fontWeight: "var(--sw-fw-bold)",
              color: "var(--sw-ink-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            AI 최적 출발 시간대 추천
          </div>
        </div>
        <Badge variant={generatedBy === "CLAUDE" ? "default" : "muted"}>
          {generatedBy === "CLAUDE" ? "Claude AI 추천" : "요약 추천"}
        </Badge>
      </div>

      {/* 추천 시간대 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "var(--sw-primary-50)",
          borderRadius: "var(--sw-r-lg)",
        }}
      >
        <div
          style={{
            fontSize: "var(--sw-fs-lg)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-primary)",
            whiteSpace: "nowrap",
          }}
        >
          {recommendedLabel}
        </div>
        <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", lineHeight: 1.6 }}>
          {reason}
        </div>
      </div>

      {/* 시간대별 비교 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slots.map((slot) => {
          const isRecommended = slot.hour === recommendedHour;
          const ratio = slot.score / maxScore;
          return (
            <div key={slot.hour} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 56,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: isRecommended ? "var(--sw-fw-bold)" : 400,
                  color: isRecommended ? "var(--sw-primary)" : "var(--sw-ink-3)",
                }}
              >
                {slot.label}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "var(--sw-paper-elev)",
                  borderRadius: "var(--sw-r-full)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(ratio * 100, 4)}%`,
                    background: LEVEL_COLOR[slot.level],
                    borderRadius: "var(--sw-r-full)",
                    outline: isRecommended ? "2px solid var(--sw-primary)" : "none",
                    outlineOffset: 1,
                  }}
                />
              </div>
              <div
                style={{
                  width: 32,
                  flexShrink: 0,
                  textAlign: "right",
                  fontSize: 12,
                  fontWeight: "var(--sw-fw-bold)",
                  color: "var(--sw-ink-2)",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {slot.score}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          paddingTop: 8,
          borderTop: "1px solid var(--sw-hairline)",
          fontSize: 12,
          color: "var(--sw-ink-3)",
          lineHeight: 1.6,
        }}
      >
        시간대별 운전 위험 지수는 같은 날의 상대 비교용 참고 자료이며, 실제 사고 가능성을 의미하지 않습니다.
      </div>
    </div>
  );
}
