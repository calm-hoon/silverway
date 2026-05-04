import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RouteCompare } from "@/components/RouteCompare";
import { AIReport } from "@/components/AIReport";

export default function TestResultPage() {
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
            width: 44, height: 44, borderRadius: "var(--sw-r-md)", border: "none",
            background: "transparent", cursor: "pointer",
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

      {/* destination label */}
      <div style={{
        maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "0 20px 8px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", fontWeight: 500,
        }}>
          <Icon name="pin" size={18} color="var(--sw-primary)" />
          서울아산병원까지
        </div>
      </div>

      <div style={{
        maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "0 20px 40px",
        display: "flex", flexDirection: "column", gap: 32,
      }}>
        <RouteCompare recommendation="transit" weather="rain" />

        <div style={{ borderTop: "1px solid var(--sw-hairline)", paddingTop: 32 }}>
          <AIReport
            name="어머니"
            destination="서울아산병원"
            recommendation="transit"
            drivingScore={78}
            transitRoute="지하철 + 도보 4분"
          />
        </div>
      </div>
    </main>
  );
}
