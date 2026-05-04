import { Icon } from "./ui/Icon";
import { RouteCard } from "./RouteCard";
import { SWMap } from "./map/SWMap";

type RecommendMode = "transit" | "drive";
type WeatherMode = "clear" | "rain" | "night";

type RouteCompareProps = {
  recommendation?: RecommendMode;
  weather?: WeatherMode;
};

const DRIVE_DATA = {
  clear: {
    score: 38, tone: "warning" as const,
    factors: [
      { tone: "warning" as const, icon: "alert", label: "사고다발구간" },
      { tone: "neutral" as const, label: "평일 낮" },
    ],
  },
  rain: {
    score: 78, tone: "danger" as const,
    factors: [
      { tone: "warning" as const, icon: "rain", label: "우천" },
      { tone: "danger" as const, icon: "alert", label: "시야 저하" },
    ],
  },
  night: {
    score: 64, tone: "warning" as const,
    factors: [
      { tone: "warning" as const, label: "야간 운전" },
      { tone: "warning" as const, label: "시야 저하" },
    ],
  },
};

const TRANSIT_DATA = {
  clear: {
    score: 22, tone: "safe" as const,
    factors: [
      { tone: "safe" as const, icon: "shield", label: "권장 경로" },
      { tone: "primary" as const, label: "환승 1회" },
    ],
  },
  rain: {
    score: 28, tone: "safe" as const,
    factors: [
      { tone: "safe" as const, icon: "shield", label: "권장 경로" },
      { tone: "primary" as const, label: "환승 1회" },
      { tone: "accent" as const, icon: "walk", label: "도보 4분" },
    ],
  },
  night: {
    score: 35, tone: "warning" as const,
    factors: [
      { tone: "primary" as const, label: "환승 1회" },
      { tone: "warning" as const, label: "야간 시간대" },
    ],
  },
};

const HEADLINES = {
  rain: {
    title: "비 오는 날엔 버스가 더 편하실 거예요",
    sub:   "집 앞 정류장에서 한 번에 가요. 계단 없는 경로로 안내드릴게요.",
    why:   "오늘은 비 소식이 있어 시야가 흐려질 수 있어요.",
  },
  clear: {
    title: "맑은 날, 둘 다 괜찮아요",
    sub:   "대중교통이 조금 더 여유로워요. 정류장도 가까워요.",
    why:   "오늘은 길이 좋아요. 운전도 무리 없으세요.",
  },
  night: {
    title: "늦은 시간엔 천천히 다녀오세요",
    sub:   "버스가 자주 와요. 환승 한 번이면 도착해요.",
    why:   "야간엔 두 경로 모두 평소보다 조심하시는 게 좋아요.",
  },
};

export function RouteCompare({ recommendation = "transit", weather = "rain" }: RouteCompareProps) {
  const drive = DRIVE_DATA[weather];
  const transit = TRANSIT_DATA[weather];
  const h = HEADLINES[weather];
  const recTransit = recommendation === "transit";

  const bannerBg    = recTransit ? "var(--sw-safe-50)"    : "var(--sw-danger-50)";
  const bannerBorder = recTransit ? "#BBF7D0"               : "#FECACA";
  const bannerColor  = recTransit ? "#166534"               : "#991B1B";
  const shieldColor  = recTransit ? "var(--sw-safe)"        : "var(--sw-danger)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* recommendation banner */}
      <div style={{
        background: bannerBg, borderRadius: "var(--sw-r-xl)",
        padding: 18, border: `1px solid ${bannerBorder}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 700, color: bannerColor,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          <Icon name="shield" size={16} color={shieldColor} />
          오늘의 추천
        </div>
        <div style={{ fontSize: "var(--sw-fs-xl)", fontWeight: 800, color: "var(--sw-ink)", marginTop: 6, lineHeight: 1.35 }}>
          {h.title}
        </div>
        <div style={{ fontSize: "var(--sw-fs-base)", color: "var(--sw-ink)", marginTop: 8, lineHeight: 1.6 }}>
          {h.sub}
        </div>
        <div style={{ fontSize: "var(--sw-fs-xs)", color: "var(--sw-ink-2)", marginTop: 8, lineHeight: 1.55 }}>
          {h.why}
        </div>
      </div>

      <SWMap tone={recTransit ? "safe" : "danger"} />

      <RouteCard
        kind="transit"
        score={transit.score}
        scoreTone={transit.tone}
        time="32분"
        sub="지하철 + 도보 4분"
        factors={transit.factors}
        recommended={recTransit}
      />
      <RouteCard
        kind="drive"
        score={drive.score}
        scoreTone={drive.tone}
        time="24분"
        sub="자가용 · 7.2km"
        factors={drive.factors}
        recommended={!recTransit}
      />
    </div>
  );
}
