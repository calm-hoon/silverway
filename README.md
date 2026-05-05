# SilverWay

AI 기반 고령자 이동 및 면허 반납 의사결정 지원 서비스

## 현재 작업 상태

작업 1: Next.js 프로젝트 초기화

완료 범위:
- Next.js App Router 기반 프로젝트 구조 준비
- TypeScript, Tailwind CSS 사용
- 향후 Supabase, Kakao, ODsay, Weather, Claude 연동을 위한 폴더 구조 준비
- 랜딩, 분석 입력, 테스트 결과, 동적 결과 페이지 placeholder 작성
- API Route placeholder 작성
- 환경변수 예시 파일 작성

제외 범위:
- 회원가입/auth
- 관리자 페이지
- 결제
- 알림
- 카카오 공유
- 실제 API 연동
- Supabase query
- 복잡한 UI 구현

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 확인:

```
http://localhost:3000
http://localhost:3000/analyze
http://localhost:3000/result/test
http://localhost:3000/api/analyze
```

## 환경변수

`.env.local.example`을 복사해 `.env.local`을 만들고, 실제 연동 작업 시 값을 채운다.

```bash
cp .env.local.example .env.local
```

## 주요 표현 원칙

- 위험도 점수는 실제 사고 확률이 아니라 "운전 위험 지수"다.
- "사고 확률", "예측 확률" 표현은 사용하지 않는다.
- AFC 혼잡도는 실시간이 아니라 "과거 패턴 기반 예측형 혼잡도"로 표현한다.
- API 실패 시 향후 sampleAnalysis, sampleRoute, sampleWeather, generateTemplateReport 등 fallback으로 화면이 깨지지 않게 한다.

## 체크포인트

### 작업 1
- npm install 성공
- npm run dev 성공
- localhost:3000 접속 가능
- /analyze 접속 가능
- /result/test 접속 가능
- /api/analyze 호출 시 200 JSON 응답
- package.json 확인 가능

### 작업 2
- supabase/migrations/001_init_schema.sql 생성
- 5개 테이블 정의 포함 (accident_areas, accident_points, afc_station_loads, station_aliases, analysis_logs)
- analysis_logs가 uuid 기반 resultId 조회 지원
- auth/user_id 없이 MVP 구조 유지
- RLS는 TODO 주석으로 처리

> Supabase 실행·연결·seed는 다음 작업에서 진행한다.

### 작업 2.5
- lib/supabase/env.ts — public/server 환경변수 null-safe 읽기
- lib/supabase/client.ts — 브라우저/클라이언트 컴포넌트용 Supabase client
- lib/supabase/server.ts — Route Handler용 server client + admin client 분리
- types/index.ts — Json, Database placeholder 타입 추가
- @supabase/supabase-js 설치 확인 (이미 설치됨)
- 실제 query / auth / API 연동은 아직 없음

> ~~다음 작업: **작업 3. 타입 정의 작성**~~ → 완료

### 작업 3
- types/index.ts 전면 재작성 — 핵심 도메인 타입 정의
- 공통: `Json`, `ApiResponse<T>`, `RiskLevel`, `CongestionLevel`, `AgeGroup`, `FallbackFlags`
- 입력: `Place`, `AnalysisRequest`
- 운전 위험 지수: `RiskFactorKey`, `DrivingRiskFactor`, `DrivingRisk`
- 대중교통: `TransitStep`, `TransitRoute`, `TransitCongestion`, `TransitSummary`
- 날씨: `WeatherCondition`, `WeatherRisk`
- 리포트: `ReportContent`
- 분석 결과: `AnalysisSummary`, `AnalysisResult`
- Supabase placeholder: `Database`, `AnalysisLogRow`, `AnalysisLogInsert`
- 실제 API 연동, Supabase query, 화면 구현은 아직 없음

> ~~다음 작업: **작업 4. sampleAnalysis 작성**~~ → 완료

### 작업 4
- lib/fallback/sampleWeather.ts — 날씨 fallback 데이터 (맑음, 대전 예시)
- lib/fallback/sampleRoute.ts — 대중교통 경로 fallback (대전광역시청 → 충남대학교병원, 지하철 1호선)
- lib/fallback/sampleAnalysis.ts — 전체 분석 결과 fallback (AnalysisResult 타입, 70대 예시)
- lib/fallback/index.ts — 3개 모듈 re-export
- 실제 API/Supabase query/Claude 연동은 아직 없음

> ~~다음 작업: **작업 4.5. seed 데이터 작성**~~ → 완료

### 작업 4.5
- supabase/seed.sql — 테이블별 INSERT 샘플 (accident_areas 5건, afc_station_loads 8건, station_aliases 6건, analysis_logs 1건)
- scripts/seed-supabase.ts — JSON 파일 기반 Supabase 삽입 스크립트 (service role key 서버 전용)
- data/processed/sample-accident-areas.json — 운전 위험 지수 산정용 대전 구별 사고 패턴 샘플
- data/processed/sample-afc-station-loads.json — 과거 패턴 기반 예측형 혼잡도 산정용 AFC 재차인원 샘플
- data/processed/sample-station-aliases.json — ODsay ↔ AFC 역명 매칭 샘플
- tsconfig.json — scripts/ 제외 (독립 실행 스크립트)
- 모든 데이터는 MVP 테스트용 샘플이며 실제 공공데이터 원본이 아닙니다.
- 실제 API/Supabase query/화면 구현은 아직 없음

