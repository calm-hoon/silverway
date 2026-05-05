import { LoadingState } from "@/components/ui/LoadingState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function GlobalLoading() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <LoadingState
        message="화면을 준비하고 있습니다."
        subMessage="공공데이터와 대체 경로 정보를 정리하는 중입니다."
      />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
    </div>
  );
}
