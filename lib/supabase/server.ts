import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getPublicEnv, getServerEnv } from "./env";

/**
 * Route Handler / Server Action에서 사용하는 anon key 기반 server client.
 * 환경변수가 없으면 null을 반환한다.
 */
export function createServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[SilverWay] Supabase 서버 클라이언트를 생성할 수 없습니다. .env.local을 확인하세요.");
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * RLS를 우회해야 하는 서버 전용 작업에 사용하는 admin client.
 * service role key는 절대 클라이언트 번들에 포함되어선 안 된다.
 * 이 함수는 server 파일(Route Handler, scripts 등)에서만 호출한다.
 */
export function createAdminClient() {
  const { supabaseUrl } = getPublicEnv();
  const { serviceRoleKey } = getServerEnv();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[SilverWay] Supabase admin 클라이언트를 생성할 수 없습니다. SUPABASE_SERVICE_ROLE_KEY를 확인하세요.");
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