#### seed 실행 방법

```bash
# tsx 설치 (이미 설치되어 있으면 생략)
npm install -D tsx

# .env.local에 SUPABASE_SERVICE_ROLE_KEY 설정 후 실행
npx tsx scripts/seed-supabase.ts
```

> ~~다음 작업: **작업 5. calculateDrivingRisk 함수 작성**~~ → 완료

### 작업 5
- lib/risk/calculateDrivingRisk.ts — 공공데이터 기반 운전 위험 지수 계산 함수 작성
- lib/risk/index.ts — calculateDrivingRisk, CalculateDrivingRiskInput re-export
- types/index.ts — DrivingRiskFactor에 maxScore?: number 최소 보강
- 이 점수는 실제 사고 확률이 아니라, 공공데이터 기반 사고 패턴·시간대·기상 조건·이동 지역 특성을 조합한 의사결정 보조용 운전 위험 지수입니다.
- 머신러닝 없이 설명 가능한 가중치 기반 점수(최대 100점)로 구성: 지역 사고 패턴(50) + 시간대(15) + 기상(15) + 연령대(10) + 경로 지역 보정(10)
- 입력값이 비어 있어도 fallback 기본값으로 앱이 깨지지 않음
- 아직 실제 API 연동, Supabase query, 화면 구현은 없음

> ~~다음 작업: **작업 5.5. 테스트 환경 설정**~~ → 완료

### 작업 5.5
- vitest.config.ts — Vitest 테스트 환경 설정 (node 환경, `@` path alias 포함)
- tests/risk/calculateDrivingRisk.test.ts — calculateDrivingRisk 함수 핵심 케이스 8개 테스트
- tests/fallback/sampleAnalysis.test.ts — fallback 데이터 import/export 및 표현 원칙 검증 7개 테스트
- package.json scripts에 `test`, `test:watch` 추가
- 현재 테스트 범위: calculateDrivingRisk 계산 로직 + fallback 데이터 검증
- 아직 실제 API, Supabase query, UI 컴포넌트 테스트는 없음

```bash
npm run test        # 전체 테스트 1회 실행
npm run test:watch  # 파일 변경 감지 모드
```

> ~~다음 작업: **작업 6. calculateCongestion 함수 작성**~~ → 완료

### 작업 6
- lib/risk/calculateCongestion.ts — AFC 재차인원 기반 과거 패턴 예측형 혼잡도 계산 함수
- lib/risk/index.ts — calculateCongestion, CalculateCongestionInput 추가 re-export
- tests/risk/calculateCongestion.test.ts — 혼잡도 계산 케이스 9개 테스트
- types/index.ts — TransitCongestion에 ratio/stationName/hour optional 추가, AfcStationLoad 타입 추가
- AFC 데이터 기반 혼잡도는 실시간 데이터가 아니라 과거 패턴 기반 예측형 혼잡도로만 표현
- 전처리 원칙: wide format → long format, Tot_Traffic 대신 역별 onboardCount, direction 컬럼 구분
- 아직 실제 ODsay API, Supabase query, UI 구현은 없음

```bash
npm run test
```

> ~~다음 작업: **작업 7. generateTemplateReport 작성**~~ → 완료

### 작업 7
- lib/report/generateTemplateReport.ts — Claude API 없이 자연어 리포트를 생성하는 템플릿 함수
- lib/report/index.ts — generateTemplateReport, generateTemplateReportFromAnalysis re-export
- tests/report/generateTemplateReport.test.ts — 리포트 생성 케이스 9개 테스트
- types/index.ts — ReportGeneratedBy 타입 추가, ReportContent에 body/generatedBy/cautions optional 추가
- Claude API 미연동 또는 실패 시 generateTemplateReport를 fallback으로 사용할 수 있음
- 위험도 등급(LOW/MEDIUM/HIGH)에 따라 title, recommendation, body 톤이 달라짐
- 리포트는 의사결정 보조 안내이며, 면허 반납 강요나 운전 금지 표현을 사용하지 않음
- 아직 실제 Claude API, Supabase query, 화면 구현은 없음

```bash
npm run test
```

> ~~다음 작업: **작업 8. Mock /api/analyze 작성**~~ → 완료

### 작업 8
- lib/fallback/createMockAnalysisResult.ts — calculateDrivingRisk + generateTemplateReport를 조합한 순수 Mock 결과 생성 함수
- app/api/analyze/route.ts — POST 요청 수신 → createMockAnalysisResult 호출 → AnalysisResult 200 JSON 반환
- app/api/risk/route.ts — GET: calculateDrivingRisk 샘플 결과 반환
- app/api/route/route.ts — GET: sampleRoute Mock 반환
- app/api/weather/route.ts — GET: sampleWeather Mock 반환
- app/api/report/route.ts — POST: generateTemplateReport 결과 반환
- app/api/result/[id]/route.ts — GET: sampleAnalysis 기반 Mock 반환 (Supabase 조회는 작업 11.5 예정)
- tests/api/analyze-mock.test.ts — createMockAnalysisResult 7개 테스트
- 아직 실제 Kakao, ODsay, Weather, Claude, Supabase query 연동은 없음

