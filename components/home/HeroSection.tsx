import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";

export function HeroSection() {
  return (
    <div
      style={{
        background: "var(--sw-primary)",
        borderRadius: "var(--sw-r-xl)",
        padding: "32px 28px 36px",
        boxShadow: "0 8px 32px rgba(10,90,117,0.30)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        color: "#fff",
      }}
    >
      {/* badge */}
      <div>
        <StatusPill label="공공데이터·AI 활용 서비스" tone="muted" />
      </div>

      {/* heading */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
          SilverWay
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--sw-fs-2xl)",
            fontWeight: "var(--sw-fw-black)",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          부모님 이동,<br />
          데이터로 함께 결정하세요
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "var(--sw-fs-base)",
            lineHeight: 1.65,
            opacity: 0.88,
          }}
        >
          공공데이터 사고 패턴·날씨·혼잡도를 조합해<br />
          운전 부담을 수치로 확인하고 대중교통 대안을 찾아드려요.
        </p>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/analyze"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            height: 56,
            background: "#fff",
            color: "var(--sw-primary)",
            borderRadius: "var(--sw-r-lg)",
            fontSize: "var(--sw-fs-md)",
            fontWeight: "var(--sw-fw-bold)",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            minHeight: "var(--sw-touch)",
          }}
        >
          <Icon name="pin" size={22} color="var(--sw-primary)" />
          분석 시작하기
        </Link>
        <Link
          href="/result/test"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: 52,
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "var(--sw-r-lg)",
            fontSize: "var(--sw-fs-base)",
            fontWeight: "var(--sw-fw-medium)",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.30)",
            minHeight: "var(--sw-touch)",
          }}
        >
          예시 결과 보기
          <Icon name="next" size={18} color="#fff" />
        </Link>
      </div>
    </div>
  );
}
