"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 개발 환경에서만 콘솔 출력 (stack trace 미노출)
    if (process.env.NODE_ENV === "development") {
      console.error("[SilverWay Error]", error.message);
    }
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <ErrorState
        title="잠시 문제가 생겼습니다"
        description="현재 표시된 결과는 의사결정 보조용 참고 정보입니다. 다시 시도하거나 예시 결과를 확인해 보세요."
        actionLabel="다시 시도"
        onRetry={reset}
      />
    </div>
  );
}