```bash
npm run test
```

**curl 테스트 예시:**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "name": "대전광역시청",
      "address": "대전 서구 둔산로 100",
      "lat": 36.3504,
      "lng": 127.3845
    },
    "destination": {
      "name": "충남대학교병원",
      "address": "대전 중구 문화로 282",
      "lat": 36.3166,
      "lng": 127.4156
    },
    "departureTime": "2026-05-04T09:00:00+09:00",
    "ageGroup": "70s"
  }'
```

### 작업 8.5

- app/globals.css — --sw-* CSS 토큰(색상·타이포·spacing·shadow·radius·애니메이션 timing) 전면 정의
- app/layout.tsx — Pretendard Variable 폰트, lang="ko", 시니어 친화 기본 18px 베이스 적용
- components/ui/Icon.tsx — Lucide 경로 기반 SVG 인라인 아이콘 (외부 라이브러리 없음)
- components/ui/Button.tsx — primary/secondary/ghost/kakao 변형, 최소 52px 터치 영역, press 애니메이션
- components/ui/Chip.tsx — 위험도/상태용 tone 기반 칩 (danger/warning/safe/primary/accent/neutral)
- components/ui/RiskScore.tsx — 운전 위험 지수 숫자 표시 (lg/md 크기, tone 색상)
- components/ui/Card.tsx — sw-card / sw-card-hero 기반 카드 래퍼
- components/ui/Badge.tsx — default/success/warning/danger/muted 변형 뱃지
- components/ui/Section.tsx — 페이지 섹션 래퍼 (title, description, children)
- components/ui/StatusPill.tsx — 상태 정보 소형 표시 (과거 패턴 기반 예측형 혼잡도, 보조 데이터 등)
- components/ui/index.ts — 모든 UI 컴포넌트 re-export
- components/map/SWMap.tsx — 정적 SVG 지도 placeholder (Kakao Maps 연동 전 시각용)
- components/RouteCard.tsx — 운전/대중교통 경로 비교 카드
- components/RouteCompare.tsx — 추천 배너 + 지도 + 두 경로 카드 조합
- components/AIReport.tsx — 가족 메시지 카드 + 카카오톡 공유 버튼
- components/home/HeroSection.tsx — 랜딩 페이지 Hero (서비스 소개 + CTA)
- components/home/FeatureCard.tsx — 핵심 기능 소개 카드
- app/page.tsx — HeroSection + FeatureCard 기반 랜딩 페이지
- app/analyze/page.tsx — 2단계 마법사 (목적지 입력 → 출발 시간 선택, 클라이언트 컴포넌트)
- app/result/test/page.tsx — RouteCompare + AIReport 조합 테스트 결과 페이지
- app/result/[id]/page.tsx — 동적 결과 페이지 (Supabase 조회는 이후 작업에서)

벤치마킹 반영: 작업 8.5부터 시작됨. 이후 작업에서 벤치마킹 사이트·이미지 제공 시 우선 반영.

현재 Mock/미구현 상태:
- 장소검색, 최근 다녀온 곳, 거리/경로 계산은 Mock UI. 실제 동작은 Kakao Local, ODsay 연동 단계에서 처리.
- Kakao, ODsay, Weather, Claude, Supabase query 실제 API 연동 없음
- 회원가입/auth, 관리자 페이지, 결제, 알림, 카카오 공유 없음

### 작업 9

- lib/fallback/samplePlaces.ts — fallback용 대전광역시 주요 장소 6곳 예시 데이터 (대전역, 정부청사역, 충남대병원 등)
- components/analyze/PlaceInput.tsx — 출발지/도착지 텍스트 입력 (입력 시 포커스 링, 지우기 버튼)
- components/analyze/RecentPlaceList.tsx — 추천 장소 목록 (출발지/도착지 선택 버튼, mock 상태)
- components/analyze/DepartureTimeSelector.tsx — 출발 시간 슬롯 선택 (오늘 오전/오후/저녁/직접 입력)
- components/analyze/AgeGroupSelector.tsx — 연령대 선택 (60대/70대/80대 이상, 위험 지수 보정용)
- components/analyze/AnalyzeNotice.tsx — 분석 안내 카드 (면책 문구, 과거 패턴 기반 예측형 혼잡도 표시)
- components/analyze/AnalyzeForm.tsx — 폼 상태 관리 + POST /api/analyze 호출 + 결과 페이지 이동
- components/analyze/index.ts — 모든 분석 컴포넌트 re-export
- app/analyze/page.tsx — 입력 화면 (서버 컴포넌트 헤더 + AnalyzeForm 클라이언트 컴포넌트)

현재 Mock/미구현 상태:
- 장소 검색: mock 목록 선택 또는 텍스트 직접 입력. 실제 좌표 변환·검색은 이후 Kakao Local 연동(작업 15)에서 처리.
- 경로 계산: mock. 실제 대중교통 경로는 ODsay 연동(작업 12)에서 처리.
- API 호출: POST /api/analyze Mock API만 사용. 실패 시 예시 결과 페이지로 안내.
- Supabase query, Kakao, ODsay, Weather, Claude API 미연동.

### 작업 10

- components/result/ResultSummary.tsx — 출발지·도착지·시간·연령대·요약 한 줄 카드
- components/result/DrivingRiskCard.tsx — 운전 위험 지수 점수(0~100) + 레벨 바 + 면책 안내
- components/result/RiskFactorList.tsx — 지역 사고 패턴·시간대·기상·연령대·이동거리 요인별 기여도 바
- components/result/TransitAlternativeCard.tsx — 대중교통 단계별 타임라인 (도보→지하철→도보)
- components/result/CongestionCard.tsx — "과거 패턴 기반 예측형 혼잡도" 레벨 바 + 메타 정보
- components/result/WeatherSummaryCard.tsx — 기상 조건·온도·바람·위험 메모
- components/result/FamilyReportCard.tsx — 가족 공유 문구 + 클립보드 복사 버튼 ("use client")
- components/result/DataSourceCard.tsx — 활용 공공데이터 목록 + 보조 데이터/대체 데이터 상태 표시
- components/result/ResultActions.tsx — "다시 분석하기" → /analyze, "홈으로" → /
- components/result/index.ts — 모든 결과 컴포넌트 re-export
- components/map/MapPlaceholder.tsx — "Kakao Map 연동 예정" placeholder
- app/result/test/page.tsx — sampleAnalysis 기반 결과 화면 (서버 컴포넌트, 10개 카드 순차 배치)

현재 Mock/미구현 상태:
- 결과 화면은 sampleAnalysis/Mock API 기반이며, 실제 공공데이터·Claude 리포트 미연동
- 지도 연동: Kakao Map 연동 이후 단계에서 처리
- 실제 혼잡도: ODsay/AFC 실시간 연동 이후 단계에서 처리
- 날씨: 기상청 단기예보 연동 이후 단계에서 처리
- 가족 공유: 카카오 공유 대신 리포트 문구 클립보드 복사 버튼으로 처리 (카카오 공유는 이후 작업)

### 작업 11

- lib/fallback/createMockResultById.ts — id를 받아 sampleAnalysis 기반 AnalysisResult를 반환하는 순수 함수 (빈/이상한 id도 throw 없이 처리)
- components/result/ResultFallbackNotice.tsx — 보조 데이터 사용 상태를 부드럽게 알려주는 안내 카드
- components/result/ResultPageView.tsx — 결과 카드 전체를 조합하는 공통 뷰 컴포넌트 (AnalysisResult를 props로 받음)
- app/result/test/page.tsx — ResultPageView 사용으로 단순화 (sampleAnalysis 직접 전달)
- app/result/[id]/page.tsx — createMockResultById로 id 반영 + ResultFallbackNotice + ResultPageView
- app/api/result/[id]/route.ts — createMockResultById 사용으로 리팩터링, meta.requestedId 유지
- tests/result/result-page-data.test.ts — createMockResultById 10개 테스트 (금지 표현, fallback, 강요 문장 검증)

공유 구조: /result/test와 /result/[id]가 모두 ResultPageView를 재사용하며 UI 동일.

현재 Mock/미구현 상태:
- /result/[id]는 id가 없거나 이상해도 sampleAnalysis fallback으로 200 화면을 표시 (notFound() 미사용)
- 실제 DB 저장 결과가 있는 것처럼 과장하지 않으며 ResultFallbackNotice로 상태를 명시

### 작업 11.5

- lib/supabase/analysisLogs.ts — `saveAnalysisLog` / `getAnalysisLogById` 서버 전용 유틸 (서비스 role key 사용, 클라이언트 import 금지)
- app/api/analyze/route.ts — Mock 분석 결과 생성 후 `saveAnalysisLog`로 Supabase 저장 시도. 저장 성공 시 DB uuid를 `resultId`로 반환, 실패 시 Mock id를 fallback으로 반환.
- app/api/result/[id]/route.ts — `getAnalysisLogById`로 Supabase 조회 시도. 실패 시 `sampleAnalysis` fallback 반환. 404 대신 항상 200 응답.
- components/analyze/AnalyzeForm.tsx — 응답의 `resultId`로 `/result/[resultId]` 이동. `resultId` 없으면 `/result/test` fallback.
- app/result/[id]/page.tsx — 서버에서 `getAnalysisLogById` 직접 호출. Supabase 조회 성공 시 DB 결과 표시, 실패 시 fallback + ResultFallbackNotice.
- types/index.ts — `AnalysisLogRow` 전체 컬럼 보강 (origin/destination 필드), `AnalysisStorageSource`, `ResultLookupMeta` 추가, `Database` 타입에 `analysis_logs` 추가.
- tests/supabase/analysisLogs.test.ts — 환경변수/DB 없이 실행 가능한 단위 테스트 (fallback 동작, 금지 표현, throw 없음 검증)

구조:
- 비회원 결과 저장/조회 (auth 없음)
- Supabase 환경변수가 없거나 DB 연결 실패 시 `sampleAnalysis` fallback 자동 적용 — 화면이 깨지지 않음
- service role key는 서버 파일에서만 사용, 클라이언트 번들에 포함되지 않음

```bash
# 테스트 실행
npm run test

