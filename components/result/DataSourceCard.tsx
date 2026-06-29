import { Icon } from "@/components/ui/Icon";

// 공공데이터별 역할 설명 고정 정의
const PUBLIC_DATA_SOURCES = [
  {
    name: "도로교통공단 TAAS",
    role: "출발지 구(區) 기준 고령 운전자 사고 패턴 → 위험 지수 반영",
    type: "사전적재",
  },
  {
    name: "대전교통공사 AFC",
    role: "대전 1호선 역별·시간대별 과거 승차인원 → 혼잡도 예측",
    type: "사전적재",
  },
  {
    name: "기상청 단기예보",
    role: "출발지 실시간 날씨(강수·풍속) → 위험 지수 보정",
    type: "실시간 API",
  },
];

type DataSourceCardProps = {
  sources?: string[];
  fallbackFlags?: Record<string, boolean>;
};

export function DataSourceCard({ }: DataSourceCardProps) {
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

      {/* sources list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PUBLIC_DATA_SOURCES.map((src) => (
          <div
            key={src.name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "12px 14px",
              background: "var(--sw-paper)",
              borderRadius: "var(--sw-r-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="shield" size={15} color="var(--sw-primary)" />
              <span style={{ fontSize: "var(--sw-fs-sm)", fontWeight: "var(--sw-fw-bold)", color: "var(--sw-ink)", flex: 1 }}>
                {src.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: src.type === "실시간 API" ? "var(--sw-safe)" : "var(--sw-ink-3)",
                  fontWeight: 600,
                  background: src.type === "실시간 API" ? "var(--sw-safe-50)" : "var(--sw-paper-elev)",
                  padding: "2px 7px",
                  borderRadius: "var(--sw-r-full)",
                  whiteSpace: "nowrap",
                }}
              >
                {src.type}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--sw-ink-3)", lineHeight: 1.55, paddingLeft: 23 }}>
              {src.role}
            </div>
          </div>
        ))}
      </div>

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
        위험 지수는 실제 사고 확률이 아닌 공공데이터 기반 의사결정 보조 지수입니다.
      </div>
    </div>
  );
}
