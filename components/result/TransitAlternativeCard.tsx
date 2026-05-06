import { type TransitSummary, type TransitStep } from "@/types";
import { Icon } from "@/components/ui/Icon";

function modeIcon(mode: TransitStep["mode"]): string {
  if (mode === "WALK") return "walk";
  if (mode === "SUBWAY") return "train";
  return "bus";
}

function modeLabelColor(mode: TransitStep["mode"]): { label: string; bg: string; fg: string } {
  if (mode === "WALK")   return { label: "도보",   bg: "var(--sw-paper-elev)", fg: "var(--sw-ink-2)" };
  if (mode === "SUBWAY") return { label: "지하철", bg: "var(--sw-primary-50)", fg: "var(--sw-primary)" };
  return { label: "버스", fg: "#166534", bg: "var(--sw-safe-bg)" };
}

type TransitAlternativeCardProps = {
  transit: TransitSummary;
};

export function TransitAlternativeCard({ transit }: TransitAlternativeCardProps) {
  if (!transit.available || !transit.route) {
    return (
      <div
        style={{
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-xl)",
          boxShadow: "var(--sw-e2)",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)" }}>
          현재 구간의 대중교통 경로 정보를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  const { route } = transit;
  const isFallback = route.source.includes("fallback");

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: "var(--sw-fs-xs)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink-3)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          대중교통 대체 경로
        </div>
      </div>

      {isFallback ? (
        <div
          style={{
            fontSize: "var(--sw-fs-sm)",
            color: "var(--sw-ink-2)",
            lineHeight: 1.6,
            padding: "14px 16px",
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-lg)",
          }}
        >
          현재 구간의 대중교통 실시간 경로를 불러올 수 없습니다. 네이버 지도 또는 카카오맵에서 직접 확인해 주세요.
        </div>
      ) : (
        <>
          {/* summary */}
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: "14px 16px",
              background: "var(--sw-safe-50)",
              borderRadius: "var(--sw-r-lg)",
              border: "1px solid #BBF7D0",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "var(--sw-fs-2xl)",
                  fontWeight: "var(--sw-fw-black)",
                  color: "var(--sw-safe)",
                  fontFeatureSettings: '"tnum"',
                  lineHeight: 1.1,
                }}
              >
                {route.totalDurationMin}
              </div>
              <div style={{ fontSize: 12, color: "var(--sw-ink-2)", marginTop: 2 }}>분</div>
            </div>
            <div style={{ width: 1, background: "#BBF7D0" }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "var(--sw-fs-2xl)",
                  fontWeight: "var(--sw-fw-black)",
                  color: "var(--sw-safe)",
                  fontFeatureSettings: '"tnum"',
                  lineHeight: 1.1,
                }}
              >
                {route.transferCount}
              </div>
              <div style={{ fontSize: 12, color: "var(--sw-ink-2)", marginTop: 2 }}>환승</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ fontSize: "var(--sw-fs-sm)", color: "#166534", fontWeight: "var(--sw-fw-medium)", lineHeight: 1.5 }}>
                이동권 보장 동선으로 안내드립니다.
              </div>
            </div>
          </div>

          {/* steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {route.steps.map((step, i) => {
              const mc = modeLabelColor(step.mode);
              const isLast = i === route.steps.length - 1;

              return (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  {/* timeline */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--sw-r-md)",
                        background: mc.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={modeIcon(step.mode)} size={18} color={mc.fg} />
                    </div>
                    {!isLast && (
                      <div
                        style={{
                          flex: 1,
                          width: 2,
                          background: "var(--sw-hairline)",
                          margin: "4px 0",
                          minHeight: 16,
                        }}
                      />
                    )}
                  </div>

                  {/* content */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16, paddingTop: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: "var(--sw-fw-bold)",
                          color: mc.fg,
                          background: mc.bg,
                          padding: "2px 8px",
                          borderRadius: "var(--sw-r-full)",
                        }}
                      >
                        {mc.label}
                      </span>
                      {step.lineName && (
                        <span style={{ fontSize: 13, color: "var(--sw-ink-2)", fontWeight: "var(--sw-fw-medium)" }}>
                          {step.lineName}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--sw-ink-3)",
                          marginLeft: "auto",
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {step.durationMin}분
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", lineHeight: 1.5 }}>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* source note */}
          <div
            style={{
              fontSize: 12,
              color: "var(--sw-ink-3)",
              lineHeight: 1.5,
              padding: "8px 12px",
              background: "var(--sw-paper-elev)",
              borderRadius: "var(--sw-r-md)",
            }}
          >
            ODsay 대중교통 정보를 기반으로 제공됩니다.
          </div>
        </>
      )}
    </div>
  );
}