# 분석 → 저장 → 결과 조회 흐름 확인 (dev 서버 실행 후)
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "name": "대전광역시청",
      "address": "대전 서구 둔산로 100",
      "lat": 36.3504,
      "lng": 127.3845
    },
    "destination": {
      "name": "충남대학교병원",
      "address": "대전 중구 문화로 282",
      "lat": 36.3166,
      "lng": 127.4156
    },
    "departureTime": "2026-05-04T09:00:00+09:00",
    "ageGroup": "70s"
  }'

# 결과 조회 (id는 위 응답의 resultId 값 사용)
curl http://localhost:3000/api/result/test
```

### 작업 12

- lib/odsay/types.ts — `OdsayRouteRequest`, `OdsayRouteResult`, `OdsayRawResponse` 등 최소 타입 정의
- lib/odsay/normalizeOdsayRoute.ts — ODsay 원본 응답 → `TransitSummary` 변환 순수 함수 (파싱 실패 시 null 반환, throw 없음)
- lib/odsay/getTransitRoute.ts — 서버 전용 ODsay API 호출 함수. API key 누락/좌표 오류/HTTP 오류/경로 없음 모두 `sampleRoute` fallback 반환
- lib/odsay/index.ts — ODsay 모듈 re-export
- app/api/route/route.ts — GET: Mock 응답 유지, POST: ODsay 경로 조회 → 실패 시 fallback
- app/api/analyze/route.ts — Mock 결과 생성 후 ODsay 경로 조회 병렬 적용. `fallbackFlags.route`를 실제 source에 따라 업데이트
- types/index.ts — `RouteSource = "ODSAY" | "FALLBACK"` 추가
- tests/odsay/normalizeOdsayRoute.test.ts — 정규화 함수 8개 테스트 (경로 없음, 잘못된 입력, 금지 표현 검증)
- tests/odsay/getTransitRoute-fallback.test.ts — fallback 동작 8개 테스트 (API key 없음, NaN 좌표, 금지 표현, key 노출 검증)

구조:
- `ODSAY_API_KEY`는 서버 전용 환경변수 (NEXT_PUBLIC_ 접두사 없음, 클라이언트 노출 금지)
- ODsay 실패 시 `sampleRoute` fallback이 자동 적용되어 화면이 깨지지 않음
- 혼잡도는 ODsay가 아닌 AFC 기반 `sampleRoute.congestion`을 그대로 사용 (과거 패턴 기반 예측형)
- 실제 Kakao Local 좌표 검색, Kakao Map, Weather, Claude 연동은 아직 없음

```bash
# .env.local에 추가
ODSAY_API_KEY=<your-odsay-api-key>

