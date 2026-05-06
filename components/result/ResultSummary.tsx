import { type AnalysisResult } from "@/types";
import { Icon } from "@/components/ui/Icon";

const AGE_LABEL: Record<string, string> = { "60s": "60대", "70s": "70대", "80s": "80대 이상" };

function formatTime(iso: string) {
  const d = new Date(iso);
  // 서버는 UTC 타임존 → KST(+9h) 변환 후 표시
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${String(kst.getUTCHours()).padStart(2, "0")}:${String(kst.getUTCMinutes()).padStart(2, "0")}`;
}

type ResultSummaryProps = {
  analysis: AnalysisResult;
};

export function ResultSummary({ analysis }: ResultSummaryProps) {
  const { request, summary } = analysis;

  return (
    <div
      style={{
        background: summary.recommendDriving ? "var(--sw-primary)" : "var(--sw-safe-50)",
        borderRadius: "var(--sw-r-xl)",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        border: summary.recommendDriving
          ? "none"
          : "1px solid #BBF7D0",
      }}
    >

      {/* route */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--sw-r-full)",
              background: summary.recommendDriving ? "rgba(255,255,255,0.2)" : "var(--sw-primary-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="pin" size={16} color={summary.recommendDriving ? "#fff" : "var(--sw-primary)"} />
          </div>
          <span
            style={{
              fontSize: "var(--sw-fs-base)",
              fontWeight: "var(--sw-fw-bold)",
              color: summary.recommendDriving ? "#fff" : "var(--sw-ink)",
            }}
          >
            {request.origin.name}
          </span>
        </div>
        <div
          style={{
            width: 1,
            height: 16,
            background: summary.recommendDriving ? "rgba(255,255,255,0.3)" : "var(--sw-hairline)",
            marginLeft: 16,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--sw-r-full)",
              background: summary.recommendDriving ? "rgba(255,255,255,0.2)" : "var(--sw-primary-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="pin" size={16} color={summary.recommendDriving ? "#fff" : "var(--sw-primary)"} />
          </div>
          <span
            style={{
              fontSize: "var(--sw-fs-base)",
              fontWeight: "var(--sw-fw-bold)",
              color: summary.recommendDriving ? "#fff" : "var(--sw-ink)",
            }}
          >
            {request.destination.name}
          </span>
        </div>
      </div>

      {/* meta info */}
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 13,
          color: summary.recommendDriving ? "rgba(255,255,255,0.8)" : "var(--sw-ink-2)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="clock" size={14} color={summary.recommendDriving ? "rgba(255,255,255,0.8)" : "var(--sw-ink-3)"} />
          {formatTime(request.departureTime)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="users" size={14} color={summary.recommendDriving ? "rgba(255,255,255,0.8)" : "var(--sw-ink-3)"} />
          {AGE_LABEL[request.ageGroup] ?? request.ageGroup}
        </span>
      </div>

      {/* one-liner */}
      <div
        style={{
          fontSize: "var(--sw-fs-base)",
          fontWeight: "var(--sw-fw-medium)",
          color: summary.recommendDriving ? "#fff" : "#166534",
          lineHeight: 1.6,
          padding: "12px 14px",
          background: summary.recommendDriving ? "rgba(255,255,255,0.12)" : "#DCFCE7",
          borderRadius: "var(--sw-r-md)",
        }}
      >
        {summary.oneLiner}
      </div>
    </div>
  );
}
