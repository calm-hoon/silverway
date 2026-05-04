type MapTone = "safe" | "warning" | "danger";

const ACCENT: Record<MapTone, string> = {
  safe:    "#16A34A",
  warning: "#F97316",
  danger:  "#DC2626",
};

export function SWMap({ tone = "safe" }: { tone?: MapTone }) {
  const color = ACCENT[tone];
  return (
    <div
      style={{
        position: "relative",
        height: 160,
        borderRadius: "var(--sw-r-lg)",
        overflow: "hidden",
        background: "#EAEAE0",
      }}
    >
      <svg viewBox="0 0 400 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="160" fill="#EFEBDF" />
        <path d="M-10 110 Q 80 90 160 100 T 410 80" stroke="#fff" strokeWidth="14" fill="none" />
        <path d="M-10 110 Q 80 90 160 100 T 410 80" stroke="#D4CCBC" strokeWidth="2" fill="none" strokeDasharray="6 6" />
        <path d="M70 -10 Q 90 80 70 170" stroke="#fff" strokeWidth="10" fill="none" />
        <path d="M260 -10 Q 280 80 260 170" stroke="#fff" strokeWidth="10" fill="none" />
        <rect x="100" y="20" width="50" height="35" rx="6" fill="#D6E5C9" />
        <rect x="290" y="100" width="60" height="40" rx="6" fill="#D6E5C9" />
        <path d="M40 130 Q 100 120 140 100 T 280 70 L 340 50" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="130" r="9" fill="#fff" stroke={color} strokeWidth="4" />
        <circle cx="340" cy="50" r="9" fill={color} stroke="#fff" strokeWidth="3" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "4px 10px",
          background: "rgba(255,255,255,0.92)",
          borderRadius: "var(--sw-r-full)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--sw-ink-2)",
          backdropFilter: "blur(4px)",
        }}
      >
        지도 미리보기
      </div>
    </div>
  );
}
