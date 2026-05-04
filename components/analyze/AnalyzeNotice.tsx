import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";

export function AnalyzeNotice() {
  return (
    <div
      style={{
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-lg)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        border: "1px solid var(--sw-hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="shield" size={16} color="var(--sw-primary)" />
        <span
          style={{
            fontSize: "var(--sw-fs-xs)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink-2)",
          }}
        >
          분석 안내
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <StatusPill label="의사결정 보조용" tone="info" />
        <StatusPill label="과거 패턴 기반 예측형 혼잡도" tone="muted" />
        <StatusPill label="Mock API" tone="muted" />
      </div>

      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          fontSize: 13,
          color: "var(--sw-ink-2)",
          lineHeight: 1.7,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <li>운전 위험 지수는 실제 사고 가능성이 아닌 의사결정 보조용 지수입니다.</li>
        <li>혼잡도는 AFC 과거 데이터 기반 예측이며 실시간 정보가 아닙니다.</li>
        <li>현재 장소 검색·거리·경로 계산은 Mock 단계입니다.</li>
        <li>면허 반납은 당사자와 가족이 함께 논의할 사항입니다.</li>
      </ul>
    </div>
  );
}
