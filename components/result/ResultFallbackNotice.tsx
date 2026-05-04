import { StatusPill } from "@/components/ui/StatusPill";

type ResultFallbackNoticeProps = {
  requestedId?: string;
};

export function ResultFallbackNotice({ requestedId }: ResultFallbackNoticeProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-lg)",
        border: "1px solid var(--sw-hairline)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <StatusPill label="Mock 결과" tone="muted" />
        {requestedId && (
          <span
            style={{
              fontSize: 12,
              color: "var(--sw-ink-3)",
              fontFeatureSettings: '"tnum"',
            }}
          >
            ID: {requestedId}
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--sw-ink-2)",
          lineHeight: 1.6,
        }}
      >
        현재 결과는 시연용 Mock 데이터를 기반으로 표시됩니다.
        실제 저장 결과 조회는 Supabase 연결 단계에서 제공될 예정입니다.
      </p>
    </div>
  );
}
