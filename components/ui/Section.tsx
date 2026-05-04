import { type ReactNode } from "react";

type SectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function Section({ title, description, children }: SectionProps) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(title || description) && (
        <div>
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: "var(--sw-fs-lg)",
                fontWeight: "var(--sw-fw-bold)",
                color: "var(--sw-ink)",
                letterSpacing: "-0.01em",
                lineHeight: "var(--sw-lh-snug)",
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "var(--sw-fs-base)",
                color: "var(--sw-ink-2)",
                lineHeight: "var(--sw-lh-normal)",
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
