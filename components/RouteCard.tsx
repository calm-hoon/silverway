import { Icon } from "./ui/Icon";
import { Chip } from "./ui/Chip";
import { RiskScore } from "./ui/RiskScore";

type Tone = "danger" | "warning" | "safe";
type Factor = { tone: "danger" | "warning" | "safe" | "primary" | "accent" | "neutral"; icon?: string; label: string };

type RouteCardProps = {
  kind: "drive" | "transit";
  score: number;
  scoreTone: Tone;
  time: string;
  sub: string;
  factors: Factor[];
  recommended?: boolean;
  onSelect?: () => void;
};

const TONE_COLOR: Record<Tone, string> = {
  danger:  "var(--sw-danger)",
  warning: "var(--sw-warning)",
  safe:    "var(--sw-safe)",
};

const TONE_BG: Record<Tone, string> = {
  danger:  "var(--sw-danger-bg)",
  warning: "var(--sw-warning-bg)",
  safe:    "var(--sw-safe-bg)",
};

export function RouteCard({ kind, score, scoreTone, time, sub, factors, recommended = false, onSelect }: RouteCardProps) {
  const accent = TONE_COLOR[scoreTone];
  const iconBg = TONE_BG[scoreTone];

  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: recommended ? "var(--sw-e3)" : "var(--sw-e2)",
        padding: "20px 20px 20px",
        paddingTop: 24,
        border: recommended ? `2px solid ${accent}` : "2px solid transparent",
        transition: "all 280ms cubic-bezier(0.2,0.8,0.2,1)",
        cursor: onSelect ? "pointer" : "default",
      }}
    >
      {/* colored top bar */}
      <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 4, background: accent, borderRadius: "0 0 4px 4px" }} />

      {/* 추천 badge */}
      {recommended && (
        <div style={{
          position: "absolute", top: -14, left: 20,
          padding: "4px 12px", background: accent, color: "#fff",
          borderRadius: "var(--sw-r-full)", fontSize: 13, fontWeight: 700,
        }}>
          추천
        </div>
      )}

      {/* header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "var(--sw-r-lg)",
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name={kind === "drive" ? "car" : "bus"} size={28} color={accent} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--sw-fs-md)", fontWeight: 700, color: "var(--sw-ink)", lineHeight: 1.3 }}>
            {kind === "drive" ? "운전" : "대중교통"}
          </div>
          <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", marginTop: 2 }}>{sub}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <RiskScore score={score} tone={scoreTone} size="lg" />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sw-ink-2)", marginTop: 2 }}>위험도</div>
        </div>
      </div>

      {/* factor chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
        {factors.map((f, i) => (
          <Chip key={i} tone={f.tone} icon={f.icon}>{f.label}</Chip>
        ))}
      </div>

      {/* time row */}
      <div style={{
        marginTop: 16, padding: "12px 14px",
        background: "var(--sw-paper)",
        borderRadius: "var(--sw-r-md)",
        fontSize: "var(--sw-fs-base)", color: "var(--sw-ink)", lineHeight: 1.55,
      }}>
        <span style={{ fontWeight: 700 }}>{time}</span>
        <span style={{ color: "var(--sw-ink-2)" }}>
          {kind === "drive" ? " · 실시간 교통 반영" : ` · 환승 ${(sub.match(/\d+/) ?? ["1"])[0]}회`}
        </span>
      </div>
    </div>
  );
}
