import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function AnalyzeLoading() {
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
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
    </div>
  );
}
