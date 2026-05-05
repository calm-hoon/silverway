# SilverWay 최종 QA 문서

## QA 목적

공모전 제출 전 SilverWay MVP의 기능 안정성, 표현 원칙 준수, 환경변수 보안, fallback 동작을 종합 점검한다.

---

## 현재 MVP 범위

| 항목 | 상태 |
|---|---|
| 분석 입력 화면 (`/analyze`) | 완료 |
| 장소 검색 (Kakao Local) | 완료 (fallback 포함) |
| 대중교통 경로 (ODsay) | 완료 (fallback 포함) |
| 날씨 조회 (기상청 단기예보) | 완료 (fallback 포함) |
| Claude 리포트 생성 | 완료 (template fallback 포함) |
| 결과 화면 (`/result/[id]`) | 완료 |
| Supabase 저장/조회 | 완료 (fallback 포함) |
| Kakao Map 지도 표시 | 완료 (MapFallback 포함) |
| 헬스체크 (`/api/health`) | 완료 |
| 예시 결과 (`/result/test`) | 완료 |

## MVP 제외 범위

- 회원가입 / 로그인 / auth
- 관리자 페이지
- 결제
- 알림 (푸시 등)
- 카카오 공유 (클립보드 복사는 구현됨)
- 실시간 대중교통 혼잡도 (AFC 과거 패턴 기반 예측형 혼잡도만 사용)

---

## 로컬 실행 확인

```bash
npm install      # 의존성 설치
npm run test     # 테스트 전체 실행
npm run build    # 프로덕션 빌드
npm run dev      # 개발 서버 실행
```

로컬 확인 URL:
- http://localhost:3000
- http://localhost:3000/analyze
- http://localhost:3000/result/test
- http://localhost:3000/api/health

---

## 빌드 확인

| 명령 | 결과 |
|---|---|
| `npm run test` | 229개 테스트 통과 (작업 18 완료 기준) |
| `npm run build` | 성공 (Next.js 16.2.4 Turbopack) |
| `npm run lint` | 프로젝트 eslint 설정 기준 확인 필요 |

> **lint 참고**: `package.json`의 lint 스크립트는 `eslint` (next lint 대신). 현재 프로젝트 eslint 설정에 따라 결과가 다를 수 있다.

---

## 주요 페이지 확인

| 페이지 | 설명 | 확인 방법 |
|---|---|---|
| `/` | 랜딩 페이지 | 브라우저 접속 |
| `/analyze` | 분석 입력 화면 | 장소 검색 및 폼 제출 |
| `/result/test` | 예시 결과 화면 | sampleAnalysis 기반 |
| `/result/[id]` | 동적 결과 화면 | 분석 후 resultId로 접속 |
| 존재하지 않는 경로 | 404 처리 | `/not-found-test` 접속 |

---

## 주요 API 확인

| endpoint | 방법 | 정상 응답 |
|---|---|---|
| `GET /api/health` | curl | `{"ok":true,"status":"ready"}` |
| `POST /api/analyze` | curl (하단 참조) | `{"ok":true,"resultId":"..."}` |
| `GET /api/result/[id]` | curl | `{"ok":true,"data":{...}}` |
| `POST /api/kakao/search` | curl | `{"ok":true,"data":[...]}` |
| `POST /api/route` | curl | `{"ok":true,"data":{...}}` |
| `GET /api/weather` | curl | `{"ok":true,"data":{...}}` |
| `POST /api/report` | curl | `{"ok":true,"data":{...}}` |

**분석 요청 예시:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"name":"대전광역시청","address":"대전 서구 둔산로 100","lat":36.3504,"lng":127.3845},
    "destination": {"name":"충남대학교병원","address":"대전 중구 문화로 282","lat":36.3166,"lng":127.4156},
    "departureTime": "2026-05-04T10:00:00+09:00",
    "ageGroup": "70s"
  }'
```

---

## 외부 API 연동 확인 (수동)

| 서비스 | 확인 방법 | 실제 연동 판별 |
|---|---|---|
| Kakao Local | `/analyze`에서 "대전광역시청" 검색 후 목록 확인 | `source` 필드가 `"SAMPLE"`이 아니면 실제 연동 |
| Kakao Map | `/result/test` 접속 후 지도 마커 확인 | 지도가 표시되면 실제 연동, MapFallback이면 key 미설정 |
| ODsay | `POST /api/route` 응답의 `meta.routeSource` 확인 | `"ODSAY"` → 실제 연동, `"FALLBACK"` → fallback |
| 기상청 | `GET /api/weather` 응답의 `meta.weatherSource` 확인 | `"KMA"` → 실제 연동, `"FALLBACK"` → fallback |
| Claude | `POST /api/report` 응답의 `meta.reportSource` 확인 | `"CLAUDE"` → 실제 연동, `"TEMPLATE"` → fallback |
| Supabase | `/api/analyze` 응답의 `resultId` 확인 후 `/api/result/[resultId]` 조회 | DB uuid 형식이면 실제 저장 |

---

## fallback 확인

| 시나리오 | 예상 동작 |
|---|---|
| `KAKAO_REST_API_KEY` 없음 | `/api/kakao/search` samplePlaces fallback 반환, 200 |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` 없음 | 지도 영역에 MapFallback 표시, 페이지 깨짐 없음 |
| `ODSAY_API_KEY` 없음 | `/api/route` sampleRoute fallback 반환, 200 |
| `WEATHER_API_KEY` 없음 | `/api/weather` sampleWeather fallback 반환, 200 |
| `ANTHROPIC_API_KEY` 없음 | `/api/report` template fallback 반환, 200 |
| Supabase 환경변수 없음 | `/api/analyze` mock id 반환, `/result/[id]` sampleAnalysis 표시, 200 |
| 잘못된 result id | `/result/abc-invalid` sampleAnalysis fallback 표시, 200 |
| 외부 API timeout | 각 API가 내부 AbortController로 취소 후 fallback 반환 |

