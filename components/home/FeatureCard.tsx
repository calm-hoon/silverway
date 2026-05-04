import { Icon } from "@/components/ui/Icon";

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      style={{
        background: "var(--sw-card)",
        borderRadius: "var(--sw-r-lg)",
        boxShadow: "var(--sw-e2)",
        padding: "20px 20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--sw-r-md)",
          background: "var(--sw-primary-50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={24} color="var(--sw-primary)" />
      </div>
      <div>
        <div
          style={{
            fontSize: "var(--sw-fs-base)",
            fontWeight: "var(--sw-fw-bold)",
            color: "var(--sw-ink)",
            lineHeight: "var(--sw-lh-snug)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "var(--sw-fs-sm)",
            color: "var(--sw-ink-2)",
            lineHeight: "var(--sw-lh-normal)",
            marginTop: 6,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