# 대중교통 경로 조회 (dev 서버 실행 후)
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "name": "대전광역시청",
      "lat": 36.3504,
      "lng": 127.3845
    },
    "destination": {
      "name": "충남대학교병원",
      "lat": 36.3166,
      "lng": 127.4156
    }
  }'

# 테스트 실행
npm run test
```

### 작업 13

- lib/weather/types.ts — `WeatherRiskRequest`, `WeatherRiskResult`, `KmaForecastItem`, `KmaForecastResponse` 최소 타입 정의
- lib/weather/convertGrid.ts — 위경도 → 기상청 단기예보 격자 좌표(nx, ny) 변환 순수 함수 (Lambert Conformal Conic, 기상청 공식 계수 사용). 변환 실패 시 대전 기본 격자(nx=67, ny=100) 반환
- lib/weather/normalizeWeatherForecast.ts — KMA 단기예보 원본 응답 → `WeatherRisk` 변환. TMP·PTY·SKY·WSD·POP 기반 condition, riskScore, riskNote 산정. 파싱 실패/경로 없음 시 null 반환
- lib/weather/getWeatherRisk.ts — 서버 전용 기상청 API 호출. API key 누락/좌표 오류/HTTP 오류/예보 없음 모두 `sampleWeather` fallback 반환
- lib/weather/index.ts — Weather 모듈 re-export
- app/api/weather/route.ts — GET: 대전 기본 위치 기준, POST: body lat/lng 기준 날씨 조회 → 실패 시 fallback
- app/api/analyze/route.ts — ODsay·Weather 조회를 병렬(Promise.all) 실행. 날씨 riskScore를 `calculateDrivingRisk`의 weatherRiskScore에 반영. `fallbackFlags.weather` 실제 source에 따라 업데이트
- types/index.ts — `WeatherSource = "KMA" | "FALLBACK"`, `WeatherRisk.riskScore?: number` 추가
- tests/weather/normalizeWeatherForecast.test.ts — 정규화 함수 10개 테스트 (맑음/비 변환, riskScore 범위, 금지 표현 검증)
- tests/weather/getWeatherRisk-fallback.test.ts — fallback 동작 + 격자 변환 12개 테스트 (API key 없음, NaN 좌표, 대전 격자값 검증)

구조:
- `WEATHER_API_KEY`는 공공데이터포털 "기상청_단기예보 조회서비스" 일반 인증키(serviceKey)
- 서버 전용 환경변수 (NEXT_PUBLIC_ 접두사 없음, 클라이언트 노출 금지)
- 날씨 실패 시 `sampleWeather` fallback 자동 적용 — 화면이 깨지지 않음
- riskScore는 운전 위험 지수 참고 기상 가중치이며 실제 사고 가능성이 아님
- 아직 Kakao Local 좌표 검색, Kakao Map, Claude 연동은 없음

```bash
# .env.local에 추가
WEATHER_API_KEY=<공공데이터포털 기상청 단기예보 조회서비스 serviceKey>

