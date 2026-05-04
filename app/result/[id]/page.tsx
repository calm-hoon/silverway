import Link from "next/link";
import { getAnalysisLogById } from "@/lib/supabase/analysisLogs";
import { Icon } from "@/components/ui/Icon";
import { ResultFallbackNotice } from "@/components/result/ResultFallbackNotice";
import { ResultPageView } from "@/components/result/ResultPageView";

type ResultDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;

  const lookupResult = await getAnalysisLogById(id);
  const analysis = lookupResult.ok ? lookupResult.result : lookupResult.fallback;
  const isFallback = !lookupResult.ok;

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
        <Link href="/analyze" style={{ textDecoration: "none" }}>
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
          분석 결과
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
          gap: 16,
        }}
      >
        {isFallback && <ResultFallbackNotice requestedId={id} />}

        <ResultPageView analysis={analysis} />
      </div>
    </main>
  );
}
