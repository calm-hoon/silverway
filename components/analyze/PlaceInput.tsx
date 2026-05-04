import { Icon } from "@/components/ui/Icon";

type PlaceInputProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export function PlaceInput({
  label,
  value,
  onChange,
  placeholder = "장소 또는 주소",
}: PlaceInputProps) {
  const filled = value.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: "var(--sw-fs-sm)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink)",
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 56,
          padding: "0 16px",
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-lg)",
          boxShadow: filled
            ? "0 0 0 2px var(--sw-primary), 0 0 0 6px rgba(10,90,117,0.18)"
            : "var(--sw-e2)",
          transition: "box-shadow var(--sw-d-fast) var(--sw-ease)",
        }}
      >
        <Icon name="pin" size={20} color={filled ? "var(--sw-primary)" : "var(--sw-ink-3)"} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--sw-fs-base)",
            fontFamily: "inherit",
            color: "var(--sw-ink)",
            fontWeight: filled ? "var(--sw-fw-medium)" : "var(--sw-fw-regular)",
          }}
        />
        {filled && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="입력 지우기"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "var(--sw-r-full)",
              border: "none",
              background: "var(--sw-paper-elev)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={14} color="var(--sw-ink-3)" />
          </button>
        )}
      </div>
    </div>
  );
}
