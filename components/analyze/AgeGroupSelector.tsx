import { type AgeGroup } from "@/types";

type AgeGroupSelectorProps = {
  value: AgeGroup | "";
  onChange: (group: AgeGroup) => void;
};

const OPTIONS: { id: AgeGroup; label: string }[] = [
  { id: "60s", label: "60대" },
  { id: "70s", label: "70대" },
  { id: "80s", label: "80대 이상" },
];

export function AgeGroupSelector({ value, onChange }: AgeGroupSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div
          style={{
            fontSize: "var(--sw-fs-sm)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink)",
          }}
        >
          연령대
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--sw-ink-3)",
            marginTop: 4,
          }}
        >
          운전 위험 지수 보정에 사용됩니다.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              style={{
                flex: 1,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--sw-fs-base)",
                fontWeight: active ? "var(--sw-fw-bold)" : "var(--sw-fw-medium)",
                fontFamily: "inherit",
                color: active ? "#fff" : "var(--sw-ink)",
                background: active ? "var(--sw-primary)" : "var(--sw-card)",
                border: active ? "2px solid var(--sw-primary)" : "2px solid transparent",
                borderRadius: "var(--sw-r-lg)",
                boxShadow: active ? "var(--sw-e2)" : "var(--sw-e1)",
                cursor: "pointer",
                transition: "all var(--sw-d-fast) var(--sw-ease)",
                minHeight: "var(--sw-touch)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
