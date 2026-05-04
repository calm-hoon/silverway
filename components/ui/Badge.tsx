import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};

const STYLES: Record<BadgeVariant, { bg: string; fg: string; border?: string }> = {
  default: { bg: "var(--sw-primary-50)",  fg: "var(--sw-primary)" },
  success: { bg: "var(--sw-safe-bg)",     fg: "#166534" },
  warning: { bg: "var(--sw-warning-bg)",  fg: "#9A3412" },
  danger:  { bg: "var(--sw-danger-bg)",   fg: "#991B1B" },
  muted:   { bg: "var(--sw-paper-elev)",  fg: "var(--sw-ink-3)", border: "1px solid var(--sw-hairline)" },
};

export function Badge({ variant = "default", children }: BadgeProps) {
  const s = STYLES[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        background: s.bg,
        color: s.fg,
        border: s.border,
        borderRadius: "var(--sw-r-full)",
        fontSize: "var(--sw-fs-xs)",
        fontWeight: "var(--sw-fw-bold)",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
