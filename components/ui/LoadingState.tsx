type LoadingStateProps = {
  message?: string;
  subMessage?: string;
};

export function LoadingState({
  message = "분석 결과를 준비하고 있습니다.",
  subMessage,
}: LoadingStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 16,
        textAlign: "center",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "3px solid var(--sw-hairline)",
          borderTopColor: "var(--sw-primary)",
          animation: "sw-spin 0.8s linear infinite",
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes sw-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--sw-fs-base)",
            fontWeight: "var(--sw-fw-medium)",
            color: "var(--sw-ink)",
          }}
        >
          {message}
        </p>
        {subMessage && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink-3)",
              lineHeight: 1.6,
            }}
          >
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}