# 대전 기본 위치 날씨 조회 (dev 서버 실행 후)
curl http://localhost:3000/api/weather

# 특정 좌표 날씨 조회
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 36.3504,
    "lng": 127.3845
  }'

# 테스트 실행
npm run test
```

### 작업 14

- lib/report/reportSafety.ts — `FORBIDDEN_REPORT_TERMS` 목록, `containsForbiddenReportTerms()`, `sanitizeReportText()`, `validateReportContent()` 안전 검사 유틸
- lib/report/normalizeClaudeReport.ts — Claude 응답 텍스트 → `ReportContent` 변환. JSON 파싱 실패 시 raw text 경로, 금지 표현·필수 필드 누락 시 null 반환
- lib/report/generateClaudeReport.ts — 서버 전용 Claude API 호출. API key 누락·타임아웃(15s)·응답 오류·안전 검사 실패 시 `generateTemplateReport` fallback 반환
- lib/report/index.ts — Claude 연동 함수 추가 re-export
- app/api/report/route.ts — POST: `AnalysisResult` 기반 Claude 리포트 생성 시도 → 실패 시 template fallback. 항상 200 응답.
- app/api/analyze/route.ts — `analysisData` 생성 후 `generateClaudeReport` 호출 → `report` 반영. `fallbackFlags.report` source에 따라 업데이트. Supabase 저장은 최종 report 반영 후 실행.
- tests/report/reportSafety.test.ts — 금지 표현 감지·치환·필드 검증 테스트
- tests/report/generateClaudeReport-fallback.test.ts — API key 없는 환경 fallback 동작 테스트 (실제 Claude 호출 없음)

구조:
- `ANTHROPIC_API_KEY`는 서버 전용 환경변수 (NEXT_PUBLIC_ 접두사 없음, 클라이언트·응답·로그 노출 금지)
- Claude 실패 시 `generateTemplateReport` fallback 자동 적용 — 화면이 깨지지 않음
- Claude 응답도 안전 검사(`validateReportContent`) 통과 후에만 사용
- 아직 Kakao Local 좌표 검색, Kakao Map 연동은 없음

```bash
# .env.local에 추가
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# @anthropic-ai/sdk 설치
npm install @anthropic-ai/sdk

# Claude 리포트 생성 (dev 서버 실행 후)
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "analysis": {
      "id": "sample-analysis-daejeon-001"
    }
  }'

# 테스트 실행
npm run test
```

Claude 실패 시 응답 예시 (TEMPLATE fallback):
```json
{
  "ok": true,
  "mode": "CLAUDE_OR_TEMPLATE",
  "data": { "title": "...", "familyMessage": "...", "generatedBy": "TEMPLATE" },
  "meta": { "source": "TEMPLATE", "fallback": true, "reason": "ANTHROPIC_API_KEY가 설정되지 않았습니다." }
}
```

> 다음 작업: 사용자가 지정할 예정

#### Supabase 환경변수 설정

`.env.local.example`을 복사 후 값을 채운다.

```bash
cp .env.local.example .env.local
```

`.env.local` 필수 항목:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # 서버 전용, 클라이언트 노출 금지
```

### 작업 15

- lib/kakao/types.ts — `KakaoPlaceSearchRequest`, `KakaoPlaceSearchResult`, `KakaoPlaceDocument`, `KakaoLocalRawResponse` 최소 타입 정의
- lib/kakao/normalizeKakaoPlace.ts — Kakao Local 원본 응답 → `Place[]` 변환 순수 함수. x→lng, y→lat 올바르게 매핑. 좌표 파싱 실패 항목 제외, 중복 제거.
- lib/kakao/searchPlace.ts — 서버 전용 Kakao Local API 호출. API key 누락·타임아웃(5s)·HTTP 오류·결과 없음 모두 `samplePlaces` fallback 반환. 검색어에 "대전" 없으면 접두어 자동 추가.
- lib/kakao/index.ts — Kakao 모듈 re-export
- app/api/kakao/search/route.ts — POST/GET: 장소 검색 → 실패 시 fallback. `KAKAO_REST_API_KEY` 응답에 노출 금지. 항상 200 응답.
- components/analyze/PlaceInput.tsx — 실제 검색 UI로 확장. debounce 400ms, 2글자 미만 자동검색 미실행, 검색 버튼 제공(고령자 UX). 결과 드롭다운, 키보드 접근성(↑↓, Enter, Escape). 내부 query 상태 독립 관리로 순환 업데이트 없음.
- components/analyze/AnalyzeForm.tsx — Place 객체 중심 상태 관리. `key` 변경으로 PlaceInput 재마운트 시 initialValue 반영. `originPlace`/`destPlace` 모두 선택 시에만 제출 활성화.
- lib/fallback/samplePlaces.ts — 장소 8개로 보강 (대전복합터미널, 한밭수목원 추가). `source: "SAMPLE"` 필드 추가.
- types/index.ts — `Place`에 `category?`, `phone?`, `source?` optional 추가. `PlaceSearchSource` 타입 추가.
- tests/kakao/normalizeKakaoPlace.test.ts — 정규화 함수 8개 테스트 (x/y → lng/lat 변환, 좌표 오류 제외, 중복 제거, 금지 입력 등)
- tests/kakao/searchPlace-fallback.test.ts — fallback 동작 10개 테스트 (API key 없음, 빈 query, key 노출 검증, 금지 표현 검증)

