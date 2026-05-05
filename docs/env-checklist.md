# SilverWay 환경변수 체크리스트

## 개요

- 키가 없어도 앱이 깨지지 않습니다. 모든 외부 API는 fallback 응답을 반환합니다.
- 실제 연동 여부는 배포 후 각 API endpoint에서 확인하세요.
- `.env.local`은 절대 git에 커밋하지 마세요.

---

## 로컬 개발 (.env.local)

```bash
cp .env.local.example .env.local
# 이후 .env.local을 열어 실제 값을 채운다
```

---

## 환경변수 목록

### 브라우저 노출 가능 (NEXT_PUBLIC_ 접두사)

| 변수명 | 설명 | 발급처 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(public) key | Supabase 대시보드 > Settings > API |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Kakao Map JavaScript SDK 앱 키 | 카카오 개발자 콘솔 > 내 애플리케이션 > 앱 키 > JavaScript 키 |

### 서버 전용 (NEXT_PUBLIC_ 접두사 절대 사용 금지)

| 변수명 | 설명 | 발급처 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 role key — **절대 클라이언트에 노출 금지** | Supabase 대시보드 > Settings > API |
| `KAKAO_REST_API_KEY` | Kakao Local REST API 키 (`NEXT_PUBLIC_KAKAO_MAP_KEY`와 별도 발급) | 카카오 개발자 콘솔 > 내 애플리케이션 > 앱 키 > REST API 키 |
| `ODSAY_API_KEY` | ODsay 대중교통 경로 API 키 | lab.odsay.com |
| `WEATHER_API_KEY` | 기상청 단기예보 조회서비스 일반 인증키(serviceKey) | 공공데이터포털 (data.go.kr) |
| `ANTHROPIC_API_KEY` | Claude API 키 | console.anthropic.com |

---

## 주요 키 구분 및 주의사항

### KAKAO_REST_API_KEY vs NEXT_PUBLIC_KAKAO_MAP_KEY

- **`KAKAO_REST_API_KEY`**: 카카오 로컬 REST API 호출용. 서버에서만 사용. 응답에 절대 포함하지 않음.
- **`NEXT_PUBLIC_KAKAO_MAP_KEY`**: Kakao Map JavaScript SDK 브라우저 로드용. 같은 앱에서 발급하나 키 종류가 다름.
- 두 키는 카카오 개발자 콘솔에서 별도로 확인해야 합니다.

### WEATHER_API_KEY

- 공공데이터포털(data.go.kr)에서 "기상청_단기예보 조회서비스"를 신청하면 발급되는 **일반 인증키(serviceKey)** 입니다.
- URL에 `serviceKey=` 파라미터로 전달됩니다. 서버 전용으로만 사용하세요.

### SUPABASE_SERVICE_ROLE_KEY

- 서버 전용 admin 권한 키입니다. 클라이언트 번들에 절대 포함되어서는 안 됩니다.
- RLS(Row Level Security)를 우회하므로 서버 Route Handler에서만 사용하세요.

---

## Vercel 환경변수 설정

Vercel 프로젝트 > Settings > Environment Variables에서 아래 값을 입력합니다.

| 변수명 | Production | Preview | Development |
|---|:---:|:---:|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | ✓ | ✓ | ✓ |
| `KAKAO_REST_API_KEY` | ✓ | ✓ | ✓ |
| `ODSAY_API_KEY` | ✓ | (선택) | (선택) |
| `WEATHER_API_KEY` | ✓ | (선택) | (선택) |
| `ANTHROPIC_API_KEY` | ✓ | (선택) | (선택) |

> Preview 환경에서 일부 키를 비워도 fallback 응답으로 화면이 유지됩니다.

---

## fallback 동작 확인

키가 없거나 API 호출이 실패해도 아래 fallback이 자동으로 적용됩니다.

| 실패 항목 | fallback |
|---|---|
| Supabase 연결 실패 | sampleAnalysis 반환 |
| Kakao Local 검색 실패 | samplePlaces 반환 |
| Kakao Map SDK 로드 실패 | MapFallback 컴포넌트 표시 |
| ODsay 경로 조회 실패 | sampleRoute 반환 |
| 기상청 API 실패 | sampleWeather 반환 |
| Claude API 실패 | generateTemplateReport 반환 |

배포 후 `/api/health`에서 각 키의 설정 여부를 확인할 수 있습니다.
