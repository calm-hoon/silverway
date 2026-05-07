type MapFallbackProps = {
  reason?: "key" | "error" | "no-coords" | "generic";
  height?: number | string;
  devHint?: string;
};

export function MapFallback({ reason = "generic", height = 200, devHint }: MapFallbackProps) {
  const message =
    reason === "no-coords"
      ? "출발지와 도착지 좌표가 확보되면 지도에 표시됩니다."
      : reason === "key"
      ? "Kakao Maps 키가 설정되지 않았습니다. 환경 변수를 확인해주세요."
      : "지도를 불러오지 못해도 분석 결과는 계속 확인할 수 있습니다.";

  return (
    <div
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-xl)",
        border: "1px dashed var(--sw-hairline-strong)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "0 24px",
      }}
    >
      <svg
        width="36"
        height="36"
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
          fontSize: "var(--sw-fs-sm)",
          color: "var(--sw-ink-3)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {message}
      </div>
      {devHint && process.env.NODE_ENV === "development" && (
        <div
          style={{
            fontSize: 11,
            color: "#B45309",
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: 6,
            padding: "6px 10px",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          {devHint}
        </div>
      )}
    </div>
  );
}
