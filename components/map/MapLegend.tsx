type LegendItem = {
  color: string;
  label: string;
  shape?: "circle" | "line";
};

const LEGEND_ITEMS: LegendItem[] = [
  { color: "#0A5A75", label: "출발지", shape: "circle" },
  { color: "#E05A2B", label: "도착지", shape: "circle" },
  { color: "#0A5A75", label: "위치 참고선 (실제 이동 경로가 아닙니다)", shape: "line" },
];

export function MapLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 16px",
        padding: "10px 14px",
        background: "var(--sw-paper-elev)",
        borderRadius: "var(--sw-r-md)",
        border: "1px solid var(--sw-hairline)",
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {item.shape === "line" ? (
            <svg width="24" height="10" aria-hidden="true">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            </svg>
          ) : (
            <svg width="12" height="12" aria-hidden="true">
              <circle cx="6" cy="6" r="5" fill={item.color} />
            </svg>
          )}
          <span
            style={{
              fontSize: 12,
              color: "var(--sw-ink-2)",
              lineHeight: 1.4,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
