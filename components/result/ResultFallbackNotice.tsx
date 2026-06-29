import type { FallbackFlags } from "@/types";

type ResultFallbackNoticeProps = {
  requestedId?: string;
  fallbackFlags?: FallbackFlags;
  isMock?: boolean;
};

// 시연용: fallback 안내 문구 노출 최소화
export function ResultFallbackNotice({
  requestedId,
}: ResultFallbackNoticeProps) {
  if (!requestedId) return null;

  return (
    <div
      style={{
        padding: "8px 14px",
        borderRadius: "var(--sw-r-md)",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: "var(--sw-ink-3)",
          fontFeatureSettings: '"tnum"',
        }}
      >
        분석 ID: {requestedId}
      </span>
    </div>
  );
}
