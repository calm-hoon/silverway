import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RouteCompare } from "@/components/RouteCompare";
import { AIReport } from "@/components/AIReport";

type ResultDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;

  return (
    <main style={{
      minHeight: "100dvh",
      background: "var(--sw-paper)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 16px 16px", minHeight: 56,
        maxWidth: 480, width: "100%", margin: "0 auto",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--sw-r-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="back" size={26} color="var(--sw-ink)" />
          </div>
        </Link>
        <div style={{
          flex: 1, fontSize: "var(--sw-fs-md)", fontWeight: 700,
          color: "var(--sw-ink)", textAlign: "center",
        }}>
          경로 비교 결과
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div style={{
        maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "0 20px 40px",
        display: "flex", flexDirection: "column", gap: 32,
      }}>
        {/* TODO (작업 11.5): Supabase에서 id={id}로 실제 분석 결과 조회 */}
        <RouteCompare recommendation="transit" weather="rain" />

        <div style={{ borderTop: "1px solid var(--sw-hairline)", paddingTop: 32 }}>
          <AIReport
            name="어머니"
            destination="목적지"
            recommendation="transit"
            drivingScore={78}
            transitRoute="지하철 + 도보 4분"
          />
        </div>
      </div>
    </main>
  );
}
