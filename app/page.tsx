import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function HomePage() {
  const recents = [
    { name: "서울아산병원",    date: "어제 · 대중교통" },
    { name: "잠실 종합운동장", date: "3일 전 · 운전" },
  ];

  return (
    <main style={{
      minHeight: "100dvh",
      background: "var(--sw-paper)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* status bar spacer */}
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      <div style={{
        maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "28px 20px 40px",
        display: "flex", flexDirection: "column", gap: 24, flex: 1,
      }}>
        {/* greeting */}
        <div>
          <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", fontWeight: 500 }}>
            안녕하세요, 영자 님
          </div>
          <h1 style={{
            fontSize: "var(--sw-fs-2xl)", fontWeight: 800, lineHeight: 1.25,
            letterSpacing: "-0.015em", margin: "6px 0 0", color: "var(--sw-ink)",
          }}>
            오늘은 어디로<br />가시나요?
          </h1>
        </div>

        {/* CTA button */}
        <Link href="/analyze" style={{ textDecoration: "none" }}>
          <div style={{
            width: "100%", textAlign: "left",
            background: "var(--sw-primary)",
            borderRadius: "var(--sw-r-xl)",
            padding: 20,
            boxShadow: "0 8px 32px rgba(10,90,117,0.30)",
            color: "#fff",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "var(--sw-r-lg)",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="pin" size={28} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--sw-fs-md)", fontWeight: 700 }}>안전한 길 찾아드릴게요</div>
              <div style={{ fontSize: "var(--sw-fs-sm)", opacity: 0.85, marginTop: 2 }}>날씨 · 사고 · 경로 비교</div>
            </div>
            <Icon name="next" size={26} color="#fff" />
          </div>
        </Link>

        {/* today status */}
        <div>
          <div style={{
            fontSize: "var(--sw-fs-xs)", fontWeight: 700, color: "var(--sw-ink-3)",
            letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12,
          }}>
            오늘의 상황
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              flex: 1, background: "var(--sw-card)", borderRadius: "var(--sw-r-lg)",
              padding: 16, boxShadow: "var(--sw-e2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="rain" size={22} color="var(--sw-warning)" />
                <span style={{ fontSize: "var(--sw-fs-xs)", fontWeight: 700, color: "#9A3412" }}>비 옴</span>
              </div>
              <div style={{
                fontSize: "var(--sw-fs-lg)", fontWeight: 800, color: "var(--sw-ink)",
                marginTop: 8, fontFeatureSettings: '"tnum"',
              }}>
                14°
              </div>
              <div style={{ fontSize: 13, color: "var(--sw-ink-2)", marginTop: 2 }}>오후 내내 흐림</div>
            </div>

            <div style={{
              flex: 1, background: "var(--sw-card)", borderRadius: "var(--sw-r-lg)",
              padding: 16, boxShadow: "var(--sw-e2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="alert" size={22} color="var(--sw-danger)" />
                <span style={{ fontSize: "var(--sw-fs-xs)", fontWeight: 700, color: "#991B1B" }}>주변 사고</span>
              </div>
              <div style={{
                fontSize: "var(--sw-fs-lg)", fontWeight: 800, color: "var(--sw-ink)",
                marginTop: 8, fontFeatureSettings: '"tnum"',
              }}>
                3건
              </div>
              <div style={{ fontSize: 13, color: "var(--sw-ink-2)", marginTop: 2 }}>최근 24시간</div>
            </div>
          </div>
        </div>

        {/* recent places */}
        <div>
          <div style={{
            fontSize: "var(--sw-fs-xs)", fontWeight: 700, color: "var(--sw-ink-3)",
            letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12,
          }}>
            최근 다녀오신 곳
          </div>
          <div style={{
            background: "var(--sw-card)", borderRadius: "var(--sw-r-lg)",
            padding: "4px 16px", boxShadow: "var(--sw-e1)",
          }}>
            {recents.map((r, i) => (
              <div key={r.name} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
                borderBottom: i < recents.length - 1 ? "1px solid var(--sw-hairline)" : "none",
              }}>
                <Icon name="pin" size={20} color="var(--sw-ink-2)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "var(--sw-fs-sm)", fontWeight: 600, color: "var(--sw-ink)" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: "var(--sw-fs-xs)", color: "var(--sw-ink-3)", marginTop: 2 }}>
                    {r.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* dev links */}
        <div style={{
          marginTop: "auto", paddingTop: 8,
          display: "flex", gap: 8,
          fontSize: 13, color: "var(--sw-ink-3)",
        }}>
          <Link href="/result/test" style={{ color: "var(--sw-primary)", fontWeight: 600 }}>
            테스트 결과 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
