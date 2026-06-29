import { HeroSection } from "@/components/home/HeroSection";
import { FeatureCard } from "@/components/home/FeatureCard";
import { Section } from "@/components/ui/Section";
import { StatusPill } from "@/components/ui/StatusPill";

const FEATURES = [
  {
    icon: "alert",
    title: "운전 위험 지수",
    description:
      "TAAS 사고 데이터·기상청 날씨·시간대·연령대를 조합해 지금 이 경로의 운전 부담을 수치로 보여줍니다.",
  },
  {
    icon: "bus",
    title: "대중교통 대안",
    description:
      "같은 목적지까지 대중교통으로 가는 경로와 소요시간을 비교해 이동 선택지를 넓혀드립니다.",
  },
  {
    icon: "clock",
    title: "시간대별 혼잡도",
    description:
      "대전 지하철 AFC 과거 데이터를 바탕으로 해당 역·시간대의 예상 혼잡도를 미리 확인하세요.",
  },
  {
    icon: "users",
    title: "AI 가족 편지",
    description:
      "분석 결과를 AI가 따뜻한 언어로 바꿔줍니다. 부모님께 감정 없이 데이터로 대화를 시작할 수 있어요.",
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
              <li>장소 검색 및 경로 계산은 일부 보조 데이터가 사용될 수 있습니다.</li>
              <li>면허 반납은 당사자와 가족이 함께 논의할 사항입니다.</li>
            </ul>
          </div>
        </Section>
      </div>
    </main>
  );
}
