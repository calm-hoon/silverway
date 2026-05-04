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

> 다음 작업: **작업 8.5. 디자인 시스템 정의**
>
> ⚠️ 작업 8.5부터 디자인/벤치마킹 반영이 시작될 수 있습니다. 시작 전에 반드시 큰 제목으로 알려줍니다.

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
