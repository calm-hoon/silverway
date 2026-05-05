# SilverWay 공모전 제출 전 체크리스트

2026 대전광역시 공공데이터·AI 활용 창업경진대회 제출 전 최종 점검 항목

---

## 서비스 기본 정보

- [ ] **서비스명**: SilverWay
- [ ] **한 줄 정의**: "AI 기반 고령자 이동 및 면허 반납 의사결정 지원 서비스"
- [ ] **배포 URL**: `https://silverway.codegenie.co.kr` (또는 Vercel 기본 도메인)
- [ ] **GitHub repository**: 최신 코드 push 확인

---

## 코드 및 문서 준비

- [ ] README.md 최신화 확인 (작업 18 완료 내용 포함)
- [ ] `docs/env-checklist.md` 존재 확인
- [ ] `docs/deployment-checklist.md` 존재 확인
- [ ] `docs/demo-scenario.md` 존재 확인
- [ ] `docs/final-qa.md` 존재 확인

---

## 환경변수 설정

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정됨 (서버 전용)
- [ ] `NEXT_PUBLIC_KAKAO_MAP_KEY` 설정됨
- [ ] `KAKAO_REST_API_KEY` 설정됨 (서버 전용)
- [ ] `ODSAY_API_KEY` 설정됨 (서버 전용)
- [ ] `WEATHER_API_KEY` 설정됨 (서버 전용, 공공데이터포털 serviceKey)
- [ ] `ANTHROPIC_API_KEY` 설정됨 (서버 전용)

> 키가 없어도 fallback으로 서비스가 동작합니다. 단, 실제 API 연동을 위해서는 키 설정 필수.

---

## Supabase 확인

- [ ] Supabase 프로젝트 생성 확인
- [ ] `supabase/migrations/001_init_schema.sql` migration 적용 확인
- [ ] (선택) `supabase/seed.sql` seed 데이터 삽입 확인
- [ ] `analysis_logs` 테이블 존재 확인
- [ ] `/api/analyze` POST 후 DB 저장 확인

---

## 빌드 및 테스트

- [ ] `npm run test` 전체 통과
- [ ] `npm run build` 성공
- [ ] TypeScript 오류 없음

---

## 배포 확인

- [ ] Vercel 배포 성공
- [ ] `https://배포도메인/` 접속 가능
- [ ] `https://배포도메인/analyze` 접속 가능
- [ ] `https://배포도메인/result/test` 접속 가능
- [ ] `https://배포도메인/api/health` 200 JSON 응답
- [ ] `https://배포도메인/api/analyze` POST 200 응답
- [ ] HTTPS 적용 확인
- [ ] (선택) `https://silverway.codegenie.co.kr` 커스텀 도메인 접속 확인

---

## 주요 기능 시연 가능 여부

- [ ] 장소 검색 (Kakao Local 또는 fallback) 동작 확인
- [ ] 분석 요청 후 결과 화면 이동 확인
- [ ] 운전 위험 지수 표시 확인
- [ ] 대중교통 대안 표시 확인
- [ ] 과거 패턴 기반 예측형 혼잡도 표시 확인
- [ ] 기상 정보 표시 확인
- [ ] 가족 공유 리포트 표시 확인
- [ ] 리포트 복사하기 버튼 동작 확인
- [ ] 지도 표시 확인 (또는 MapFallback)

---

## fallback 시연 가능 여부

- [ ] `/result/test` 예시 결과 화면 항상 표시 확인
- [ ] 일부 API 키 없이도 화면이 깨지지 않음 확인
- [ ] fallback 안내 문구 표시 확인

---

## 표현 원칙 최종 확인

- [ ] "사고 확률" 표현이 사용자 화면에 없음
- [ ] "예측 확률" 표현이 사용자 화면에 없음
- [ ] "실시간 혼잡도" 표현이 사용자 화면에 없음
- [ ] 혼잡도가 "과거 패턴 기반 예측형 혼잡도"로 표시됨
- [ ] 면허 반납 관련 문구가 강요 없이 가족 논의 관점으로 표현됨
- [ ] 운전 위험 지수가 "의사결정 보조" 목적으로 설명됨

---

## MVP 제외 범위 최종 확인

- [ ] 회원가입 / 로그인 화면 없음
- [ ] 관리자 페이지 없음
- [ ] 결제 화면 없음
- [ ] 알림 기능 없음
- [ ] 카카오 공유 버튼 없음 (클립보드 복사만 있음)

---

## 주요 화면 캡처

시연 자료 제출 시 아래 화면 캡처 준비:

- [ ] `/` 랜딩 페이지
- [ ] `/analyze` 입력 화면 (장소 검색 결과 포함)
- [ ] `/result/[id]` 결과 화면 (운전 위험 지수, 대중교통, 날씨, 리포트)
- [ ] 지도 화면 (KakaoMap 또는 MapFallback)
- [ ] `/api/health` 응답 JSON

---

## 최종 제출 자료와 서비스 일치 여부

- [ ] 제출 설명 자료의 서비스명이 "SilverWay"와 일치
- [ ] 제출 설명 자료의 기능 설명이 실제 구현 내용과 일치
- [ ] fallback 동작 방식이 설명 자료에 포함됨
- [ ] 공공데이터 활용 항목이 설명 자료에 포함됨 (기상청, 교통공사 AFC, 사고 패턴)
