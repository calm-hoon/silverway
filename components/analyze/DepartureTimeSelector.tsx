import { Icon } from "@/components/ui/Icon";

export type DepartureSlot = "morning" | "afternoon" | "evening" | "custom";

type DepartureTimeSelectorProps = {
  value: DepartureSlot | "";
  customTime: string;
  onChangeSlot: (slot: DepartureSlot) => void;
  onChangeCustomTime: (time: string) => void;
};

const SLOTS: { id: DepartureSlot; label: string; sub: string }[] = [
  { id: "morning",   label: "오늘 오전", sub: "오전 10시" },
  { id: "afternoon", label: "오늘 오후", sub: "오후 2시" },
  { id: "evening",   label: "오늘 저녁", sub: "오후 7시" },
  { id: "custom",    label: "직접 선택", sub: "날짜·시간 지정" },
];

export function DepartureTimeSelector({
  value,
  customTime,
  onChangeSlot,
  onChangeCustomTime,
}: DepartureTimeSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          fontSize: "var(--sw-fs-sm)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink)",
        }}
      >
        출발 시간
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {SLOTS.map((slot) => {
          const active = value === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChangeSlot(slot.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                background: active ? "var(--sw-primary)" : "var(--sw-card)",
                border: active ? "2px solid var(--sw-primary)" : "2px solid transparent",
                borderRadius: "var(--sw-r-lg)",
                boxShadow: active ? "var(--sw-e2)" : "var(--sw-e1)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all var(--sw-d-fast) var(--sw-ease)",
                minHeight: "var(--sw-touch)",
              }}
            >
              <Icon
                name="clock"
                size={20}
                color={active ? "#fff" : "var(--sw-primary)"}
              />
              <div>
                <div
                  style={{
                    fontSize: "var(--sw-fs-sm)",
                    fontWeight: "var(--sw-fw-bold)",
                    color: active ? "#fff" : "var(--sw-ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {slot.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: active ? "rgba(255,255,255,0.8)" : "var(--sw-ink-3)",
                    marginTop: 2,
                  }}
                >
                  {slot.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value === "custom" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 52,
            padding: "0 16px",
            background: "var(--sw-card)",
            borderRadius: "var(--sw-r-lg)",
            boxShadow: "0 0 0 2px var(--sw-primary), 0 0 0 6px rgba(10,90,117,0.18)",
          }}
        >
          <Icon name="clock" size={18} color="var(--sw-primary)" />
          <input
            type="datetime-local"
            value={customTime}
            onChange={(e) => onChangeCustomTime(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "var(--sw-fs-base)",
              fontFamily: "inherit",
              color: "var(--sw-ink)",
            }}
          />
        </div>
      )}
    </div>
  );
}