구조:
- `KAKAO_REST_API_KEY`는 서버 전용 환경변수 (NEXT_PUBLIC_ 접두사 없음, 클라이언트 노출 금지)
- Kakao Local 실패 시 `samplePlaces` fallback 자동 적용 — 화면이 깨지지 않음
- 클라이언트는 `/api/kakao/search`만 호출. Kakao 직접 호출 없음.
- 실제 지도 표시, 마커, Kakao Map SDK는 아직 연동하지 않음

```bash
# .env.local에 추가
KAKAO_REST_API_KEY=<kakao-rest-api-key>

# 장소 검색 (dev 서버 실행 후)
curl -X POST http://localhost:3000/api/kakao/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "대전광역시청",
    "size": 5
  }'

# 테스트 실행
npm run test
```

### 작업 15.5

- types/kakao-map.d.ts — Kakao Map SDK 전역 Window 타입 최소 선언 (Map, LatLng, Marker, Polyline, LatLngBounds)
- components/map/types.ts — `MapPoint`, `KakaoMapProps`, `MapLoadState` 타입 정의
- components/map/mapUtils.ts — 순수 유틸: `isValidCoordinate`, `createMapPointFromPlace`, `getMapCenter`, `getDaejeonDefaultCenter`
- components/map/MapFallback.tsx — SDK 누락·좌표 없음·오류 시 fallback UI. 과도한 오류 메시지 미노출.
- components/map/MapLegend.tsx — 출발지/도착지/참고선 범례. "실제 이동 경로가 아닙니다" 명시.
- components/map/KakaoMap.tsx — `"use client"` 컴포넌트. `autoload=false` + `kakao.maps.load()` 패턴. 중복 script 삽입 방지. API key 없으면 MapFallback. SDK 오류 시 MapFallback.
- components/map/MapSection.tsx — `AnalysisResult`에서 origin/destination을 MapPoint로 변환. 좌표 있으면 KakaoMap + MapLegend, 없으면 MapFallback.
- components/map/index.ts — 맵 모듈 re-export
- components/result/ResultPageView.tsx — `MapPlaceholder` → `MapSection`으로 교체. /result/test·/result/[id] 모두 지도 섹션 표시.
- tests/map/mapUtils.test.ts — 순수 함수 10개 테스트 (유효 좌표, 잘못된 좌표, Place→MapPoint, 중심 좌표, 기본 대전 좌표, 금지 표현 검증)

구조:
- `NEXT_PUBLIC_KAKAO_MAP_KEY`는 Kakao Map JavaScript SDK용 앱 키 (public 환경변수)
- `KAKAO_REST_API_KEY`는 계속 서버 전용 (클라이언트 노출 금지). 두 키는 별도 발급.
- Kakao Map SDK 로드 실패 또는 key 미설정 시 MapFallback 자동 표시 — 페이지 전체가 깨지지 않음
- 지도 선(Polyline)은 출발지-도착지 단순 연결선으로, 실제 도로/대중교통 경로가 아님을 명시
- 카카오 공유 기능은 아직 구현하지 않음

```bash
# .env.local에 추가
NEXT_PUBLIC_KAKAO_MAP_KEY=<kakao-map-js-sdk-app-key>   # Kakao Map JavaScript SDK 앱 키
KAKAO_REST_API_KEY=<kakao-rest-api-key>                 # Kakao Local REST API 서버용 키 (별도 발급)

# 테스트 실행
npm run test
```

### 작업 16

- lib/api/response.ts — `createSuccessResponse` / `createFallbackResponse` Route Handler 응답 헬퍼
- lib/api/errors.ts — `toSafeErrorReason` (stack trace 미포함, 120자 제한) / `getUserFriendlyMessage` (source별 안내 메시지)
- lib/fallback/fallbackFlags.ts — `createDefaultFallbackFlags` / `mergeFallbackFlags` / `hasAnyFallback`
- lib/fallback/createFallbackAnalysis.ts — sampleAnalysis를 deep spread해 새 인스턴스 반환 (원본 mutate 없음)
- app/error.tsx — 전역 에러 경계 (`"use client"`, ErrorState 컴포넌트 사용, dev 환경에서만 message 로그)
- app/result/[id]/loading.tsx — Suspense fallback 로딩 화면 (LoadingState + SkeletonCard)
- types/index.ts — `FallbackFlags`에 `analysis`, `place`, `map`, `storage` 필드 추가. `ExternalSource` 타입 추가.
- lib/fallback/sampleAnalysis.ts — `drivingRisk.description`에서 "사고 확률" 표현 제거
- tests/api/response.test.ts — 응답 헬퍼 / 오류 유틸 테스트 (17개)
- tests/fallback/fallback-stability.test.ts — createFallbackAnalysis / fallbackFlags 테스트 (금지 표현 검증 포함, 16개)

```bash
npm run test  # 175개 테스트 전체 통과
```

### 작업 17

