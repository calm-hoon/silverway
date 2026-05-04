import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import { AnalyzeForm } from "@/components/analyze/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--sw-paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px 16px",
          minHeight: 56,
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--sw-r-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="back" size={26} color="var(--sw-ink)" />
          </div>
        </Link>
        <div
          style={{
            flex: 1,
            fontSize: "var(--sw-fs-md)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink)",
            textAlign: "center",
          }}
        >
          경로 분석
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div
        style={{
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "0 20px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          flex: 1,
        }}
      >
        {/* 페이지 설명 */}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "var(--sw-fs-xl)",
              fontWeight: "var(--sw-fw-black)",
              color: "var(--sw-ink)",
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
            }}
          >
            이동 정보를 입력해 주세요
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink-2)",
              lineHeight: 1.6,
            }}
          >
            운전 위험 지수와 대중교통 대안을 함께 확인할 수 있어요.
          </p>
          <div style={{ marginTop: 10 }}>
            <StatusPill label="현재 Mock 분석 단계" tone="muted" />
          </div>
        </div>

        {/* 입력 폼 */}
        <AnalyzeForm />
      </div>
    </main>
  );
}
