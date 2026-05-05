import type { FallbackFlags } from "@/types";
import { FallbackNotice } from "@/components/ui/FallbackNotice";
import { StatusPill } from "@/components/ui/StatusPill";
import { hasAnyFallback } from "@/lib/fallback/fallbackFlags";

type ResultFallbackNoticeProps = {
  requestedId?: string;
  fallbackFlags?: FallbackFlags;
  isMock?: boolean;
};

export function ResultFallbackNotice({
  requestedId,
  fallbackFlags,
  isMock = false,
}: ResultFallbackNoticeProps) {
  const showFallback = isMock || hasAnyFallback(fallbackFlags);
  if (!showFallback && !requestedId) return null;

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
        {isMock && <StatusPill label="예시 결과" tone="muted" />}
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

      {showFallback && (
        <FallbackNotice
          fallbackFlags={fallbackFlags}
          message={
            isMock
              ? "현재 결과는 예시 데이터를 기반으로 표시됩니다."
              : undefined
          }
          compact
        />
      )}

      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "var(--sw-ink-3)",
          lineHeight: 1.5,
        }}
      >
        외부 API 연결 상태와 관계없이 결과 화면은 계속 확인할 수 있습니다.
      </p>
    </div>
  );
}
