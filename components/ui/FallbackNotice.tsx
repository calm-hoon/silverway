import type { FallbackFlags } from "@/types";
import { hasAnyFallback } from "@/lib/fallback/fallbackFlags";

type FallbackNoticeProps = {
  fallbackFlags?: FallbackFlags;
  message?: string;
  compact?: boolean;
};

export function FallbackNotice({ fallbackFlags, message, compact = false }: FallbackNoticeProps) {
  if (!message && !hasAnyFallback(fallbackFlags)) return null;

  const displayMessage =
    message ?? "일부 외부 데이터를 불러오지 못해 예시 데이터를 함께 사용했습니다.";

  if (compact) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "var(--sw-ink-3)",
          lineHeight: 1.5,
        }}
      >
        {displayMessage}
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "10px 14px",
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-md)",
        border: "1px solid var(--sw-hairline)",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--sw-ink-3)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginTop: 2, flexShrink: 0 }}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--sw-ink-2)",
          lineHeight: 1.6,
        }}
      >
        {displayMessage} 결과 화면은 계속 확인할 수 있습니다.
      </p>
    </div>
  );
}
