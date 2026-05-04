export function MapPlaceholder() {
  return (
    <div
      style={{
        height: 140,
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-lg)",
        border: "1px dashed var(--sw-hairline-strong)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--sw-ink-3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <div
        style={{
          fontSize: 13,
          color: "var(--sw-ink-3)",
          textAlign: "center",
          lineHeight: 1.5,
          padding: "0 20px",
        }}
      >
        지도와 경로 시각화는 Kakao Map 연동 단계에서 제공됩니다.
      </div>
    </div>
  );
}
