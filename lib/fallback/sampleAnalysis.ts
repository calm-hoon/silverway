import type { AnalysisResult } from "@/types";
import { sampleRoute } from "./sampleRoute";
import { sampleWeather } from "./sampleWeather";

/**
 * API/DB 없이 결과 화면과 /api/analyze fallback 응답에서 사용하는
 * 예시 분석 결과 데이터. 대전광역시 맥락.
 */
export const sampleAnalysis: AnalysisResult = {
  id: "sample-analysis-daejeon-001",
  createdAt: "2026-05-04T10:00:00+09:00",

  request: {
    origin: {
      name: "대전광역시청",
      address: "대전광역시 서구 둔산로 100",
      lat: 36.3513,
      lng: 127.3849,
    },
    destination: {
      name: "충남대학교병원",
      address: "대전광역시 중구 문화로 282",
      lat: 36.3706,
      lng: 127.3664,
    },
    departureTime: "2026-05-04T10:00:00+09:00",
    ageGroup: "70s",
  },

  summary: {
    recommendDriving: false,
    oneLiner:
      "운전 위험 지수가 중간 수준입니다. 대중교통 이용을 먼저 검토해보시길 권장합니다.",
  },

  drivingRisk: {
    score: 62,
    level: "MEDIUM",
    label: "보통",
    description:
      "이 점수는 공공데이터 기반 사고 패턴, 시간대, 기상 조건, 이동 지역 특성을 조합한 " +
      "의사결정 보조용 운전 위험 지수이며, 실제 이동 위험 발생을 예측하는 지표가 아닙니다.",
    factors: [
      {
        key: "area",
        label: "지역 사고 패턴",
        score: 55,
        description: "해당 경로의 행정구역 내 고령 운전자 관련 사고 패턴 반영",
      },
      {
        key: "time",
        label: "시간대",
        score: 40,
        description: "오전 10시는 상대적으로 교통량이 안정된 시간대입니다.",
      },
      {
        key: "weather",
        label: "기상 조건",
        score: 20,
        description: "맑은 날씨로 기상 위험 가중치가 낮습니다.",
      },
      {
        key: "age",
        label: "연령대",
        score: 70,
        description: "70대 운전자는 반응 속도 및 야간 시력 저하 가능성이 고려됩니다.",
      },
      {
        key: "distance",
        label: "이동 거리",
        score: 45,
        description: "약 4.2km의 도심 구간으로 교차로가 다수 포함됩니다.",
      },
    ],
  },

  transit: sampleRoute,

  weather: sampleWeather,

  report: {
    title: "SilverWay 이동 분석 리포트",
    summary:
      "오늘 대전광역시청에서 충남대학교병원까지의 이동을 분석했습니다. " +
      "운전 위험 지수는 62점(보통)으로 나타났으며, " +
      "지하철 1호선을 이용하면 약 26분 내에 이동할 수 있습니다.",
    recommendation:
      "대중교통(지하철 1호선)을 이용하는 방법이 이동 편의 동선 측면에서 유리합니다. " +
      "직접 운전이 필요할 경우 교차로 구간에서 충분한 정지 거리를 확보하시길 권장합니다.",
    familyMessage:
      "어르신께서 오늘 병원 방문을 계획하고 계십니다. " +
      "지하철을 이용하시면 26분 내 안전하게 이동하실 수 있습니다. " +
      "가능하다면 동행하거나 출발 전 연락을 드려보세요.",
    dataSources: [
      "TAAS 고령 운전자 사고 데이터",
      "AFC 과거 패턴 기반 예측형 혼잡도",
      "기상청 단기예보",
      "ODsay 대중교통 경로",
    ],
    riskExplanation:
      "이번 운전 위험 지수 62점(보통)에는 연령대(70점)와 지역 사고 패턴(55점) 항목이 " +
      "가장 큰 영향을 주었습니다. 70대 운전자는 반응 속도 저하 가능성이 반영되며, " +
      "해당 지역은 고령 운전자 관련 사고 패턴이 상대적으로 뚜렷합니다. 이는 실제 사고 " +
      "가능성을 의미하지 않으며, 공공데이터 기반 상대 점수를 참고 자료로만 활용해주세요.",
    timeRecommendation: {
      recommendedHour: 10,
      recommendedLabel: "오전 10시",
      reason:
        "오전 10시 무렵이 다른 시간대보다 운전 위험 지수가 최대 10점 낮게 나타나 " +
        "상대적으로 여유 있는 시간대입니다.",
      slots: [
        { hour: 7, iso: "2026-05-04T07:00:00+09:00", label: "오전 7시", score: 69, level: "MEDIUM", congestionLabel: "혼잡", weatherLabel: "맑음" },
        { hour: 10, iso: "2026-05-04T10:00:00+09:00", label: "오전 10시", score: 62, level: "MEDIUM", congestionLabel: "보통", weatherLabel: "맑음" },
        { hour: 13, iso: "2026-05-04T13:00:00+09:00", label: "오후 1시", score: 65, level: "MEDIUM", congestionLabel: "여유", weatherLabel: "맑음" },
        { hour: 16, iso: "2026-05-04T16:00:00+09:00", label: "오후 4시", score: 67, level: "MEDIUM", congestionLabel: "보통", weatherLabel: "맑음" },
        { hour: 19, iso: "2026-05-04T19:00:00+09:00", label: "오후 7시", score: 69, level: "MEDIUM", congestionLabel: "혼잡", weatherLabel: "맑음" },
        { hour: 22, iso: "2026-05-04T22:00:00+09:00", label: "오후 10시", score: 72, level: "HIGH", congestionLabel: "여유", weatherLabel: "맑음" },
      ],
      generatedBy: "TEMPLATE",
    },
  },

  dataSources: [
    "TAAS 고령 운전자 사고 데이터",
    "AFC 열차 재차인원 데이터",
    "기상청 단기예보",
    "ODsay 대중교통 경로 API",
  ],

  fallbackFlags: {
    analysis: false,
    route: false,
    weather: false,
    report: false,
  },
};
