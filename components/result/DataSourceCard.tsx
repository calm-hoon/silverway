import { type FallbackFlags } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

type DataSourceCardProps = {
  sources: string[];
  fallbackFlags?: FallbackFlags;
};

export function DataSourceCard({ sources, fallbackFlags }: DataSourceCardProps) {
  const hasFallback = Object.values(fallbackFlags ?? {}).some(Boolean);

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e1)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* header */}
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
          활용 공공데이터
        </div>
        {hasFallback && <Badge variant="muted">일부 Mock 적용</Badge>}
      </div>

      {/* sources list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((src, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "var(--sw-paper)",
              borderRadius: "var(--sw-r-md)",
            }}
          >
            <Icon name="shield" size={16} color="var(--sw-primary)" />
            <span style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", flex: 1 }}>
              {src}
            </span>
          </div>
        ))}
      </div>

      {hasFallback && (
        <div
          style={{
            fontSize: 12,
            color: "var(--sw-ink-3)",
            lineHeight: 1.6,
            padding: "8px 12px",
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-md)",
          }}
        >
          현재 일부 데이터는 시연용 Mock 또는 Fallback으로 대체되어 있습니다.
          실제 API 연동 후 공공데이터 기반 분석이 제공됩니다.
        </div>
      )}
    </div>
  );
}
