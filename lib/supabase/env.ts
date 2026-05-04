// 환경변수 누락 시 앱 전체가 즉시 깨지지 않도록 null-safe 구조로 읽는다.
// 서버 전용 키(SUPABASE_SERVICE_ROLE_KEY)는 이 파일 밖으로 노출하지 않는다.

function warnIfMissing(key: string, value: string | undefined): string | undefined {
  if (!value) {
    console.warn(`[SilverWay] 환경변수 누락: ${key}`);
  }
  return value;
}

/** 브라우저·서버 공통으로 사용하는 public 환경변수 */
export function getPublicEnv() {
  return {
    supabaseUrl: warnIfMissing(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    supabaseAnonKey: warnIfMissing(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  };
}

/** 서버 전용 환경변수. 클라이언트 번들에 포함되지 않도록 서버 파일에서만 호출한다. */
export function getServerEnv() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn("[SilverWay] 환경변수 누락: SUPABASE_SERVICE_ROLE_KEY — admin client를 생성할 수 없습니다.");
  }
  return { serviceRoleKey };
}
