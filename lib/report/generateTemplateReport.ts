import type {
  AgeGroup,
  AnalysisResult,
  DrivingRisk,
  ReportContent,
  TransitSummary,
  WeatherRisk,
} from "@/types";

export type GenerateTemplateReportInput = {
  originName?: string;
  destinationName?: string;
  drivingRisk?: DrivingRisk;
  transit?: TransitSummary;
  weather?: WeatherRisk;
  departureTime?: string;
  ageGroup?: AgeGroup;
};

function formatHour(departureTime?: string): string {
  if (!departureTime) return "";
  try {
    const date = new Date(departureTime);
    if (isNaN(date.getTime())) return "";
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h < 12 ? "오전" : "오후";
    const displayH = h % 12 || 12;
    return m === 0 ? `${ampm} ${displayH}시` : `${ampm} ${displayH}시 ${m}분`;
  } catch {
    return "";
  }
}

function buildTitle(level?: string): string {
  if (level === "HIGH") return "대중교통 또는 가족 동행을 우선 검토해보세요";
  if (level === "MEDIUM") return "오늘 이동은 대중교통 대안도 함께 검토해보세요";
  return "현재 이동 조건을 함께 확인해보세요";
}

function buildRecommendation(level?: string): string {
  if (level === "HIGH") {
    return "대중교통 또는 가족 동행을 우선 검토해보세요. 이동 방식은 가족과 함께 논의해보시길 권장합니다.";
  }
  if (level === "MEDIUM") {
    return "대중교통 대안을 먼저 확인해보시고, 직접 운전이 필요할 경우 충분한 주의를 기울이세요.";
  }
  return "출발 전 날씨와 컨디션을 확인하신 후 안전하게 이동하세요.";
}

function buildBody(input: GenerateTemplateReportInput): string {
  const { originName, destinationName, drivingRisk, transit, weather, departureTime } = input;
  const parts: string[] = [];

  const route = [originName, destinationName].filter(Boolean).join(" → ");
  const timeStr = formatHour(departureTime);

  if (route) {
    const timePart = timeStr ? ` 출발 시각: ${timeStr}.` : "";
    parts.push(`${route} 이동을 분석했습니다.${timePart}`);
  }

  if (drivingRisk) {
    parts.push(`운전 위험 지수는 ${drivingRisk.score}점(${drivingRisk.label}) 수준입니다.`);
    const topFactors = drivingRisk.factors.slice(0, 2);
    if (topFactors.length > 0) {
      parts.push(`주요 위험 요인: ${topFactors.map((f) => f.label).join(", ")}.`);
    }
  } else {
    parts.push("운전 위험 지수 정보를 확인하지 못했습니다.");
  }

  if (transit?.available && transit.route) {
    const { totalDurationMin, transferCount } = transit.route;
    const transferText = transferCount === 0 ? "환승 없음" : `환승 ${transferCount}회`;
    parts.push(`대중교통으로 약 ${totalDurationMin}분 내 이동 가능합니다. (${transferText})`);

    if (transit.congestion) {
      parts.push(
        `해당 시간대 혼잡도는 ${transit.congestion.label}(과거 패턴 기반 예측형 혼잡도)으로 예상됩니다.`
      );
    }
  } else if (transit && !transit.available) {
    parts.push("해당 경로의 대중교통 경로를 확인하지 못했습니다.");
  }

  if (weather) {
    parts.push(`기상 조건: ${weather.label}.`);
  }

  if (drivingRisk?.level === "HIGH") {
    parts.push("이동 방식을 가족과 함께 장기적으로 논의해보시는 것도 좋은 방법입니다.");
  }

  parts.push("이 분석은 의사결정 보조용 안내이며, 실제 이동 여부는 당일 상황을 종합해 판단하세요.");

  return parts.join(" ");
}

function buildFamilyMessage(input: GenerateTemplateReportInput): string {
  const { originName, destinationName, drivingRisk, transit } = input;

  const destText = destinationName ? `${destinationName}` : "목적지";
  const level = drivingRisk?.level;

  // 위험도별 따뜻한 도입 문구
  let opener: string;
  if (level === "HIGH") {
    opener = `오늘 ${destText} 가시는 길, 가능하면 대중교통이나 동행을 함께 검토해보시면 어떨까요?`;
  } else if (level === "MEDIUM") {
    opener = `오늘 ${destText} 가시는 길 잘 준비되셨어요?`;
  } else {
    opener = `오늘 ${destText} 가시는 길 편안하게 다녀오세요.`;
  }

  // 대중교통 안내
  const transitText =
    transit?.available && transit.route
      ? ` 지하철이나 버스로 약 ${transit.route.totalDurationMin}분이면 가실 수 있어요.`
      : "";

  // 마무리 감성 문구
  const closer = level === "HIGH"
    ? " 출발하시기 전에 연락 한 번 주세요~ 같이 방법 찾아볼게요."
    : " 출발 전에 날씨 한 번 확인하시고, 편안하게 다녀오세요.";

  // originName이 있으면 경로 맥락 추가
  const routeContext = originName && destinationName
    ? ` (${originName} → ${destinationName})`
    : "";

  return `${opener}${transitText}${routeContext ? ` 오늘 이동 경로${routeContext}를 살펴봤어요.` : ""}${closer}`;
}

export function generateTemplateReport(input: GenerateTemplateReportInput): ReportContent {
  const { drivingRisk } = input;
  const level = drivingRisk?.level;

  return {
    title: buildTitle(level),
    summary: drivingRisk
      ? `운전 위험 지수 ${drivingRisk.score}점(${drivingRisk.label})으로 분석되었습니다.`
      : "운전 위험 지수 정보를 확인하지 못했습니다.",
    recommendation: buildRecommendation(level),
    familyMessage: buildFamilyMessage(input),
    dataSources: [
      "공공데이터 기반 사고 패턴 (템플릿)",
      "AFC 과거 패턴 기반 예측형 혼잡도 (템플릿)",
      "기상 조건 (템플릿)",
    ],
    body: buildBody(input),
    generatedBy: "TEMPLATE",
    cautions: [
      "이 내용은 의사결정 보조용 안내이며, 실제 사고 가능성을 의미하지 않습니다.",
    ],
  };
}

export function generateTemplateReportFromAnalysis(result: AnalysisResult): ReportContent {
  return generateTemplateReport({
    originName: result.request.origin.name,
    destinationName: result.request.destination.name,
    drivingRisk: result.drivingRisk,
    transit: result.transit,
    weather: result.weather,
    departureTime: result.request.departureTime,
    ageGroup: result.request.ageGroup,
  });
}
