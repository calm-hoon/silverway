type ErrorStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "결과를 불러오지 못했습니다",
  description = "현재 표시된 결과는 의사결정 보조용 참고 정보입니다. 잠시 후 다시 시도해 보세요.",
  actionLabel = "다시 시도",
  actionHref,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 20,
        textAlign: "center",
        minHeight: 280,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--sw-r-full)",
          background: "var(--sw-warning-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B45309"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--sw-fs-lg)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "var(--sw-fs-sm)",
            color: "var(--sw-ink-2)",
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              padding: "12px 20px",
              minHeight: 48,
              background: "var(--sw-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--sw-r-lg)",
              fontSize: "var(--sw-fs-sm)",
              fontWeight: "var(--sw-fw-medium)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {actionLabel}
          </button>
        )}
        {actionHref && (
          <a
            href={actionHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 20px",
              minHeight: 48,
              background: "var(--sw-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--sw-r-lg)",
              fontSize: "var(--sw-fs-sm)",
              fontWeight: "var(--sw-fw-medium)",
              fontFamily: "inherit",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {actionLabel}
          </a>
        )}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            minHeight: 48,
            background: "transparent",
            color: "var(--sw-ink-2)",
            border: "1px solid var(--sw-hairline-strong)",
            borderRadius: "var(--sw-r-lg)",
            fontSize: "var(--sw-fs-sm)",
            fontWeight: "var(--sw-fw-medium)",
            fontFamily: "inherit",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          홈으로
        </a>
      </div>
    </div>
  );
}
