import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getPublicEnv } from "./env";

/**
 * 브라우저 / 클라이언트 컴포넌트에서 사용하는 Supabase client.
 * 환경변수가 없으면 null을 반환한다 — auth는 아직 사용하지 않는다.
 */
export function createBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[SilverWay] Supabase 브라우저 클라이언트를 생성할 수 없습니다. .env.local을 확인하세요.");
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