- app/api/health/route.ts — 배포 후 상태 확인용 헬스체크 endpoint (실제 API 호출 없음, 환경변수 존재 여부 boolean만 반환)
- lib/api/healthCheck.ts — 헬스체크 데이터 생성 순수 함수 (테스트 가능)
- .env.local.example — 환경변수 설명 주석 보강 (브라우저 노출 가능 / 서버 전용 구분)
- docs/env-checklist.md — 환경변수 체크리스트 (Vercel 설정 방법, 키 구분, fallback 동작 설명)
- docs/deployment-checklist.md — Vercel 배포 체크리스트 (로컬 확인 → Vercel 연결 → 도메인 설정 → 제출 전 확인)
- tests/api/health.test.ts — 헬스체크 함수 테스트 (환경변수 boolean 확인, 키 값 미노출, 금지 표현 검증)

Vercel 배포 준비가 완료되었습니다.

#### 로컬 확인 명령어

```bash
npm install
npm run test
npm run build
npm run dev
```

#### 배포 후 헬스체크 확인

```bash
curl https://배포도메인/api/health
```

#### 문서 위치

- 환경변수 설정 방법: [docs/env-checklist.md](./docs/env-checklist.md)
- 배포 절차 체크리스트: [docs/deployment-checklist.md](./docs/deployment-checklist.md)

#### 배포 후 확인 URL

| URL | 설명 |
|---|---|
| `/` | 랜딩 페이지 |
| `/analyze` | 분석 입력 화면 |
| `/result/test` | 예시 결과 화면 |
| `/api/health` | 헬스체크 (환경변수 설정 여부 확인) |
| `/api/analyze` (POST) | 분석 요청 |
| `/api/kakao/search` (POST) | 장소 검색 |
| `/api/route` (POST) | 대중교통 경로 |
| `/api/weather` (GET/POST) | 날씨 조회 |
| `/api/report` (POST) | 리포트 생성 |

> 배포 후 실제 API 연동 여부는 각 endpoint를 직접 호출해 확인하세요. 환경변수가 없거나 외부 API가 실패해도 fallback 응답으로 화면이 유지됩니다.

### 작업 18

- tests/qa/expression-rules.test.ts — 표현 원칙 위반 감지 테스트 (sampleAnalysis, sampleRoute, sampleWeather, generateTemplateReport, createFallbackAnalysis)
- tests/qa/fallback-contract.test.ts — fallback 계약 테스트 (각 fallback helper가 올바른 타입 반환, 잘못된 입력에 throw 없음)
- tests/qa/env-safety.test.ts — 환경변수 보안 테스트 (서버 전용 키 NEXT_PUBLIC_ 없음, .env.local.example 실제 값 없음, health check 키 미노출)
- docs/final-qa.md — 최종 QA 문서 (페이지/API/fallback/표현 원칙/환경변수 보안/접근성/배포 확인)
- docs/demo-scenario.md — 공모전 시연 시나리오 (16단계 시연 흐름 + 시연 문구)
- docs/submission-checklist.md — 제출 전 체크리스트 (환경변수, 배포, 표현 원칙, MVP 제외 범위)

```bash
npm run test  # 229개 테스트 전체 통과 (작업 18 완료 기준)
```

---

## 최종 상태 요약

SilverWay MVP 개발 완료. 공모전 제출 가능 상태.

### 로컬 확인 명령어

```bash
npm install
npm run dev
npm run test
npm run build
```

로컬 확인 URL:
```
http://localhost:3000
http://localhost:3000/analyze
http://localhost:3000/result/test
http://localhost:3000/api/health
```

### 배포 후 확인

```bash
curl https://배포도메인/api/health
```

확인 URL:
```
https://배포도메인/
https://배포도메인/analyze
https://배포도메인/result/test
https://배포도메인/api/health
```

### 문서 위치

| 문서 | 경로 |
|---|---|
| 환경변수 체크리스트 | [docs/env-checklist.md](./docs/env-checklist.md) |
| 배포 체크리스트 | [docs/deployment-checklist.md](./docs/deployment-checklist.md) |
| 최종 QA 문서 | [docs/final-qa.md](./docs/final-qa.md) |
| 공모전 시연 시나리오 | [docs/demo-scenario.md](./docs/demo-scenario.md) |
| 제출 전 체크리스트 | [docs/submission-checklist.md](./docs/submission-checklist.md) |

### 표현 원칙

- 위험도 점수 = "운전 위험 지수" (사고 확률 아님)
- 혼잡도 = "과거 패턴 기반 예측형 혼잡도" (실시간 아님)
- 면허 반납 = 가족과 함께 논의할 수 있는 의사결정 보조 관점
- 서비스 = 의사결정 보조 도구 (사고 가능성 단정 금지)

### MVP 제외 범위

- 회원가입 / 로그인 / auth
- 관리자 페이지
- 결제 / 알림
- 카카오 공유 (클립보드 복사는 구현됨)

### fallback 동작

모든 외부 API는 키 미설정 또는 실패 시 자동으로 예시 데이터(fallback)를 반환합니다. 화면이 깨지지 않습니다.

| 실패 항목 | fallback |
|---|---|
| Kakao Local | samplePlaces |
| Kakao Map SDK | MapFallback 컴포넌트 |
| ODsay | sampleRoute |
| 기상청 | sampleWeather |
| Claude | generateTemplateReport |
| Supabase | sampleAnalysis |
