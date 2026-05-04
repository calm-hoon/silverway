import { type ReactNode } from "react";
import { Icon } from "./Icon";

type ChipTone = "danger" | "warning" | "safe" | "primary" | "accent" | "neutral";

type ChipProps = {
  tone?: ChipTone;
  icon?: string;
  children: ReactNode;
};

const TONE_STYLES: Record<ChipTone, { bg: string; fg: string; border?: string }> = {
  danger:  { bg: "var(--sw-danger-bg)",  fg: "#991B1B" },
  warning: { bg: "var(--sw-warning-bg)", fg: "#9A3412" },
  safe:    { bg: "var(--sw-safe-bg)",    fg: "#166534" },
  primary: { bg: "var(--sw-primary-50)", fg: "var(--sw-primary)" },
  accent:  { bg: "var(--sw-accent-50)",  fg: "#9C5D2E" },
  neutral: { bg: "var(--sw-card)",       fg: "var(--sw-ink-2)", border: "1px solid var(--sw-hairline)" },
};

export function Chip({ tone = "neutral", icon, children }: ChipProps) {
  const t = TONE_STYLES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        background: t.bg,
        color: t.fg,
        borderRadius: "var(--sw-r-full)",
        fontSize: "var(--sw-fs-xs)",
        fontWeight: "var(--sw-fw-medium)",
        border: t.border,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <Icon name={icon} size={15} stroke={2.4} color={t.fg} />}
      {children}
    </span>
  );
}
