import { type WeatherRisk, type WeatherCondition } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

function conditionIcon(c: WeatherCondition): string {
  if (c === "RAIN" || c === "HEAVY_RAIN") return "rain";
  if (c === "CLEAR") return "shield";
  return "alert";
}

function conditionBadge(c: WeatherCondition): "success" | "warning" | "danger" | "muted" {
  if (c === "CLEAR") return "success";
  if (c === "RAIN" || c === "HEAVY_RAIN" || c === "SNOW" || c === "FOG") return "warning";
  return "muted";
}

type WeatherSummaryCardProps = {
  weather: WeatherRisk;
};

export function WeatherSummaryCard({ weather }: WeatherSummaryCardProps) {
  const icon = conditionIcon(weather.condition);
  const badge = conditionBadge(weather.condition);

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
      <div
        style={{
          fontSize: "var(--sw-fs-xs)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink-3)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        기상 요약
      </div>

      {/* main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--sw-r-lg)",
            background: badge === "success" ? "var(--sw-safe-bg)" : "var(--sw-warning-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            name={icon}
            size={28}
            color={badge === "success" ? "var(--sw-safe)" : "var(--sw-warning)"}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "var(--sw-fs-lg)",
                fontWeight: "var(--sw-fw-black)",
                color: "var(--sw-ink)",
              }}
            >
              {weather.label}
            </span>
            <Badge variant={badge}>{weather.condition === "CLEAR" ? "맑음" : "주의"}</Badge>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink-2)",
            }}
          >
            {weather.temperatureCelsius != null && (
              <span style={{ fontFeatureSettings: '"tnum"' }}>{weather.temperatureCelsius}°C</span>
            )}
            {weather.windSpeedMs != null && (
              <span style={{ fontFeatureSettings: '"tnum"' }}>바람 {weather.windSpeedMs}m/s</span>
            )}
          </div>
        </div>
      </div>

      {/* risk note */}
      <div
        style={{
          fontSize: "var(--sw-fs-sm)",
          color: "var(--sw-ink-2)",
          lineHeight: 1.65,
          padding: "10px 14px",
          background: "var(--sw-paper)",
          borderRadius: "var(--sw-r-md)",
        }}
      >
        {weather.riskNote}
      </div>

      {/* source */}
      <div style={{ fontSize: 12, color: "var(--sw-ink-3)" }}>
        {weather.source}
      </div>
    </div>
  );
}
