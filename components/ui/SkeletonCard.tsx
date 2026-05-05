type SkeletonCardProps = {
  lines?: number;
  height?: number;
};

export function SkeletonCard({ lines = 3, height }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e1)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: height ? `${height}px` : undefined,
      }}
    >
      <style>{`
        @keyframes sw-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .sw-skeleton { animation: sw-pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* Title bar */}
      <div
        className="sw-skeleton"
        style={{
          height: 18,
          width: "45%",
          background: "var(--sw-paper-elev)",
          borderRadius: "var(--sw-r-sm)",
        }}
      />

      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="sw-skeleton"
          style={{
            height: 14,
            width: i === lines - 1 ? "65%" : "100%",
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-sm)",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
