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
      {/* 상단 그라데이션 띠 */}
      <div
        style={{
          height: 5,
          background: "linear-gradient(90deg, var(--sw-accent) 0%, var(--sw-primary) 100%)",
        }}
      />

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--sw-accent-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* 하트 아이콘 */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9C5D2E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--sw-fs-md)",
                fontWeight: "var(--sw-fw-bold)",
                color: "var(--sw-ink)",
                lineHeight: 1.2,
              }}
            >
              가족에게 전하기
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--sw-ink-3)",
                marginTop: 2,
              }}
            >
              편하게 대화 꺼낼 수 있는 문구예요
            </div>
          </div>
        </div>

        {/* 요약 */}
        {report.summary && (
          <div
            style={{
              fontSize: "var(--sw-fs-sm)",
              color: "var(--sw-ink-2)",
              lineHeight: 1.65,
              padding: "10px 14px",
              background: "var(--sw-paper)",
              borderRadius: "var(--sw-r-md)",
            }}
          >
            {report.summary}
          </div>
        )}

        {/* 권장 안내 */}
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

        {/* 가족 메시지 — 카드/편지 스타일 */}
        <div
          style={{
            background: "linear-gradient(135deg, #FFF9F2 0%, #FFF4EA 100%)",
            borderRadius: "var(--sw-r-lg)",
            padding: "18px 16px",
            border: "1px solid #F5DBBE",
            position: "relative",
          }}
        >
          {/* 따옴표 장식 */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 14,
              fontSize: 32,
              lineHeight: 1,
              color: "#E8C99A",
              fontFamily: "Georgia, serif",
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            &#8220;
          </div>

          <div
            style={{
              fontSize: "var(--sw-fs-base)",
              color: "#5C3D1E",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              paddingTop: 18,
              paddingLeft: 8,
            }}
          >
            {report.familyMessage}
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: copied ? "#D1FAE5" : "#FFF",
              color: copied ? "#065F46" : "#9C5D2E",
              border: `1.5px solid ${copied ? "#6EE7B7" : "#E8C99A"}`,
              borderRadius: "var(--sw-r-md)",
              fontSize: "var(--sw-fs-sm)",
              fontWeight: "var(--sw-fw-bold)",
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all var(--sw-d-fast) var(--sw-ease)",
              minHeight: 44,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <Icon
              name={copied ? "check" : "share"}
              size={18}
              color={copied ? "#065F46" : "#9C5D2E"}
            />
            {copied ? "복사되었습니다!" : "문구 복사하기"}
          </button>
        </div>

        {/* 면책 문구 */}
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
