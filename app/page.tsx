import { HeroSection } from "@/components/home/HeroSection";
import { FeatureCard } from "@/components/home/FeatureCard";
import { Section } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";

const FEATURES = [
  {
    icon: "alert",
    title: "운전 위험 지수",
    description:
      "공공데이터 기반 사고 패턴, 시간대, 기상 조건, 이동 지역 특성을 조합한 운전 위험 지수를 확인하세요.",
  },
  {
    icon: "bus",
    title: "대중교통 대체 경로",
    description:
      "목적지까지 이동 편의 동선을 확인하고, 이동 상황에 맞는 안전한 이동 방법을 선택하세요.",
  },
  {
    icon: "clock",
    title: "과거 패턴 기반 예측형 혼잡도",
    description:
      "AFC(자동요금징수) 데이터를 바탕으로 시간대별 대중교통 혼잡도를 사전에 확인하세요.",
  },
  {
    icon: "users",
    title: "가족 공유용 리포트",
    description:
      "분석 결과를 가족과 함께 확인하고, 면허 반납을 함께 논의할 수 있는 안내문을 제공합니다.",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--sw-paper)",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "32px 20px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <HeroSection />

        <Section
          title="주요 기능"
          description="SilverWay는 공공데이터와 AI를 결합해 고령자의 이동 결정을 돕습니다."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </Section>

        {/* service note */}
        <Section title="서비스 안내">
          <div
            style={{
              background: "var(--sw-card)",
              borderRadius: "var(--sw-r-lg)",
              boxShadow: "var(--sw-e1)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <StatusPill label="Mock API" tone="muted" />
              <StatusPill label="과거 패턴 기반 예측형 혼잡도" tone="info" />
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: "var(--sw-fs-sm)",
                color: "var(--sw-ink-2)",
                lineHeight: "var(--sw-lh-relaxed)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>운전 위험 지수는 실제 사고 가능성이 아닌 의사결정 보조용 지수입니다.</li>
              <li>혼잡도는 AFC 과거 데이터 기반 예측이며 실시간 정보가 아닙니다.</li>
              <li>장소검색·경로 계산은 현재 Mock 상태입니다.</li>
              <li>면허 반납은 당사자와 가족이 함께 논의할 사항입니다.</li>
            </ul>
          </div>
        </Section>
      </div>
    </main>
  );
}
