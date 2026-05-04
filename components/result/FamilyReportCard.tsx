"use client";

import { useState } from "react";
import { type ReportContent } from "@/types";
import { Icon } from "@/components/ui/Icon";

type FamilyReportCardProps = {
  report: ReportContent;
};

export function FamilyReportCard({ report }: FamilyReportCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report.familyMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-xl)",
        boxShadow: "var(--sw-e3)",
        border: "1px solid var(--sw-hairline)",
        overflow: "hidden",
      }}
    >
      {/* accent bar */}
      <div style={{ height: 4, background: "var(--sw-accent)" }} />

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* header */}
        <div>
          <div
            style={{
              fontSize: "var(--sw-fs-xs)",
              fontWeight: "var(--sw-fw-bold)",
              color: "var(--sw-ink-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            가족 공유용 리포트
          </div>
          <div
            style={{
              fontSize: "var(--sw-fs-md)",
              fontWeight: "var(--sw-fw-bold)",
              color: "var(--sw-ink)",
              lineHeight: 1.3,
            }}
          >
            {report.title}
          </div>
        </div>

        {/* tone note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "var(--sw-accent-50)",
            borderRadius: "var(--sw-r-md)",
            fontSize: 13,
            color: "#9C5D2E",
            lineHeight: 1.5,
          }}
        >
          <Icon name="shield" size={16} color="#9C5D2E" />
          <span>면허 반납을 어색하지 않게 꺼낼 수 있는 대화의 시작점이에요.</span>
        </div>

        {/* summary */}
        {report.summary && (
          <div
            style={{
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink-2)",
              lineHeight: 1.65,
            }}
          >
            {report.summary}
          </div>
        )}

        {/* recommendation */}
        {report.recommendation && (
          <div
            style={{
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink)",
              lineHeight: 1.65,
              padding: "12px 14px",
              background: "var(--sw-paper)",
              borderRadius: "var(--sw-r-md)",
              borderLeft: "3px solid var(--sw-primary)",
            }}
          >
            {report.recommendation}
          </div>
        )}

        {/* family message */}
        <div
          style={{
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-lg)",
            padding: "16px",
            border: "1px solid var(--sw-hairline)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: "var(--sw-fw-bold)",
              color: "var(--sw-ink-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            가족에게 보낼 문구
          </div>
          <div
            style={{
              fontSize: "var(--sw-fs-base)",
              color: "var(--sw-ink)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {report.familyMessage}
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: copied ? "var(--sw-safe-bg)" : "var(--sw-primary-50)",
              color: copied ? "#166534" : "var(--sw-primary)",
              border: "none",
              borderRadius: "var(--sw-r-md)",
              fontSize: "var(--sw-fs-sm)",
              fontWeight: "var(--sw-fw-bold)",
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all var(--sw-d-fast) var(--sw-ease)",
              minHeight: 44,
            }}
          >
            <Icon
              name={copied ? "check" : "share"}
              size={18}
              color={copied ? "#166534" : "var(--sw-primary)"}
            />
            {copied ? "복사되었습니다!" : "문구 복사하기"}
          </button>
        </div>

        {/* cautions */}
        {report.cautions && report.cautions.length > 0 && (
          <div
            style={{
              fontSize: 12,
              color: "var(--sw-ink-3)",
              lineHeight: 1.6,
            }}
          >
            {report.cautions.map((c, i) => (
              <div key={i}>· {c}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
