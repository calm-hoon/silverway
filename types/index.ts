// ============================================================
// SilverWay 핵심 도메인 타입 정의
// ============================================================

// ──────────────────────────────────────────────
// 1. 공통 타입
// ──────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** 운전 위험 지수 단계 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

/** 대중교통 혼잡도 단계 — 과거 패턴 기반 예측형 혼잡도 */
export type CongestionLevel = "LOW" | "MEDIUM" | "HIGH";

export type AgeGroup = "60s" | "70s" | "80s";

/** API fallback 적용 여부를 기록하는 플래그 */
export type FallbackFlags = {
  analysis?: boolean;
  route?: boolean;
  weather?: boolean;
  report?: boolean;
};

// ──────────────────────────────────────────────
// 2. 장소 / 입력 타입
// ──────────────────────────────────────────────

export type Place = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type AnalysisRequest = {
  origin: Place;
  destination: Place;
  /** ISO 8601 형식 출발 시각 */
  departureTime: string;
  ageGroup: AgeGroup;
};

// ──────────────────────────────────────────────
// 3. 운전 위험 지수 타입
// score는 실제 사고 확률이 아니라 운전 위험 지수다.
// ──────────────────────────────────────────────

export type RiskFactorKey = "area" | "time" | "weather" | "age" | "distance";

export type DrivingRiskFactor = {
  key: RiskFactorKey;
  label: string;
  /** 0~100 범위의 위험 지수 기여도 */
  score: number;
  /** 이 항목의 최대 기여 점수 */
  maxScore?: number;
  description: string;
};

export type DrivingRisk = {
  /** 0~100 범위의 종합 운전 위험 지수 */
  score: number;
  level: RiskLevel;
  label: string;
  description: string;
  factors: DrivingRiskFactor[];
};

// ──────────────────────────────────────────────
// 4. 대중교통 타입
// ──────────────────────────────────────────────

export type TransitStep = {
  mode: "WALK" | "SUBWAY" | "BUS";
  lineName?: string;
  stationFrom?: string;
  stationTo?: string;
  durationMin: number;
  distanceM?: number;
  description: string;
};

export type TransitRoute = {
  totalDurationMin: number;
  transferCount: number;
  steps: TransitStep[];
  source: string;
};

/** 과거 패턴 기반 예측형 혼잡도 */
export type TransitCongestion = {
  level: CongestionLevel;
  label: string;
  description: string;
  /** 혼잡도 산출 기준 — 항상 과거 패턴 기반 예측형 */
  basis: "HISTORICAL_PATTERN";
  /** 해당 역·시간대 재차인원 / 전체 평균 재차인원 비율 */
  ratio?: number;
  /** 혼잡도 산출에 사용된 역명 */
  stationName?: string;
  /** 혼잡도 산출에 사용된 시간대(시) */
  hour?: number;
};

/** AFC 재차인원 데이터 — long format 전처리 기준 */
export type AfcStationLoad = {
  stationName: string;
  hour: number;
  direction?: "UP" | "DOWN" | "UNKNOWN";
  onboardCount: number;
  serviceDayType?: "WEEKDAY" | "WEEKEND" | "HOLIDAY";
};

export type TransitSummary = {
  available: boolean;
  route: TransitRoute | null;
  congestion: TransitCongestion | null;
};

// ──────────────────────────────────────────────
// 5. 날씨 타입
// ──────────────────────────────────────────────

export type WeatherCondition =
  | "CLEAR"
  | "CLOUDY"
  | "RAIN"
  | "HEAVY_RAIN"
  | "SNOW"
  | "FOG"
  | "UNKNOWN";

export type WeatherRisk = {
  condition: WeatherCondition;
  label: string;
  temperatureCelsius: number | null;
  windSpeedMs: number | null;
  /** 날씨가 운전 위험 지수에 미치는 영향 설명 */
  riskNote: string;
  source: string;
};

// ──────────────────────────────────────────────
// 6. 리포트 타입
// ──────────────────────────────────────────────

export type ReportGeneratedBy = "TEMPLATE" | "CLAUDE";

export type ReportContent = {
  title: string;
  summary: string;
  recommendation: string;
  /** 가족에게 전달하는 한 줄 메시지 */
  familyMessage: string;
  dataSources: string[];
  /** 리포트 상세 본문 */
  body?: string;
  /** 리포트 생성 방식 */
  generatedBy?: ReportGeneratedBy;
  /** 의사결정 보조 안내 면책 문구 목록 */
  cautions?: string[];
};

// ──────────────────────────────────────────────
// 7. 분석 결과 타입
// ──────────────────────────────────────────────

export type AnalysisSummary = {
  recommendDriving: boolean;
  oneLiner: string;
};

export type AnalysisResult = {
  id: string;
  request: AnalysisRequest;
  summary: AnalysisSummary;
  drivingRisk: DrivingRisk;
  transit: TransitSummary;
  weather: WeatherRisk;
  report: ReportContent;
  dataSources: string[];
  fallbackFlags?: FallbackFlags;
  createdAt: string;
};

// ──────────────────────────────────────────────
// 8. Supabase 타입 — 001_init_schema.sql 기준
// ──────────────────────────────────────────────

/** analysis_logs 행 조회용 최소 타입 */
export type AnalysisLogRow = {
  id: string;
  origin_name: string | null;
  origin_address: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_name: string | null;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  departure_time: string | null;
  age_group: AgeGroup | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  risk_factors: Json;
  transit_summary: Json;
  report: Json;
  data_sources: Json;
  fallback_flags: Json;
  created_at: string | null;
};

/** analysis_logs 행 삽입용 최소 타입 */
export type AnalysisLogInsert = Omit<AnalysisLogRow, "id" | "created_at">;

export type AnalysisStorageSource = "SUPABASE" | "FALLBACK";

export type ResultLookupMeta = {
  requestedId: string;
  source: AnalysisStorageSource;
  fallback: boolean;
};

export type Database = {
  public: {
    Tables: {
      analysis_logs: {
        Row: AnalysisLogRow;
        Insert: AnalysisLogInsert;
        Update: Partial<AnalysisLogInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