---

## 표현 원칙 확인

자동 테스트: `tests/qa/expression-rules.test.ts`

| 원칙 | 상태 |
|---|---|
| "사고 확률" 표현 없음 | 테스트 통과 |
| "예측 확률" 표현 없음 | 테스트 통과 |
| "probability" 표현 없음 (사용자 facing) | 테스트 통과 |
| "실시간 혼잡도" 표현 없음 | 테스트 통과 |
| "운전 금지" 표현 없음 | 테스트 통과 |
| "반드시 반납" 표현 없음 | 테스트 통과 |
| "운전 위험 지수" 표현 포함 | 테스트 통과 |
| "과거 패턴 기반 예측형 혼잡도" 표현 포함 | 테스트 통과 |

수동 확인:
- [ ] `/result/test` 화면에서 "운전 위험 지수" 확인
- [ ] 혼잡도 관련 텍스트가 "과거 패턴 기반 예측형 혼잡도"로 표시됨 확인
- [ ] 면허 반납 관련 문구가 강요 없이 가족 논의 관점으로 표현됨 확인

---

## 환경변수 보안 확인

자동 테스트: `tests/qa/env-safety.test.ts`

| 항목 | 상태 |
|---|---|
| 서버 전용 키에 NEXT_PUBLIC_ 없음 | 테스트 통과 |
| `.env.local.example`에 실제 값 없음 | 테스트 통과 |
| health check 응답에 키 값 미노출 | 테스트 통과 |
| 클라이언트 컴포넌트에 서버 키 참조 없음 | 테스트 통과 |

수동 확인:
- [ ] 브라우저 DevTools > Network에서 API 응답에 서버 키 값이 노출되지 않음 확인
- [ ] `NEXT_PUBLIC_*` 변수 외 서버 키가 클라이언트 번들에 포함되지 않음 확인

---

## 접근성 / 고령자 친화 확인 (수동)

- [ ] 주요 버튼 터치 영역 44px 이상 (Button 컴포넌트 minHeight 52px로 설정됨)
- [ ] 기본 글자 크기 18px (layout.tsx font-size 설정 확인)
- [ ] 색상 대비가 지나치게 낮지 않음 (--sw-ink / --sw-bg 토큰 확인)
- [ ] 위험도 HIGH 표현이 과도하게 자극적이지 않음 (DrivingRiskCard 확인)
- [ ] 안내 문구가 짧고 이해하기 쉬움 (AnalyzeNotice, FallbackNotice 확인)
- [ ] 모바일 화면에서 입력 흐름이 자연스러움 (iPhone 시뮬레이터 또는 Chrome 모바일 뷰 확인)
- [ ] 복사하기 버튼이 명확히 표시됨 (FamilyReportCard 확인)
- [ ] fallback 안내가 불안감을 주지 않음 ("예시 데이터를 함께 사용했습니다" 수준)

---

## 모바일 화면 확인 (수동)

- [ ] Chrome DevTools 모바일 뷰 (375px, 390px) 에서 각 페이지 확인
- [ ] 분석 입력 폼이 모바일에서 정상 표시됨
- [ ] 결과 카드가 세로로 잘 쌓임
- [ ] 지도 영역이 모바일에서 적절한 크기로 표시됨

---

## 배포 환경 확인 (수동)

배포 후 아래 URL을 확인합니다.

```bash
curl https://배포도메인/api/health
```

- [ ] `https://배포도메인/` 접속 가능
- [ ] `https://배포도메인/analyze` 접속 가능
- [ ] `https://배포도메인/result/test` 접속 가능
- [ ] `https://배포도메인/api/health` 200 응답
- [ ] `https://silverway.codegenie.co.kr` 커스텀 도메인 접속
- [ ] HTTPS 적용 확인

자세한 배포 절차: [deployment-checklist.md](./deployment-checklist.md)

---

## 남은 이슈 / 추후 개선

| 이슈 | 우선순위 | 메모 |
|---|---|---|
| Supabase RLS 미적용 | 낮음 (MVP 범위 외) | 실제 서비스 전환 시 적용 필요 |
| 카카오 공유 미구현 | 낮음 (MVP 제외) | 클립보드 복사로 대체됨 |
| ODsay 도보 혼잡도 없음 | 낮음 | AFC 기반 대체 사용 중 |
| 실제 사고 공공데이터 미연동 | 중간 | 현재 샘플 데이터 사용 |
| Claude 응답 JSON 파싱 오류 시 template fallback | 낮음 | 의도된 fallback 동작 |
| next lint 경고 가능성 | 낮음 | 빌드 영향 없음 |

---

## 제출 전 최종 판정

- [x] `npm run test` 통과
- [x] `npm run build` 성공
- [x] fallback 계약 테스트 통과
- [x] 표현 원칙 테스트 통과
- [x] 환경변수 보안 테스트 통과
- [ ] 배포 후 헬스체크 확인 (수동)
- [ ] 실제 API 연동 여부 확인 (수동)
- [ ] 모바일 화면 확인 (수동)
- [ ] 커스텀 도메인 연결 확인 (수동)
