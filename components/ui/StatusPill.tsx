type StatusTone = "info" | "warning" | "muted";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

const TONE_STYLES: Record<StatusTone, { bg: string; fg: string; dot: string }> = {
  info:    { bg: "var(--sw-primary-50)", fg: "var(--sw-primary)",  dot: "var(--sw-primary)" },
  warning: { bg: "var(--sw-warning-bg)", fg: "#9A3412",             dot: "var(--sw-warning)" },
  muted:   { bg: "var(--sw-paper-elev)", fg: "var(--sw-ink-3)",    dot: "var(--sw-ink-3)" },
};

export function StatusPill({ label, tone = "muted" }: StatusPillProps) {
  const s = TONE_STYLES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        background: s.bg,
        color: s.fg,
        borderRadius: "var(--sw-r-full)",
        fontSize: 12,
        fontWeight: "var(--sw-fw-medium)",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
