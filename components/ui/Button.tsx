"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "kakao";
type ButtonSize = "lg" | "md";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
};

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: "var(--sw-primary)",  color: "var(--sw-ink-inv)", boxShadow: "var(--sw-e2)" },
  secondary: { background: "var(--sw-card)",      color: "var(--sw-primary)", border: "2px solid var(--sw-primary)" },
  ghost:     { background: "transparent",         color: "var(--sw-primary)" },
  kakao:     { background: "var(--sw-kakao)",     color: "var(--sw-kakao-ink)", boxShadow: "var(--sw-e2)" },
};

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  icon,
  disabled = false,
  onClick,
  children,
  type = "button",
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const style: React.CSSProperties = {
    ...VARIANT_STYLES[variant],
    border: variant === "secondary" ? "2px solid var(--sw-primary)" : "none",
    height: size === "lg" ? 60 : 52,
    minHeight: 52,
    padding: "0 24px",
    borderRadius: "var(--sw-r-lg)",
    fontSize: size === "lg" ? "var(--sw-fs-md)" : "var(--sw-fs-base)",
    fontWeight: "var(--sw-fw-bold)",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: fullWidth ? "100%" : "auto",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transform: pressed ? "scale(0.96)" : "scale(1)",
    transition: `transform var(--sw-d-fast) var(--sw-ease), background var(--sw-d-fast), box-shadow var(--sw-d-fast)`,
  };

  return (
    <button
      type={type}
      style={style}
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}
