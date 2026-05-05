# SilverWay Vercel 배포 체크리스트

## 1. 로컬 확인

배포 전 로컬에서 아래 명령을 순서대로 실행하고 모두 성공하는지 확인합니다.

```bash
npm install        # 의존성 설치
npm run test       # 테스트 전체 통과 확인
npm run build      # 빌드 성공 확인
npm run dev        # 개발 서버 실행 후 주요 페이지 확인
```

로컬 확인 URL:
- http://localhost:3000
- http://localhost:3000/analyze
- http://localhost:3000/result/test
- http://localhost:3000/api/health

---

## 2. Vercel 프로젝트 연결

1. [vercel.com](https://vercel.com) 로그인
2. **Add New Project** > GitHub repository 연결
3. 프레임워크 설정:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: 기본값 유지 (`.next`)
4. **Environment Variables** 설정 (아래 3번 참조)
5. **Deploy** 버튼 클릭

---

## 3. 환경변수 설정

Vercel 프로젝트 > Settings > Environment Variables에서 값을 입력합니다.

자세한 내용은 [docs/env-checklist.md](./env-checklist.md)를 참조하세요.

필수 입력 목록:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_KAKAO_MAP_KEY
KAKAO_REST_API_KEY
ODSAY_API_KEY
WEATHER_API_KEY
ANTHROPIC_API_KEY
```

> 키가 없어도 앱이 fallback으로 동작합니다. 단, 실제 API 연동은 키 설정 후에만 가능합니다.

---

## 4. 배포 후 확인 URL

배포 완료 후 아래 URL을 순서대로 확인합니다.

### 페이지
- `https://배포도메인/` — 랜딩 페이지
- `https://배포도메인/analyze` — 분석 입력 화면
- `https://배포도메인/result/test` — 예시 결과 화면
- `https://배포도메인/result/mock-test` — 동적 결과 화면 (fallback)

### API endpoints
- `https://배포도메인/api/health` — 헬스체크 (환경변수 설정 여부 확인)
- `https://배포도메인/api/analyze` (POST) — 분석 요청
- `https://배포도메인/api/route` (POST) — 대중교통 경로
- `https://배포도메인/api/weather` (GET/POST) — 날씨 조회
- `https://배포도메인/api/report` (POST) — 리포트 생성
- `https://배포도메인/api/kakao/search` (POST) — 장소 검색

헬스체크 확인 명령:
```bash
curl https://배포도메인/api/health
```

정상 응답 예시:
```json
{
  "ok": true,
  "service": "SilverWay",
  "status": "ready",
  "environment": "production",
  "checks": {
    "supabaseUrl": true,
    "kakaoRestApiKey": true,
    ...
  },
  "message": "SilverWay health check is available."
}
```

---

## 5. 커스텀 도메인 설정 (silverway.codegenie.co.kr)

1. Vercel 프로젝트 > Settings > Domains
2. `silverway.codegenie.co.kr` 입력 후 Add
3. Vercel이 안내하는 DNS 레코드를 DNS 관리 콘솔에 추가:
   - **CNAME**: `silverway.codegenie.co.kr` → `cname.vercel-dns.com`
   - 또는 Vercel이 제공하는 A 레코드 사용
4. DNS 전파 후 HTTPS 자동 적용 확인 (Let's Encrypt 자동 발급)

> DNS 변경은 도메인 관리 업체(가비아, Route53 등)에서 직접 수행해야 합니다.

---

## 6. fallback 동작 검증

Preview 환경에서 일부 키를 의도적으로 비워도 화면이 유지되는지 확인합니다.

- `ODSAY_API_KEY` 없음 → `/api/route` fallback 응답 확인
- `ANTHROPIC_API_KEY` 없음 → `/api/report` template fallback 확인
- `NEXT_PUBLIC_KAKAO_MAP_KEY` 없음 → 지도 영역에 MapFallback 표시 확인
- Supabase 미연결 → `/result/[id]` sampleAnalysis fallback 확인

---

## 7. 제출 전 최종 확인

- [ ] `npm run test` 전체 통과
- [ ] `npm run build` 성공
- [ ] `/api/health` 200 응답 확인
- [ ] 모든 페이지에서 "사고 확률", "예측 확률", "probability" 표현 없음
- [ ] 혼잡도 관련 문구가 "과거 패턴 기반 예측형 혼잡도"로 표시됨
- [ ] 면허 반납 관련 문구가 가족 논의 보조 관점으로 표현됨
- [ ] 카카오 공유 버튼 없음
- [ ] 회원가입/로그인 없음
- [ ] 서버 전용 키가 브라우저 응답에 노출되지 않음
- [ ] HTTPS 적용 확인
- [ ] 커스텀 도메인 접속 확인
