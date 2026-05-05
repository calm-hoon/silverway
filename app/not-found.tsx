import { ErrorState } from "@/components/ui/ErrorState";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <ErrorState
        title="페이지를 찾을 수 없습니다"
        description="찾으시는 페이지가 없거나 주소가 변경되었을 수 있습니다. 분석을 새로 시작해 보세요."
        actionLabel="분석 시작하기"
        actionHref="/analyze"
      />
    </div>
  );
}
